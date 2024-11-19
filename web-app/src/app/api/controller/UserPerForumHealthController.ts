import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { UpdateHealth } from "../infrastructure/dtos/Health";
import { HealthValidator } from "../validators/HealthValidator";
let uuidv4 = require("uuid");

export class UserPerForumHealthController {
  async getUserPerForumHealthByUuid(userPerForumUuid: string) {
    try {
      const userPerForumHealth =
        await prisma.user_per_forum_health_score.findUnique({
          where: {
            uuid: userPerForumUuid,
          },
          select: {
            uuid: true,
            user_id: true,
            forum_id: true,
            score: true,
            date: true,
            createdAt: true,
          },
        });

      if (!userPerForumHealth) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.HealthNotFoundForUserForum,
        };
      }

      let mcqInfo = await prisma.forum_health_mcqs.findMany({
        select: {
          uuid: true,
          mcq_title: true,
          mcq_description: true,
          health_mcq_options: {
            select: {
              id: true,
              uuid: true,
              mcq_option: true,
              mcq_option_description: true,
            },
          },
        },
      });

      let updatedMcqInfo = await Promise.all(
        mcqInfo.map(async (item: any) => {
          item["mcq_options"] = await this.updateUserSelectedAnswersResponse(
            item.health_mcq_options,
            userPerForumHealth.user_id,
            userPerForumHealth.forum_id,
            userPerForumHealth.date
          );
          delete item.health_mcq_options;
          return item;
        })
      );

      return {
        message: StaticMessage.AllMcqAnswerForSpecificUserID,
        data: {
          health_info: {
            uuid: userPerForumHealth.uuid,
            date: userPerForumHealth.date,
            createdAt: userPerForumHealth.createdAt,
            health: userPerForumHealth.score,
          },
          mcq_info: updatedMcqInfo,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUserPerForumHealthByUser(
    userId: number,
    forumId: number,
    date: Date
  ) {
    try {
      const userPerForumHealth =
        await prisma.user_per_forum_health_score.findFirst({
          where: {
            user_id: userId,
            forum_id: forumId,
            date: date,
          },
          select: {
            uuid: true,
            user_id: true,
            forum_id: true,
            score: true,
            date: true,
            createdAt: true,
          },
        });

      let mcqInfo = await prisma.forum_health_mcqs.findMany({
        select: {
          uuid: true,
          mcq_title: true,
          mcq_description: true,
          health_mcq_options: {
            select: {
              id: true,
              uuid: true,
              mcq_option: true,
              mcq_option_description: true,
            },
          },
        },
      });

      let updatedMcqInfo = await Promise.all(
        mcqInfo.map(async (item: any) => {
          if (userPerForumHealth) {
            item["mcq_options"] = await this.updateUserSelectedAnswersResponse(
              item.health_mcq_options,
              userPerForumHealth.user_id,
              userPerForumHealth.forum_id,
              userPerForumHealth.date
            );
          } else {
            item["mcq_options"] = item.health_mcq_options.map((item: any) => {
              item["selected_answer"] = null;
              delete item.id;
              return item;
            });
          }
          delete item.health_mcq_options;
          return item;
        })
      );
      return updatedMcqInfo;
    } catch (err: any) {
      throw err;
    }
  }

  async updateUserSelectedAnswersResponse(
    healthMcqOptions: any,
    userId: number,
    forumId: number,
    date: Date
  ) {
    try {
      const updatedHealthMcqOptions = await Promise.all(
        healthMcqOptions.map(async (item: any) => {
          const selectedAnswer = await prisma.user_forum_healths.findFirst({
            where: {
              user_id: userId,
              forum_id: forumId,
              health_mcq_option_id: item.id,
              date: date,
            },
            select: {
              uuid: true,
              createdAt: true,
            },
          });

          item["selected_answer"] = selectedAnswer;
          delete item.id;
          return item;
        })
      );

      return updatedHealthMcqOptions;
    } catch (err: any) {
      throw err;
    }
  }

  async updateUserPerForumHealthByUuid(
    userPerForumUuid: string,
    body: UpdateHealth
  ) {
    try {
      await new HealthValidator().updateHealth(body);
      const userPerForumHealth =
        await prisma.user_per_forum_health_score.findUnique({
          where: {
            uuid: userPerForumUuid,
          },
          select: {
            user_id: true,
            forum_id: true,
            date: true,
          },
        });

      if (!userPerForumHealth) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.HealthNotFoundForUserForum,
        };
      }

      for (let newAns of body.new_answers) {
        const healthOption = await prisma.health_mcq_options.findUnique({
          where: {
            uuid: newAns.mcq_option_uuid,
          },
        });
        if (!healthOption) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.OptionNotAvailable,
          };
        }
        const isUserForumHealthExist =
          await prisma.user_forum_healths.findFirst({
            where: {
              user_id: userPerForumHealth.user_id,
              forum_id: userPerForumHealth.forum_id,
              health_mcq_option_id: healthOption.id,
              date: userPerForumHealth.date,
            },
          });
        if (!isUserForumHealthExist) {
          await prisma.user_forum_healths.create({
            data: {
              user_id: userPerForumHealth.user_id,
              forum_id: userPerForumHealth.forum_id,
              date: userPerForumHealth.date,
              score: healthOption.mcq_option_value,
              health_mcq_option_id: healthOption.id,
            },
          });
        }
      }

      for (let oldAns of body.old_answers) {
        const healthOption = await prisma.health_mcq_options.findUnique({
          where: {
            uuid: oldAns.mcq_option_uuid,
          },
        });

        if (!healthOption) {
          throw {
            statusCode: 404,
            data: null,
            message: StaticMessage.OptionNotAvailable,
          };
        }
        await prisma.user_forum_healths.deleteMany({
          where: {
            user_id: userPerForumHealth.user_id,
            forum_id: userPerForumHealth.forum_id,
            health_mcq_option_id: healthOption.id,
            date: userPerForumHealth.date,
          },
        });
      }

      let mcqOptions = await prisma.user_forum_healths.aggregate({
        where: {
          user_id: userPerForumHealth.user_id,
          forum_id: userPerForumHealth.forum_id,
          date: userPerForumHealth.date,
        },
        _sum: {
          score: true,
        },
      });

      let score: any = mcqOptions._sum.score ? mcqOptions._sum.score : 0;

      let onetimeHealthScore = (score / 5) * 10;

      await prisma.user_per_forum_health_score.update({
        data: {
          score: onetimeHealthScore,
        },
        where: {
          uuid: userPerForumUuid,
        },
      });

      return {
        message: StaticMessage.updatedMemberMcq,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
