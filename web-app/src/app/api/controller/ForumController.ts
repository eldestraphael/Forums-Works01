import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { CalculateAverage } from "../helpers/calculateAverage";
import {
  AddForumAttendance,
  UpdateForum,
  UpdateForumAttendance,
} from "../infrastructure/dtos/Forum";
import { ForumValidator } from "../validators/ForumValidator";
import { UserPerForumHealthController } from "./UserPerForumHealthController";
import { getScopeForFilter } from "../helpers/getUserScope";
import {
  getConditionBasedOnForumForFilter,
  getConditionBasedOnScopeForForum,
} from "../helpers/getForumScope";
import { checkScopeAccess } from "../helpers/checkScopeAccess";
import { generatePassword } from "../helpers/passwordGenerator";
import * as bcrypt from "bcrypt";
import { EmailController } from "../helpers/emailService";
import { weightedMomentumBasedOnForum } from "./HealthControllet";
import { PushNotificationController } from "../helpers/PushNotificationController";
import { Prisma } from "@prisma/client";

interface RequestBody {
  forum_name: string;
  meeting_day: string;
  meeting_time: string;
  company_uuid: string;
}

export class ForumController {
  async Forum(userId: number, body: any) {
    try {
      await new ForumValidator().Forum(body);
      if (!body.company_id) {
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw {
            message: StaticMessage.UserNotFound,
            data: null,
            statusCode: 404,
          };
        }

        body.company_id = user.company_id;
      }

      const company = await prisma.company.findFirst({
        where: {
          uuid: body.company_uuid,
        },
      });

      if (!company) {
        throw {
          message: StaticMessage.CompanyNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const forum =
        body.user_uuids.length !== 0
          ? await this.createForum(body, company, "createForum")
          : await this.createForum(body, company);

      if (body.user_uuids.length !== 0) {
        await new EmailController().sendForumCreatedEmail(
          forum.data.forum_info
        );
        await new PushNotificationController().sendForumCreatedNotification(
          forum.data.forum_info
        );
      }

      return forum;
    } catch (error: any) {
      throw error;
    }
  }

  async createForum(body: any, company: any, key?: string) {
    try {
      const forum = await prisma.forum.create({
        data: {
          forum_name: body.forum_name,
          meeting_day: body.meeting_day,
          meeting_time: body.meeting_time,
          company_id: company.id,
        },
      });

      const course: any = await prisma.courses.findUnique({
        where: {
          uuid: body.course_uuid,
        },
        select: {
          id: true,
          uuid: true,
          name: true,
          is_active: true,
        },
      });

      if (!course) {
        throw {
          statusCode: 404,
          message: StaticMessage.CourseNotFound,
          data: null,
        };
      }

      let chapter;

      if (body.chapter_uuid) {
        chapter = await prisma.chapters.findUnique({
          where: {
            uuid: body.chapter_uuid,
            course_id: course.id,
          },
          select: {
            id: true,
            uuid: true,
            name: true,
            is_active: true,
          },
        });

        if (!chapter) {
          throw {
            statusCode: 404,
            message: StaticMessage.ChapterNotFound,
            data: null,
          };
        }
      } else {
        chapter = await prisma.chapters.findFirst({
          where: {
            course_id: course.id,
            is_active: true,
          },
          orderBy: { order: "asc" },
        });

        if (!chapter) {
          throw {
            statusCode: 404,
            message: StaticMessage.ChapterNotFound,
            data: null,
          };
        }
      }

      const forumCourse = await prisma.forum_course.create({
        data: {
          forum_id: forum.id,
          course_id: course.id,
          chapter_id: chapter.id,
          starting_date: new Date(body.starting_date),
        },
      });

      if (key === "createForum") {
        if (body.user_uuids.length !== 0) {
          const users = await prisma.user.findMany({
            where: {
              uuid: { in: body.user_uuids },
            },
          });

          const userForumData = users.map((user) => ({
            user_id: user.id,
            forum_id: forum.id,
          }));

          await prisma.user_forum.createMany({
            data: userForumData,
            skipDuplicates: true,
          });

          return {
            message: StaticMessage.FormCreated,
            data: {
              forum_info: {
                id: forum.id,
                uuid: forum.uuid,
                forum_name: forum.forum_name,
                meeting_day: forum.meeting_day,
                meeting_time: forum.meeting_time,
                starting_date: forumCourse.starting_date,
                company_info: {
                  uuid: company.uuid,
                  company_name: company.company_name,
                },
                course_info: {
                  uuid: course.uuid,
                  course_name: course.name,
                },
                chapter_info: chapter
                  ? {
                      uuid: chapter.uuid,
                      chapter_name: chapter.name,
                    }
                  : null,
                users_info: users.map((item) => {
                  return {
                    uuid: item.uuid,
                    id: item.id,
                    first_name: item.first_name,
                    last_name: item.last_name,
                    email: item.email,
                  };
                }),
                updatedAt: forum.updatedAt,
                createdAt: forum.createdAt,
              },
            },
          };
        }
      }
      return {
        message: StaticMessage.FormCreated,
        data: {
          forum_info: {
            id: forum.id,
            uuid: forum.uuid,
            forum_name: forum.forum_name,
            meeting_day: forum.meeting_day,
            meeting_time: forum.meeting_time,
            starting_date: forumCourse.starting_date,
            company_info: {
              uuid: company.uuid,
              company_name: company.company_name,
            },
            course_info: {
              uuid: course.uuid,
              course_name: course.name,
            },
            chapter_info: chapter
              ? {
                  uuid: chapter.uuid,
                  chapter_name: chapter.name,
                }
              : null,
            updatedAt: forum.updatedAt,
            createdAt: forum.createdAt,
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async Search(userId: number, roleUuid: string, request: any) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const scope = await getScopeForFilter(userId);

      let whereCondition = await getConditionBasedOnForumForFilter(
        scope,
        userId
      );

      const forum_info = await prisma.forum.findMany({
        where: {
          AND: [
            {
              forum_name: {
                contains: request.nextUrl.searchParams.get("q"),
                mode: "insensitive",
              },
              is_active: true,
            },
            whereCondition,
          ],
        },
      });

      const updatedForumInfo = await Promise.all(
        forum_info.map(async (item) => {
          const forumCourse = await prisma.forum_course.findFirst({
            where: {
              forum_id: item.id,
            },
          });

          return {
            ...item,
            starting_date: forumCourse?.starting_date,
          };
        })
      );

      return { message: StaticMessage.FormFetched, data: updatedForumInfo };
    } catch (error: any) {
      throw error;
    }
  }

  async getForumFilters(userId: number, roleUuid: string, request: any) {
    try {
      await checkScopeAccess(roleUuid, "all_forums", "read");

      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const scope = await getScopeForFilter(userId);

      let whereCondition = await getConditionBasedOnForumForFilter(
        scope,
        userId
      );

      const searchParam = request.nextUrl.searchParams.get("search");

      let forums;

      forums = await prisma.forum.findMany({
        select: {
          company: {
            select: {
              uuid: true,
              company_name: true,
            },
          },
        },
        where: {
          AND: [
            whereCondition,
            {
              is_active: true,
              ...(searchParam && {
                company: {
                  company_name: {
                    contains: searchParam,
                    mode: "insensitive",
                  },
                },
              }),
            },
          ],
        },
      });

      return {
        message: StaticMessage.FiltersFetchedSuccessfully,
        data: {
          company: Array.from(
            new Map(
              forums.map(({ company }) => [company.uuid, company])
            ).values()
          ),
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getForumByUuid(userId: number, roleUuid: string, forumUuid: string) {
    try {
      if (!roleUuid) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "view_forum", "read");

      const scope = await getScopeForFilter(userId);

      const role = await prisma.roles.findUnique({
        where: {
          uuid: roleUuid,
        },
      });

      if (!role) {
        throw {
          statusCode: 401,
          message: StaticMessage.RoleNotFound,
          data: null,
        };
      }

      const whereCondition = await getConditionBasedOnForumForFilter(
        scope,
        userId,
        role.name
      );

      const forum = await prisma.forum.findFirst({
        where: {
          AND: [{ uuid: forumUuid }, whereCondition],
        },
        select: {
          id: true,
          uuid: true,
          forum_name: true,
          meeting_day: true,
          meeting_time: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              uuid: true,
              company_name: true,
            },
          },
          forum_course: {
            where: {
              is_current_course: true,
            },
            include: {
              chapters: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
              courses: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      const forumCourse = await prisma.forum_course.findFirst({
        where: {
          forum_id: forum.id,
        },
      });

      const company_info = forum.company;
      const course_info = forum.forum_course[0].courses;
      const chapter_info = forum.forum_course[0].chapters;

      const userForum = await prisma.user_forum.findMany({
        where: {
          forum_id: forum.id,
        },
      });

      const userIds = userForum.map((item) => item.user_id);

      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
      });

      if (!users) {
        throw {
          message: StaticMessage.UsersNotFound,
          statusCode: 404,
          data: null,
        };
      }

      return {
        message: StaticMessage.AllInformationRetrievedSuccessfully,
        data: {
          forum_info: {
            id: forum.id,
            uuid: forum.uuid,
            forum_name: forum.forum_name,
            meeting_day: forum.meeting_day,
            meeting_time: forum.meeting_time,
            is_active: forum.is_active,
            company_info: {
              uuid: company_info.uuid,
              company_name: company_info.company_name,
            },
            user_info: users.map((item) => ({
              uuid: item.uuid,
              first_name: item.first_name,
              last_name: item.last_name,
            })),
            course_info: course_info,
            chapter_info: chapter_info,
            starting_date: forumCourse?.starting_date,
            createdAt: forum.createdAt,
            updatedAt: forum.updatedAt,
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async forumByUuid(forumUuid: any) {
    try {
      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
          is_active: true,
        },
        select: {
          id: true,
          uuid: true,
          forum_name: true,
          meeting_day: true,
          meeting_time: true,
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
              user: {
                select: {
                  id: true,
                  uuid: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  phone: true,
                  job_title: true,
                },
              },
            },
          },
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      let { company, user_forum, ...forumdetails } = forum;

      const members = await Promise.all(
        await user_forum.map(async (item) => {
          let mcqOptions = await prisma.user_per_forum_health_score.aggregate({
            where: {
              user_id: item.user.id,
              forum_id: forum.id,
            },
            _avg: {
              score: true,
            },
          });
          return {
            ...item.user,
            health: mcqOptions._avg.score
              ? Math.round(mcqOptions._avg.score as unknown as number)
              : 0,
          };
        })
      );

      return {
        message: StaticMessage.ForumFetchedByUUID,
        data: {
          forum_info: {
            ...forumdetails,
            company_info: company,
            members: members,
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllForum(
    userId: number,
    roleUuid: string,
    pageNumber: string,
    limit: string
  ) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "all_forums", "read");

      const scope = await getScopeForFilter(userId);

      let whereCondition = await getConditionBasedOnForumForFilter(
        scope,
        userId
      );

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw {
          message: StaticMessage.UserNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const forum = await prisma.forum.findMany({
        where: {
          AND: [{ is_active: true }, whereCondition],
        },
        skip: (Number(pageNumber) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          uuid: true,
          forum_name: true,
          meeting_day: true,
          meeting_time: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              uuid: true,
              company_name: true,
            },
          },
        },
      });

      let forumInfo = await Promise.all(
        forum.map(async (item: any) => {
          const forumCourse = await prisma.forum_course.findFirst({
            where: {
              forum_id: item.id,
            },
          });

          item["health"] = await new CalculateAverage().forumHealth(item.id);
          item.starting_date = forumCourse?.starting_date;
          return item;
        })
      );

      const totalForum = await prisma.forum.count({
        where: {
          // company_id: user.company_id,
          is_active: true,
        },
      });

      return {
        message: StaticMessage.ForumFetchedByUUID,
        data: {
          forum_info: forumInfo,
          page_meta: {
            current: Number(pageNumber),
            total: Math.ceil(totalForum / Number(limit)),
            data_per_page: Number(limit),
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateForum(body: UpdateForum, fUuid: string) {
    try {
      await new ForumValidator().updateForum(body);
      const { company_uuid, starting_date, ...forumData } = body;
      const isForumExist = await prisma.forum.findUnique({
        where: {
          uuid: fUuid,
          is_active: true,
        },
      });

      if (!isForumExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      const forumCourse = await prisma.forum_course.findFirst({
        where: {
          forum_id: isForumExist.id,
        },
      });

      let company_info: any = {};

      if (company_uuid) {
        const company = await prisma.company.findUnique({
          where: {
            uuid: company_uuid,
            is_active: true,
          },
        });

        if (!company) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.CompanyNotFound,
          };
        }

        forumData["company_id"] = company.id;
        company_info["uuid"] = company.uuid;
        company_info["company_name"] = company.company_name;
      }

      const updatedData = await prisma.forum.update({
        data: {
          ...forumData,
          updatedAt: new Date(),
        },
        where: {
          uuid: fUuid,
        },
      });

      let updatedForumCourse;
      if (forumCourse) {
        if (starting_date) {
          updatedForumCourse = await prisma.forum_course.update({
            where: {
              uuid: forumCourse.uuid,
            },
            data: {
              starting_date: new Date(starting_date),
            },
          });
        }
      }

      return {
        message: StaticMessage.EditForum,
        data: {
          forum_info: {
            id: updatedData.id,
            uuid: updatedData.uuid,
            forum_name: updatedData.forum_name,
            meeting_day: updatedData.meeting_day,
            meeting_time: updatedData.meeting_time,
            createdAt: updatedData.createdAt,
            updatedAt: updatedData.updatedAt,
            starting_date: body.starting_date
              ? updatedForumCourse?.starting_date
              : forumCourse?.starting_date,
            company_info:
              Object.keys(company_info).length !== 0 ? company_info : undefined,
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async forumMCQ(forumUuid: any, date: string) {
    try {
      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
          is_active: true,
        },
        select: {
          id: true,
          user_forum: {
            where: {
              user: {
                is_active: true,
              },
            },
            select: {
              user: {
                select: {
                  id: true,
                  uuid: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  phone: true,
                  job_title: true,
                },
              },
            },
          },
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      let userInfo = await Promise.all(
        forum.user_forum.map(async (item: any) => {
          item.user["health"] = await new CalculateAverage().userPerForum(
            item.user.id,
            forum.id
          );
          item.user["mcq_info"] =
            await new UserPerForumHealthController().getUserPerForumHealthByUser(
              item.user.id,
              forum.id,
              new Date(date)
            );
          delete item.user.id;
          return item.user;
        })
      );

      const mcqInfo = await prisma.forum_health_mcqs.findMany({
        where: {
          is_active: true,
        },
        select: {
          uuid: true,
          mcq_title: true,
          mcq_description: true,
          health_mcq_options: {
            select: {
              uuid: true,
              mcq_option: true,
              mcq_option_description: true,
            },
          },
        },
      });

      let convertedMcqInfo = mcqInfo.map((item) => {
        return {
          uuid: item.uuid,
          mcq_title: item.mcq_title,
          mcq_description: item.mcq_description,
          mcq_options: item.health_mcq_options.map((option) => {
            return {
              uuid: option.uuid,
              mcq_option: option.mcq_option,
              mcq_description: option.mcq_option_description,
            };
          }),
        };
      });

      return {
        message: StaticMessage.AllForumMCQ,
        data: {
          member_info: userInfo,
          mcq_info: convertedMcqInfo,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async attenancePerForumUser(
    forumUuid: string,
    body: AddForumAttendance[],
    date: string
  ) {
    try {
      await new ForumValidator().addForumAttendance(body);
      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
          is_active: true,
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      for (let member of body) {
        const user = await prisma.user.findUnique({
          where: {
            uuid: member.member_uuid,
            is_active: true,
          },
        });

        if (!user) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.UserNotFound,
          };
        }

        const userForum = await prisma.user_forum.findFirst({
          where: {
            user_id: user.id,
            forum_id: forum.id,
          },
        });

        if (!userForum) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.UserNotLinkedWithForum,
          };
        }

        const isHealthExistOnDate =
          await prisma.user_per_forum_health_score.findFirst({
            where: {
              user_id: user.id,
              forum_id: forum.id,
              date: new Date(date),
            },
          });

        if (isHealthExistOnDate) {
          throw {
            statusCode: 400,
            data: null,
            message: StaticMessage.DuplicateDate,
          };
        }

        let totalScore = 0;
        for (let mcq of member.mcqs) {
          let options = await prisma.health_mcq_options.findUnique({
            where: {
              uuid: mcq.mcq_option_uuid,
              is_active: true,
            },
          });

          if (!options) {
            throw {
              statusCode: 404,
              data: null,
              message: StaticMessage.OptionNotAvailable,
            };
          }

          await prisma.user_forum_healths.create({
            data: {
              user_id: user.id,
              forum_id: forum.id,
              date: new Date(date),
              score: options.mcq_option_value,
              health_mcq_option_id: options.id,
            },
          });

          totalScore += Number(options.mcq_option_value);
        }

        let onetimeHealthScore = (totalScore / 5) * 10;

        await prisma.user_per_forum_health_score.create({
          data: {
            user_id: user.id,
            forum_id: forum.id,
            date: new Date(date),
            score: onetimeHealthScore,
          },
        });
      }

      return {
        message: StaticMessage.AllForumMCQSaved,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deleteAttenancePerForumUser(
    forumUuid: string,
    body: UpdateForumAttendance[],
    date: string
  ) {
    try {
      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
          is_active: true,
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      for (let member of body) {
        const user = await prisma.user.findUnique({
          where: {
            uuid: member.member_uuid,
            is_active: true,
          },
        });

        if (!user) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.UserNotFound,
          };
        }

        const userForum = await prisma.user_forum.findFirst({
          where: {
            user_id: user.id,
            forum_id: forum.id,
          },
        });

        if (!userForum) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.UserNotLinkedWithForum,
          };
        }
        await prisma.user_per_forum_health_score.deleteMany({
          where: {
            user_id: user.id,
            forum_id: forum.id,
            date: new Date(date),
          },
        });

        await prisma.user_forum_healths.deleteMany({
          where: {
            user_id: user.id,
            forum_id: forum.id,
            date: new Date(date),
          },
        });
      }

      return true;
    } catch (error: any) {
      throw error;
    }
  }

  async getForumHealthDetailsByUuid(forumUuid: string) {
    try {
      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      const averageScores = await prisma.user_per_forum_health_score.groupBy({
        by: ["date"],
        where: {
          forum_id: forum.id,
          is_active: true,
        },
        orderBy: {
          date: "desc",
        },
        _avg: {
          score: true,
        },
        _max: {
          updatedAt: true,
        },
      });

      const formattedResults = averageScores.map(({ date, _avg, _max }) => ({
        health: Math.round(Number(_avg.score!.toFixed(2))),
        date: date.toISOString().split("T")[0],
        updatedAt: _max.updatedAt,
      }));

      return {
        message: StaticMessage.ForumAllHealth,
        data: { historical_health: formattedResults },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateIsActiveInForum(body: any, forumUuid: string) {
    try {
      await new ForumValidator().UpdateIsActiveInForum(body);

      const isForumExist = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
        select: {
          id: true,
          is_active: true,
          user_forum: true,
        },
      });

      if (!isForumExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      const userIds = isForumExist.user_forum.map((item: any) => item.user_id);

      const { is_active } = body;

      await prisma.$transaction([
        prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { is_active, updatedAt: new Date() },
        }),
        prisma.forum.update({
          data: {
            is_active,
            updatedAt: new Date(),
          },
          where: {
            uuid: forumUuid,
          },
        }),
      ]);

      const message = is_active ? "enabled" : "disabled";

      return {
        message: `Forum ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getForumDetailsBasedOnSearch(
    userId: number,
    roleUuid: string,
    companyId: number,
    request: any
  ) {
    try {
      await checkScopeAccess(roleUuid, "all_forums", "read");

      let hasUpdateAccess = true;
      try {
        await checkScopeAccess(roleUuid, "all_forums", "update");
      } catch (err: any) {
        if (err.message === StaticMessage.InvalidScopeProvided) {
          hasUpdateAccess = false;
        }
      }

      const searchQuery = request.nextUrl.searchParams.get("search");
      const companyQuery = request.nextUrl.searchParams.get("company");
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

      let condition = await getConditionBasedOnScopeForForum(
        scope,
        userId,
        companyId
      );

      let isActiveCondition = hasUpdateAccess
        ? Prisma.empty
        : Prisma.sql`AND f.is_active = true`;

      const isDropdownCondition = request.nextUrl.searchParams.get("isDropdown")
        ? Prisma.sql`AND f.is_active = true`
        : Prisma.empty;

      const forumDetail: any = await prisma.$queryRaw`SELECT
      f.id,
      f.uuid AS forum_uuid,
      f.forum_name,
      CAST(COUNT(DISTINCT u.id) AS INTEGER) AS total_users,
      CAST(COALESCE(ROUND(AVG(upfhs.score)), 0) AS INTEGER) AS health,
      f.is_active,
      f."createdAt" AS forum_createdAt,
      c.uuid AS company_uuid, 
      c.company_name
      FROM 
          "Forum" f
      LEFT JOIN 
          "user_forum" uf ON f.id = uf.forum_id
      LEFT JOIN 
          "User" u ON uf.user_id = u.id
      LEFT JOIN 
          "user_per_forum_health_score" upfhs ON upfhs.user_id = u.id AND upfhs.forum_id = f.id
      LEFT JOIN 
          "Company" c ON f.company_id = c.id
      WHERE 
          (${!searchQuery} OR f.forum_name ILIKE '%' || ${searchQuery} || '%')
          AND (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${request.nextUrl.searchParams.get(
        "company"
      )}, ',')::UUID[]))
          ${condition}
          ${isActiveCondition}
          ${isDropdownCondition}
      GROUP BY 
          f.id, c.id
      LIMIT ${limit} OFFSET ${offset};`;

      const count: any =
        await prisma.$queryRaw`SELECT CAST(COUNT(*) AS INTEGER) AS total_count
      FROM (SELECT
      f.uuid AS forum_uuid,
      f.forum_name,
      CAST(COUNT(DISTINCT u.id) AS INTEGER) AS total_users,
      CAST(COALESCE(ROUND(AVG(upfhs.score)), 0) AS INTEGER) AS health,
      f.is_active,
      f."createdAt" AS forum_createdAt,
      c.uuid AS company_uuid, 
      c.company_name
      FROM 
          "Forum" f
      LEFT JOIN 
          "user_forum" uf ON f.id = uf.forum_id
      LEFT JOIN 
          "User" u ON uf.user_id = u.id
      LEFT JOIN 
          "user_per_forum_health_score" upfhs ON upfhs.user_id = u.id AND upfhs.forum_id = f.id
      LEFT JOIN 
          "Company" c ON f.company_id = c.id
      WHERE 
          (${!searchQuery} OR f.forum_name ILIKE '%' || ${searchQuery} || '%')
          AND (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${request.nextUrl.searchParams.get(
          "company"
        )}, ',')::UUID[]))
          ${condition}
          ${isActiveCondition}
          ${isDropdownCondition}
      GROUP BY 
          f.id, c.id
      ) AS subquery`;

      const convertedForums = await Promise.all(
        forumDetail.map(async (forum: any) => {
          return {
            forum_info: {
              uuid: forum.forum_uuid,
              forum_name: forum.forum_name,
              total_users: forum.total_users,
              is_active: forum.is_active,
              createdAt: forum.forum_createdAt,
              company_info: {
                uuid: forum.company_uuid,
                company_name: forum.company_name,
              },
              health: await weightedMomentumBasedOnForum(forum.id),
            },
          };
        })
      );

      return {
        message: StaticMessage.ForumFetchedSuccessfullyBasedOnSearch,
        data: convertedForums,
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

  async updateForumByUuid(roleUuid: string, body: UpdateForum, fUuid: string) {
    try {
      if (!roleUuid) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      const role = await prisma.roles.findUnique({
        where: {
          uuid: roleUuid,
        },
      });

      if (!role) {
        throw {
          statusCode: 401,
          message: StaticMessage.RoleNotFound,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "view_forum", "update");
      await new ForumValidator().updateForum(body);

      const {
        company_uuid,
        course_uuid,
        chapter_uuid,
        starting_date,
        add_users,
        remove_users,
        ...forumData
      } = body;

      let isForumExist;
      if (role.name === "Super Admin") {
        isForumExist = await prisma.forum.findUnique({
          where: {
            uuid: fUuid,
          },
          select: {
            id: true,
            uuid: true,
            forum_name: true,
            meeting_day: true,
            meeting_time: true,
            createdAt: true,
            updatedAt: true,
            company: {
              select: {
                uuid: true,
                company_name: true,
              },
            },
            forum_course: {
              where: {
                is_current_course: true,
              },
              include: {
                chapters: {
                  select: {
                    uuid: true,
                    id: true,
                    name: true,
                  },
                },
                courses: {
                  select: {
                    uuid: true,
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
      } else {
        isForumExist = await prisma.forum.findUnique({
          where: {
            uuid: fUuid,
            is_active: true,
          },
          select: {
            id: true,
            uuid: true,
            forum_name: true,
            meeting_day: true,
            meeting_time: true,
            createdAt: true,
            updatedAt: true,
            company: {
              select: {
                uuid: true,
                company_name: true,
              },
            },
            forum_course: {
              where: {
                is_current_course: true,
              },
              include: {
                chapters: {
                  select: {
                    uuid: true,
                    id: true,
                    name: true,
                  },
                },
                courses: {
                  select: {
                    uuid: true,
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
      }

      if (!isForumExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      if (add_users || remove_users) {
        if (remove_users && remove_users.length > 0) {
          const usersToRemove = await prisma.user.findMany({
            where: {
              uuid: { in: remove_users },
            },
            select: {
              id: true,
            },
          });

          if (usersToRemove.length !== remove_users.length) {
            throw {
              message: StaticMessage.UsersNotFound,
              statusCode: 404,
              data: null,
            };
          }

          const userIdsToRemove = usersToRemove.map((user) => user.id);

          await prisma.user_forum.deleteMany({
            where: {
              forum_id: isForumExist.id,
              user_id: {
                in: userIdsToRemove,
              },
            },
          });
        }

        if (add_users && add_users.length > 0) {
          const usersToAdd = await prisma.user.findMany({
            where: {
              uuid: { in: add_users },
            },
            select: {
              id: true,
            },
          });

          if (usersToAdd.length !== add_users.length) {
            throw {
              message: StaticMessage.UsersNotFound,
              statusCode: 404,
              data: null,
            };
          }

          const userIdsToAdd = usersToAdd.map((user) => user.id);

          for (const userId of userIdsToAdd) {
            await prisma.user_forum.createMany({
              data: {
                user_id: userId,
                forum_id: isForumExist.id,
              },
            });
          }
        }
      }

      const forumCourse = await prisma.forum_course.findFirst({
        where: {
          forum_id: isForumExist.id,
        },
      });

      let updatedForumCourse;

      if (starting_date) {
        updatedForumCourse = await prisma.forum_course.update({
          where: {
            uuid: forumCourse?.uuid,
          },
          data: {
            starting_date: new Date(starting_date),
          },
        });
      }

      let company_info: any = {};

      if (company_uuid) {
        const company = await prisma.company.findUnique({
          where: {
            uuid: company_uuid,
            is_active: true,
          },
        });

        if (!company) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.CompanyNotFound,
          };
        }

        forumData["company_id"] = company.id;
        company_info["uuid"] = company.uuid;
        company_info["company_name"] = company.company_name;
      } else {
        const company = await prisma.company.findUnique({
          where: {
            uuid: isForumExist.company.uuid,
            is_active: true,
          },
        });

        if (!company) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.CompanyNotFound,
          };
        }

        forumData["company_id"] = company.id;
        company_info["uuid"] = company.uuid;
        company_info["company_name"] = company.company_name;
      }

      let course, chapter;

      if (course_uuid || chapter_uuid) {
        if (course_uuid) {
          course = await prisma.courses.findUnique({
            where: { uuid: course_uuid },
          });

          if (!course) {
            throw {
              statusCode: 404,
              message: StaticMessage.CourseNotFound,
              data: null,
            };
          }
        } else {
          course = await prisma.courses.findUnique({
            where: { id: forumCourse?.course_id },
          });
        }

        if (chapter_uuid) {
          chapter = await prisma.chapters.findUnique({
            where: { uuid: chapter_uuid },
            select: { id: true, uuid: true, name: true, is_active: true },
          });

          if (!chapter) {
            throw {
              statusCode: 404,
              message: StaticMessage.ChapterNotFound,
              data: null,
            };
          }
        } else {
          if (course_uuid) {
            chapter = await prisma.chapters.findFirst({
              where: { course_id: course?.id! },
            });
            if (!chapter) {
              throw {
                statusCode: 404,
                message: StaticMessage.ChapterNotFound,
                data: null,
              };
            }
          }
        }

        const existingForumCourse = await prisma.forum_course.findFirst({
          where: { forum_id: isForumExist.id, is_current_course: true },
        });

        if (existingForumCourse) {
          await prisma.forum_course.update({
            data: {
              course_id: course?.id,
              chapter_id: chapter?.id,
              is_current_course: false,
              updatedAt: new Date(),
            },
            where: { id: existingForumCourse.id },
          });
        }
        const data = await prisma.forum_course.create({
          data: {
            forum_id: isForumExist.id,
            course_id: course!.id,
            chapter_id: chapter?.id,
            is_current_course: true,
            starting_date: existingForumCourse?.starting_date,
            updatedAt: new Date(),
          },
        });
      }

      const updatedData = await prisma.forum.update({
        data: {
          ...forumData,
          updatedAt: new Date(),
        },
        where: {
          uuid: fUuid,
        },
      });

      const userForum = await prisma.user_forum.findMany({
        where: {
          forum_id: isForumExist.id,
        },
      });

      const userIds = userForum.map((item) => item.user_id);

      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
      });

      if (!users) {
        throw {
          message: StaticMessage.UsersNotFound,
          statusCode: 404,
          data: null,
        };
      }

      const finalForum = await prisma.forum.findUnique({
        where: {
          uuid: fUuid,
          is_active: true,
        },
        select: {
          id: true,
          uuid: true,
          forum_name: true,
          meeting_day: true,
          meeting_time: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              uuid: true,
              company_name: true,
            },
          },
          forum_course: {
            where: {
              is_current_course: true,
            },
            include: {
              chapters: {
                select: {
                  uuid: true,
                  id: true,
                  name: true,
                },
              },
              courses: {
                select: {
                  uuid: true,
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const forumDataForEmail = {
        forum_name: finalForum?.forum_name,
        meeting_day: finalForum?.meeting_day,
        meeting_time: finalForum?.meeting_time,
        starting_date: body.starting_date
          ? updatedForumCourse?.starting_date
          : forumCourse?.starting_date,
        company_info: finalForum?.company,
        course_info: finalForum?.forum_course[0].courses.name
          ? {
              course_name: finalForum?.forum_course[0].courses.name,
            }
          : null,
        chapter_info: finalForum?.forum_course[0].chapters?.name
          ? {
              chapter_name: finalForum?.forum_course[0].chapters?.name,
            }
          : null,
        users_info: users.map((item) => ({
          uuid: item.uuid,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
        })),
      };

      const { forum_name, meeting_day, meeting_time } = body;

      const updatedForumInformation = [];

      if (forum_name) {
        updatedForumInformation.push(
          `<li><b>Forum name updated to ${forum_name}</b></li>`
        );
      }

      if (meeting_day) {
        updatedForumInformation.push(
          `<li><b>Meeting day updated to ${meeting_day}</b></li>`
        );
      }

      if (meeting_time) {
        updatedForumInformation.push(
          `<li><b>Meeting time updated to ${meeting_time}</b></li>`
        );
      }

      if (company_uuid) {
        updatedForumInformation.push(
          `<li><b>Company updated to ${finalForum?.company.company_name}</b></li>`
        );
      }

      if (course_uuid) {
        updatedForumInformation.push(
          `<li><b>Course updated to ${finalForum?.forum_course[0].courses.name}</b></li>`
        );
      }

      if (chapter_uuid) {
        updatedForumInformation.push(
          `<li><b>Chapter updated to ${finalForum?.forum_course[0].chapters?.name}</b></li>`
        );
      }

      if (starting_date) {
        updatedForumInformation.push(
          `<li><b>Starting date updated to ${starting_date}</b></li>`
        );
      }

      if (forumDataForEmail.users_info.length !== 0) {
        await new EmailController().sendForumUpdatedEmail(
          forumDataForEmail,
          updatedForumInformation.join("")
        );
      }

      return {
        message: StaticMessage.EditForum,
        data: {
          forum_info: {
            id: finalForum?.id,
            uuid: finalForum?.uuid,
            forum_name: finalForum?.forum_name,
            meeting_day: finalForum?.meeting_day,
            meeting_time: finalForum?.meeting_time,
            createdAt: finalForum?.createdAt,
            updatedAt: finalForum?.updatedAt,
            starting_date: body.starting_date
              ? updatedForumCourse?.starting_date
              : forumCourse?.starting_date,
            company_info: finalForum?.company,
            course_info: finalForum?.forum_course[0].courses.name
              ? {
                  course_name: finalForum?.forum_course[0].courses.name,
                }
              : null,
            chapter_info: finalForum?.forum_course[0].chapters?.name
              ? {
                  chapter_name: finalForum?.forum_course[0].chapters?.name,
                }
              : null,
            user_info: users.map((item) => ({
              uuid: item.uuid,
              first_name: item.first_name,
              last_name: item.last_name,
            })),
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getForumHealthByUuid(
    userId: number,
    roleUuid: string,
    forumUuid: string,
    from: string,
    to: string
  ) {
    try {
      if (!roleUuid) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "view_forum", "read");

      const scope = await getScopeForFilter(userId);
      const whereCondition = await getConditionBasedOnForumForFilter(
        scope,
        userId
      );

      const forum = await prisma.forum.findFirst({
        where: {
          AND: [{ uuid: forumUuid }, whereCondition],
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      let date = new Date(to);
      date.setDate(date.getDate() + 1);
      to = date.toISOString().split("T")[0];

      const averageScores = await prisma.user_per_forum_health_score.groupBy({
        by: ["date"],
        where: {
          forum_id: forum.id,
          is_active: true,
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        orderBy: {
          date: "desc",
        },
        _avg: {
          score: true,
        },
        _max: {
          updatedAt: true,
        },
      });

      const formattedResults = averageScores.map(({ date, _avg, _max }) => ({
        health: parseFloat((_avg.score! || 0).toFixed(2)),
        date: date.toISOString().split("T")[0],
        updatedAt: _max.updatedAt,
      }));

      return {
        message: StaticMessage.HealthScoresOfTheForumRetrievedSuccessfully,
        data: {
          consolidated_health: await weightedMomentumBasedOnForum(forum.id),
          historical_health: formattedResults,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async createForumAndLinkUsers(body: any) {
    try {
      const company = await prisma.company.findFirst({
        where: {
          uuid: body.company_uuid,
        },
      });

      if (!company) {
        throw {
          message: StaticMessage.CompanyNotFound,
          data: null,
          statusCode: 404,
        };
      }

      let forumResponse: any = await this.createForum(body, company);
      let userResponse = body.users.map(async (item: any) => {
        let user = await prisma.user.findUnique({
          where: {
            email: item.email,
          },
        });

        if (user) {
          await prisma.user_forum.create({
            data: {
              user_id: user.id,
              forum_id: forumResponse.data.forum_info.id,
            },
          });
        } else {
          let role = await prisma.roles.findFirst({
            select: {
              uuid: true,
            },
            orderBy: {
              hierarchy: "desc",
            },
          });

          if (!role) {
            throw {
              statusCode: 404,
              data: null,
              message: StaticMessage.RoleNotFound,
            };
          }

          const password = generatePassword();
          const hashPassword = await bcrypt.hash(password, 10);

          await new EmailController().sendPasswordToUser(item.email, password);

          user = await prisma.user.create({
            data: {
              first_name: item.first_name,
              last_name: item.last_name,
              email: item.email,
              company_id: company.id,
              job_title: item.job_title,
              role_uuid: role.uuid,
              password: hashPassword,
            },
          });

          await prisma.user_forum.create({
            data: {
              user_id: user.id,
              forum_id: forumResponse.data.forum_info.id,
            },
          });
        }

        return {
          uuid: user.uuid,
          first_name: user.first_name,
          last_name: user.last_name,
          job_title: user.job_title,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      });

      let user = await Promise.all(userResponse);

      forumResponse.data["users_info"] = user;
      delete forumResponse.data.forum_info.id;

      return forumResponse;
    } catch (err: any) {
      throw err;
    }
  }

  async linkUsersinExistingForum(
    companyUuid: string,
    forumUuid: string,
    body: any
  ) {
    try {
      const company = await prisma.company.findUnique({
        where: {
          uuid: companyUuid,
        },
      });

      if (!company) {
        throw {
          message: StaticMessage.CompanyNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
        select: {
          id: true,
          uuid: true,
          forum_name: true,
          meeting_day: true,
          meeting_time: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              uuid: true,
              company_name: true,
            },
          },
          forum_course: {
            where: {
              is_current_course: true,
            },
            include: {
              chapters: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
              courses: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      const company_info = forum.company;
      const course_info = forum.forum_course[0].courses;
      const chapter_info = forum.forum_course[0].chapters;

      let userResponse = body.users.map(async (item: any) => {
        let user = await prisma.user.findUnique({
          where: {
            email: item.email,
          },
        });

        if (user) {
          await prisma.user_forum.create({
            data: {
              user_id: user.id,
              forum_id: forum.id,
            },
          });
        } else {
          let role = await prisma.roles.findFirst({
            select: {
              uuid: true,
            },
            orderBy: {
              hierarchy: "desc",
            },
          });

          if (!role) {
            throw {
              statusCode: 404,
              data: null,
              message: StaticMessage.RoleNotFound,
            };
          }

          const password = generatePassword();
          const hashPassword = await bcrypt.hash(password, 10);

          await new EmailController().sendPasswordToUser(item.email, password);

          user = await prisma.user.create({
            data: {
              first_name: item.first_name,
              last_name: item.last_name,
              email: item.email,
              company_id: company.id,
              job_title: item.job_title,
              role_uuid: role.uuid,
              password: hashPassword,
            },
          });

          await prisma.user_forum.create({
            data: {
              user_id: user.id,
              forum_id: forum.id,
            },
          });
        }

        return {
          uuid: user.uuid,
          first_name: user.first_name,
          last_name: user.last_name,
          job_title: user.job_title,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      });

      let user = await Promise.all(userResponse);

      return {
        message: StaticMessage.AllInformationRetrievedSuccessfully,
        data: {
          forum_info: {
            uuid: forum.uuid,
            forum_name: forum.forum_name,
            meeting_day: forum.meeting_day,
            meeting_time: forum.meeting_time,
            company_info: {
              uuid: company_info.uuid,
              company_name: company_info.company_name,
            },
            course_info: course_info,
            chapter_info: chapter_info,
            createdAt: forum.createdAt,
            updatedAt: forum.updatedAt,
            users_info: user,
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }
}
