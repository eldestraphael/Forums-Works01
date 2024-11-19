import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { CalculateAverage } from "../helpers/calculateAverage";
import { AddMember, UpdateMember } from "../infrastructure/dtos/Member";
import { MemberValidator } from "../validators/MemberValidator";
import { EmailController } from "../helpers/emailService";
import { generatePassword } from "../helpers/passwordGenerator";
import * as bcrypt from "bcrypt";

let uuidv4 = require("uuid");

export class MemberController {
  async AddMember(body: AddMember) {
    try {
      await new MemberValidator().AddMember(body);

      const role = await prisma.roles.findUnique({
        where: { uuid: body.role_uuid },
      });

      if (!role) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.RoleNotFound,
        };
      }

      const company = await prisma.company.findFirst({
        where: { uuid: body.company_uuid },
      });

      if (!company) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CompanyNotFound,
        };
      }

      const user = await prisma.user.findFirst({
        where: { email: body.email },
      });

      if (user) {
        throw {
          statusCode: 400,
          data: null,
          message: StaticMessage.UserAlreadyExist,
        };
      }

      const password = generatePassword();
      const hashPassword = await bcrypt.hash(password, 10);

      await new EmailController().sendPasswordToUser(body.email, password);

      const createUser = await prisma.user.create({
        data: {
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone: body.phone,
          job_title: body.job_title,
          company_id: company.id,
          role_uuid: role.uuid,
          password: hashPassword,
        },
      });

      let forums_info = [];

      for (let item of body.forums_info) {
        let obj: any = {};
        const findForum = await prisma.forum.findFirst({
          where: { uuid: item.uuid },
        });

        if (!findForum) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.ForumNotFound,
          };
        }

        await prisma.user_forum.create({
          data: {
            user_id: createUser.id,
            forum_id: findForum.id,
          },
        });

        obj["uuid"] = findForum.uuid;
        obj["forum_name"] = findForum.forum_name;

        forums_info.push(obj);
      }

      return {
        message: StaticMessage.CreatedNewMember,
        data: {
          member_info: {
            id: createUser.id,
            uuid: createUser.uuid,
            role_uuid: createUser.role_uuid,
            first_name: createUser.first_name,
            last_name: createUser.last_name,
            email: createUser.email,
            phone: createUser.phone,
            job_title: createUser.job_title,
            createdAt: createUser.createdAt,
            updatedAt: createUser.updatedAt,
            company_info: {
              uuid: company.uuid,
              company_name: company.company_name,
            },
            forums_info: forums_info,
            role: role.name,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getMemberDetailsByUuid(userUuid: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { uuid: userUuid },
        select: {
          id: true,
          uuid: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          job_title: true,
          role_uuid: true,
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

      if (!user.role_uuid) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.RoleNotFound,
        };
      }

      const role = await prisma.roles.findUnique({
        where: { uuid: user.role_uuid },
      });

      if (!role) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.RoleNotFoundForTheUser,
        };
      }

      let { company, user_forum, role_uuid, ...userdetails } = user;

      const forum_info = await user_forum.map((item) => {
        return item.forum;
      });

      return {
        message: StaticMessage.SpecificUserInfo,
        data: {
          member_info: {
            ...userdetails,
            company_info: company,
            forums_info: forum_info,
            role: {
              role_uuid: role.uuid,
              role_name: role.name,
            },
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async searchMember(query: string) {
    try {
      const search_result = await prisma.user.findMany({
        where: {
          OR: [
            {
              first_name: {
                contains: query,
                mode: "insensitive",
              },
            },
            { last_name: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          uuid: true,
          first_name: true,
          last_name: true,
        },
      });

      return {
        message: StaticMessage.UserFetchedByQuery,
        data: { search_result: search_result },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateMember(body: UpdateMember, mUuid: string) {
    try {
      await new MemberValidator().UpdateMember(body);

      const { company_uuid, forums_info, role_uuid, ...userData } = body;

      const role = await prisma.roles.findUnique({
        where: { uuid: role_uuid },
      });

      if (!role) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.RoleNotFound,
        };
      }

      const isMemberExist = await prisma.user.findUnique({
        where: {
          uuid: mUuid,
        },
      });

      if (!isMemberExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      let company_info: any = {};

      if (company_uuid) {
        const company = await prisma.company.findUnique({
          where: {
            uuid: company_uuid,
          },
        });

        if (!company) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.CompanyNotFound,
          };
        }

        userData["company_id"] = company.id;
        company_info["uuid"] = company.uuid;
        company_info["company_name"] = company.company_name;
      }

      const updatedData = await prisma.user.update({
        data: {
          ...userData,
          role_uuid: role.uuid,
          updatedAt: new Date(),
        },
        where: {
          uuid: mUuid,
        },
      });

      const listUserForum = await prisma.user_forum.findMany({
        where: { user_id: updatedData.id },
      });

      let forumIds: any = [];
      if (forums_info) {
        const forumInfo = forums_info.map(async (item: any) => {
          let data = await prisma.forum.findUnique({
            where: {
              uuid: item.uuid,
            },
          });
          return data;
        });

        let forumData = await Promise.all(forumInfo);

        if (forumData) {
          for (let forum of forumData) {
            if (!forum) {
              throw {
                statusCode: 404,
                message: StaticMessage.ForumNotFound,
                data: null,
              };
            }
            forumIds.push(forum.id);
            let isUserForumExist = listUserForum.find(
              (item) => item.forum_id === forum?.id
            );

            if (!isUserForumExist) {
              let data = await prisma.user_forum.create({
                data: {
                  uuid: uuidv4.v4(),
                  user_id: updatedData.id,
                  forum_id: forum.id,
                },
              });
            }
          }

          let recordTobeDelete = listUserForum.filter(
            (obj: any) => !forumIds.includes(obj.forum_id)
          );

          for (let record of recordTobeDelete) {
            await prisma.user_forum.delete({
              where: {
                uuid: record.uuid,
              },
            });
          }
        }
      }

      return {
        message: StaticMessage.EditForum,
        data: {
          member_info: {
            ...userData,
            updatedAt: updatedData.updatedAt,
            company_info:
              Object.keys(company_info).length !== 0 ? company_info : undefined,
            forums_info: forums_info ? forums_info : undefined,
            role: role.name,
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getMemberHealthDetailsByUuid(userUuid: string, forumUuid: string) {
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

      const userForumHealth = await prisma.user_per_forum_health_score.findMany(
        {
          where: {
            forum_id: forum.id,
            user_id: user.id,
          },
          select: {
            uuid: true,
            score: true,
            date: true,
            createdAt: true,
          },
        }
      );

      let consolidated_health = await new CalculateAverage().userHealth(
        userForumHealth
      );

      userForumHealth.forEach((item: any) => {
        item.health = item.score;
        delete item.score;
      });

      return {
        message: StaticMessage.UserAllHealth,
        data: {
          consolidated_health,
          historical_health: userForumHealth,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async deleteMember(mUuid: string) {
    try {
      const isMemberExist = await prisma.user.findUnique({
        where: {
          uuid: mUuid,
        },
      });

      if (!isMemberExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      await prisma.user.delete({
        where: {
          uuid: mUuid,
        },
      });

      return {
        message: StaticMessage.MemberDeletedSuccessfully,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
