import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { NextRequest } from "next/server";
import { UsersValidator } from "../validators/UserSchema";
import { getToken } from "next-auth/jwt";
import {
  getConditionBasedOnScope,
  getConditionBasedOnScopeForFilter,
  getScopeForFilter,
} from "../helpers/getUserScope";
import { checkScopeAccess } from "../helpers/checkScopeAccess";
import { CalculateAverage } from "../helpers/calculateAverage";
import { weightedMomentumBasedOnUser } from "./HealthControllet";
import { Prisma } from "@prisma/client";

export class UserController {
  async getUser(userId: number, roleUuid: string, userUuid: string) {
    try {
      await checkScopeAccess(roleUuid, "view_user", "read");

      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      if (!userId) {
        throw {
          statusCode: 400,
          data: null,
          message: StaticMessage.InvalidUser,
        };
      }

      const scope = await getScopeForFilter(userId);

      let whereCondition = await getConditionBasedOnScopeForFilter(
        scope,
        userId
      );

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
          is_active: whereCondition.is_active,
        },
        select: {
          id: true,
          uuid: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          job_title: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              uuid: true,
              company_name: true,
            },
          },
          user_forum: {
            where: {
              forum: {
                is_active: true,
              },
            },
            select: {
              forum: {
                select: {
                  id: true,
                  uuid: true,
                  forum_name: true,
                  meeting_time: true,
                  meeting_day: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      let { company, user_forum, ...userdetails } = user;

      const forum_info = user_forum.map((item) => item.forum);

      const currentUTCDate = new Date();
      const currentDay = currentUTCDate.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }); // Get the current day name in UTC
      const currentTime = currentUTCDate.toLocaleTimeString("en-GB", {
        hour12: false,
        timeZone: "UTC",
      }); // Get the current time in HH:mm:ss format in UTC

      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      // Sort forums by day and time
      const sortedForums = forum_info.sort((a: any, b: any) => {
        const dayA = daysOfWeek.indexOf(a.meeting_day);
        const dayB = daysOfWeek.indexOf(b.meeting_day);

        if (dayA === dayB) {
          return a.meeting_time.localeCompare(b.meeting_time);
        }
        return dayA - dayB;
      });

      // Find the next upcoming forum
      let upcoming_forum = null;
      for (let i = 0; i < sortedForums.length; i++) {
        const forum = sortedForums[i];
        const forumDayIndex = daysOfWeek.indexOf(forum.meeting_day!);
        const currentDayIndex = daysOfWeek.indexOf(currentDay);

        if (
          forumDayIndex > currentDayIndex ||
          (forumDayIndex === currentDayIndex &&
            forum.meeting_time! > currentTime)
        ) {
          upcoming_forum = forum;
          break;
        }
      }

      // If no future forum was found today or later in the week, wrap around to the next week's forums
      if (!upcoming_forum && sortedForums.length > 0) {
        upcoming_forum = sortedForums[0];
      }

      return {
        message: StaticMessage.CurrentUserInfo,
        data: {
          user_info: {
            ...userdetails,
            company_info: company,
          },
          forums_info: forum_info,
          upcoming_forum: upcoming_forum
            ? {
                uuid: upcoming_forum.uuid,
                forum_name: upcoming_forum.forum_name,
              }
            : null,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUserFilters(userId: number, roleUuid: string, request: any) {
    try {
      await checkScopeAccess(roleUuid, "all_users", "read");

      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const scope = await getScopeForFilter(userId);

      let whereCondition = await getConditionBasedOnScopeForFilter(
        scope,
        userId
      );

      const users = await prisma.user.findMany({
        select: {
          company: {
            select: {
              uuid: true,
              company_name: true,
            },
          },
          user_forum: {
            select: {
              forum: {
                select: {
                  uuid: true,
                  forum_name: true,
                },
              },
            },
          },
        },
        where: {
          AND: [
            whereCondition,
            {
              OR: [
                {
                  first_name: {
                    contains: request.nextUrl.searchParams.get("search"),
                    mode: "insensitive",
                  },
                },
                {
                  last_name: {
                    contains: request.nextUrl.searchParams.get("search"),
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        },
      });

      if (!request.nextUrl.searchParams.get("search")) {
        return {
          message: StaticMessage.FiltersFetchedSuccessfully,
          data: await this.removeDuplicates(users),
        };
      }

      return {
        message: StaticMessage.FiltersFetchedSuccessfully,
        data: await this.removeDuplicates(users),
      };
    } catch (error: any) {
      throw error;
    }
  }

  async removeDuplicates(data: any[]) {
    const uniqueCompanies = Array.from(
      new Set(data.map((u: any) => JSON.stringify(u.company)))
    ).map((userData) => JSON.parse(userData));

    const uniqueForums = Array.from(
      new Set(
        data.flatMap((u: any) =>
          u.user_forum.map((uf: any) => JSON.stringify(uf.forum))
        )
      )
    ).map((forumData) => JSON.parse(forumData));

    return {
      company: uniqueCompanies,
      forum: uniqueForums,
    };
  }

  async getUserDetailsBasedOnFilters(
    userId: number,
    companyId: number,
    roleUuid: string,
    request: any
  ) {
    try {
      await checkScopeAccess(roleUuid, "all_users", "read");

      const searchQuery = request.nextUrl.searchParams.get("search");
      const companyQuery = request.nextUrl.searchParams.get("company");
      const forumQuery = request.nextUrl.searchParams.get("forum");
      const page = Number(request.nextUrl.searchParams.get("page"));
      const limit = Number(request.nextUrl.searchParams.get("limit"));
      const offset = (page - 1) * limit;

      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const scope = await getScopeForFilter(userId);

      let condition = await getConditionBasedOnScope(scope, userId, companyId);

      const isDropdownCondition = request.nextUrl.searchParams.get("isDropdown")
        ? Prisma.sql`AND u.is_active = true`
        : Prisma.empty;

      const usersDetail: any = await prisma.$queryRaw`SELECT
      u.id, u.uuid, u.first_name, u.last_name, u.email, u.phone, u.job_title, u.is_active, u."createdAt", u."updatedAt",
      c.uuid as company_uuid, c.company_name,
      json_agg(json_build_object('forum_uuid', f.uuid, 'forum_name', f.forum_name)) AS forums,
      json_agg(json_build_object('score', upfhs.score)) as scores
      FROM
        "User" u
      LEFT JOIN
        "Company" c ON c.id = u.company_id
      LEFT JOIN
        "Forum" f ON f.id = ANY(SELECT forum_id FROM user_forum WHERE user_id = u.id)
      LEFT JOIN
        "user_per_forum_health_score" upfhs ON upfhs.user_id = u.id AND upfhs.forum_id = f.id
      WHERE
        (${!searchQuery} OR (u.first_name ILIKE '%' || ${searchQuery} || '%' OR u.last_name ILIKE '%' || ${searchQuery} || '%'))
        AND (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${request.nextUrl.searchParams.get(
        "company"
      )}, ',')::UUID[]))
        AND (${!forumQuery} OR (f.uuid = ANY(STRING_TO_ARRAY(${request.nextUrl.searchParams.get(
        "forum"
      )}, ',')::UUID[]) AND f.id IS NOT NULL))
      ${condition}
      ${isDropdownCondition}
      GROUP BY u.id, c.id
      LIMIT ${limit} OFFSET ${offset};`;

      const count: any =
        await prisma.$queryRaw`SELECT CAST(COUNT(*) AS INTEGER) AS total_count
      FROM (SELECT
        u.id, u.uuid, u.first_name, u.last_name, u.email, u.phone, u.job_title, u.is_active, u."createdAt", u."updatedAt",
        c.uuid as company_uuid, c.company_name,
        json_agg(json_build_object('forum_uuid', f.uuid, 'forum_name', f.forum_name)) AS forums,
        json_agg(json_build_object('score', upfhs.score)) as scores
        FROM
          "User" u
        LEFT JOIN
          "Company" c ON c.id = u.company_id
        LEFT JOIN
          "Forum" f ON f.id = ANY(SELECT forum_id FROM user_forum WHERE user_id = u.id)
        LEFT JOIN
          "user_per_forum_health_score" upfhs ON upfhs.user_id = u.id AND upfhs.forum_id = f.id
        WHERE
          (${!searchQuery} OR (u.first_name ILIKE '%' || ${searchQuery} || '%' OR u.last_name ILIKE '%' || ${searchQuery} || '%'))
          AND (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${request.nextUrl.searchParams.get(
          "company"
        )}, ',')::UUID[]))
          AND (${!forumQuery} OR (f.uuid = ANY(STRING_TO_ARRAY(${request.nextUrl.searchParams.get(
          "forum"
        )}, ',')::UUID[]) AND f.id IS NOT NULL))
        ${condition}
        ${isDropdownCondition}
        GROUP BY u.id, c.id
      ) AS subquery`;

      const usersMap: any = {};
      for (let user of usersDetail) {
        const key = user.email;
        if (!usersMap[key]) {
          usersMap[key] = {
            user_info: {
              uuid: user.uuid,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              phone: user.phone,
              job_title: user.job_title,
              is_active: user.is_active,
              createdAt: new Date(user.createdAt)
                .toISOString()
                .replace("T", " ")
                .split(".")[0],
              updatedAt: new Date(user.updatedAt)
                .toISOString()
                .replace("T", " ")
                .split(".")[0],
              company_info: {
                uuid: user.company_uuid,
                company_name: user.company_name,
              },
              forums_info: this.removeDuplicateForum(user.forums),
              health: 0,
            },
          };
        }

        usersMap[key].user_info.health = await weightedMomentumBasedOnUser(
          user.id
        );
      }

      const outputJson = Object.values(usersMap).map((user: any) => {
        delete user.user_info.forum_count;
        return { user_info: user.user_info };
      });

      return {
        message: StaticMessage.GetAllUsersBasedOnSearchAndFilter,
        data: outputJson,
        page_meta: {
          current: page,
          total: Math.ceil(count[0].total_count / limit),
          data_per_page: limit,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  removeDuplicateForum(array: any[]) {
    const seen: any = {};
    return array.filter((item: any) => {
      const { forum_uuid } = item;
      return seen.hasOwnProperty(forum_uuid)
        ? false
        : (seen[forum_uuid] = true);
    });
  }

  async updateUser(body: any, userUuid: string) {
    try {
      await new UsersValidator().UpdateUser(body);
      const existingUser = await prisma.user.findUnique({
        where: {
          uuid: userUuid,
        },
      });

      if (!existingUser) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      const { is_active } = body;
      await prisma.user.update({
        data: {
          is_active,
          updatedAt: new Date(),
        },
        where: {
          uuid: userUuid,
        },
      });

      const message = is_active ? "enabled" : "disabled";

      return {
        message: `User ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getRolePrivileges(request: NextRequest) {
    try {
      const jwt: any = await getToken({ req: request });

      const { role_uuid: roleUuid } = jwt?.data.user_info;

      if (!roleUuid) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserRoleNotExistForTheUser,
        };
      }

      const isUserExist = await prisma.user.findUnique({
        where: {
          uuid: jwt?.data.user_info.uuid,
          is_active: true,
        },
      });

      if (!isUserExist) {
        throw {
          statusCode: 401,
          data: null,
          message: StaticMessage.UnAuthorizedUser,
        };
      }

      const isRoleExist = await prisma.roles.findUnique({
        where: {
          uuid: jwt?.data.user_info.role_uuid,
        },
      });

      if (isRoleExist === null) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserRoleNotExistForTheUser,
        };
      }

      const requestBody = await request.json();

      await new UsersValidator().UserAclRequest(requestBody);

      let response = [];

      for (let item of requestBody) {
        const usersDetail: any = await prisma.$queryRaw`SELECT 
          m.keyword AS module, 
          sm.keyword AS sub_module, 
          a.keyword AS action
          FROM
              "role_privileges" rp
          LEFT JOIN
              "roles" r ON r.uuid = rp.role_uuid
          LEFT JOIN
              "modules" m ON m.uuid = rp.module_uuid
          LEFT JOIN
              "sub_modules" sm ON sm.uuid = rp.sub_module_uuid
          LEFT JOIN
              "actions" a ON a.uuid = rp.action_uuid
          WHERE
          rp.role_uuid = ${roleUuid}
          AND m.keyword = ${item.module}
          AND sm.keyword = ${item.sub_module}
          AND a.keyword = ANY (STRING_TO_ARRAY(${item.actions.join(",")}, ','))
          AND rp.is_active = true
          AND r.is_active = true
          AND m.is_active = true
          AND sm.is_active = true
          AND a.is_active = true
          GROUP BY m.uuid, sm.uuid, a.uuid
          ORDER BY m.order, sm.order ASC;`;
        response.push(this.formatActions(item, usersDetail));
      }

      return {
        message: StaticMessage.UserAclExist,
        data: response,
      };
    } catch (err: any) {
      throw err;
    }
  }

  formatActions(item: any, databaseOutput: any[]) {
    if (!databaseOutput || databaseOutput.length === 0) {
      const formattedActions = item.actions.map((action: string) => ({
        [action]: false,
      }));

      return {
        module: item.module,
        sub_module: item.sub_module,
        actions: formattedActions,
      };
    }

    const formattedActions = item.actions.map((action: string) => {
      const actionExists = databaseOutput.some(
        (item) => item.action === action
      );
      return { [action]: actionExists };
    });

    return {
      module: item.module,
      sub_module: item.sub_module,
      actions: formattedActions,
    };
  }

  async getACL(userUuid: string, roleUuid: string) {
    try {
      const isUserExist = await prisma.user.findUnique({
        where: {
          uuid: userUuid,
          is_active: true,
        },
      });

      if (!isUserExist) {
        throw {
          statusCode: 401,
          data: null,
          message: StaticMessage.UnAuthorizedUser,
        };
      }

      const userRoles: any = await prisma.$queryRaw`SELECT 
          m.uuid AS module_uuid, 
          m.name AS module_name,
          sm.uuid AS sub_module_uuid, 
          sm.name AS sub_module_name, 
          sm.redirect_url AS sub_module_redirect_url
      FROM
          "role_privileges" rp
      LEFT JOIN
          "roles" r ON r.uuid = rp.role_uuid
      LEFT JOIN
          "modules" m ON m.uuid = rp.module_uuid
      LEFT JOIN
          "sub_modules" sm ON sm.uuid = rp.sub_module_uuid
      WHERE
          rp.role_uuid = ${roleUuid}
          AND rp.is_active = true
          AND r.is_active = true
          AND m.is_active = true
          AND sm.is_active = true
      GROUP BY m.uuid, sm.uuid
      ORDER BY m.order, sm.order ASC;`;

      const menuMap = new Map();

      userRoles.forEach((item: any) => {
        const menuItem = menuMap.get(item.module_uuid);
        if (!menuItem) {
          menuMap.set(item.module_uuid, {
            menu: item.module_name,
            sub_menus: [
              {
                sub_menu_item: item.sub_module_name,
                selected_status: false,
                redirect_url: item.sub_module_redirect_url,
              },
            ],
          });
        } else {
          menuItem.sub_menus.push({
            sub_menu_item: item.sub_module_name,
            selected_status: false,
            redirect_url: item.sub_module_redirect_url,
          });
        }
      });

      const data = Array.from(menuMap.values(), ({ menu, sub_menus }) => ({
        menu,
        sub_menu_state: false,
        sub_menus,
      }));

      return {
        message: StaticMessage.UsersACLHadBeenRetrivedSuccessfully,
        data,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUserDetailsByUuid(
    userId: number,
    roleUuid: string,
    userUuid: string
  ) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "view_user", "read");

      const scope = await getScopeForFilter(userId);

      let whereCondition = await getConditionBasedOnScopeForFilter(
        scope,
        userId
      );

      const user = await prisma.user.findFirst({
        where: {
          AND: [{ uuid: userUuid }, whereCondition],
        },
        select: {
          id: true,
          uuid: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          job_title: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              uuid: true,
              company_name: true,
            },
          },
          user_forum: {
            select: {
              forum: {
                select: {
                  uuid: true,
                  forum_name: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      let { company, user_forum, ...userdetails } = user;

      const forum_info = await user_forum.map((item) => {
        return item.forum;
      });

      return {
        message: StaticMessage.UserFetchedSuccessfully,
        data: {
          member_info: {
            ...userdetails,
            company_info: company,
            forums_info: forum_info,
            role: "Forum Lead",
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUserHealthDetailsByUuid(
    userUuid: string,
    from: string,
    to: string,
    forumUuids: string | null
  ) {
    try {
      let forumIds = null;
      let forums = [];

      const user = await prisma.user.findUnique({
        where: {
          uuid: userUuid,
        },
      });

      if (!user) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      if (forumUuids) {
        forumIds = forumUuids.split(",");

        let forumDetail = await prisma.forum.findMany({
          where: {
            uuid: {
              in: forumIds,
            },
          },
          select: {
            id: true,
          },
        });
        forums = forumDetail.map((obj) => obj.id);
      } else {
        let details = await prisma.user_forum_healths.findMany({
          where: {
            user_id: user.id,
          },
          select: {
            forum_id: true,
          },
        });
        forums = details.map((obj) => obj.forum_id);
      }

      if (!forums || (forumIds && forums.length !== forumIds.length)) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      let date = new Date(to);
      date.setDate(date.getDate() + 1);
      to = date.toISOString().split("T")[0];

      let userForumHealth = await prisma.user_per_forum_health_score.findMany({
        where: {
          // forum_id: {
          //   in: forums.map((forum) => forum.id),
          // },
          AND: [
            {
              user_id: user.id,
            },
            {
              date: {
                gte: new Date(from),
                lte: new Date(to),
              },
            },
            {
              ...(forums.length > 0 && {
                forum_id: {
                  in: forums,
                },
              }),
            },
          ],
        },
        select: {
          uuid: true,
          score: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          forum: {
            select: {
              uuid: true,
              forum_name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      userForumHealth.forEach((item: any) => {
        item.health = item.score;
      });

      return {
        message: StaticMessage.HealthScoresOfTheUserRetrievedSuccessfully,
        data: {
          consolidated_health: await weightedMomentumBasedOnUser(user.id),
          historical_health: userForumHealth.map((item) => ({
            uuid: item.uuid,
            date: item.date,
            updatedAt: item.updatedAt,
            forum_info: {
              uuid: item.forum.uuid,
              forum_name: item.forum.forum_name,
            },
            health: parseFloat((item.score || 0).toFixed(2)),
          })),
        },
      };
    } catch (err: any) {
      throw err;
    }
  }
}
