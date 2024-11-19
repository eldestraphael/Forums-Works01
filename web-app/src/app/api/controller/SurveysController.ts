import * as xlsx from "xlsx";
import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { checkScopeAccess } from "../helpers/checkScopeAccess";
import { getScopeForFilter } from "../helpers/getUserScope";
import { getConditionBasedOnScopeForSurveys, getConditionBasedOnScopeForSurveysSql } from "../helpers/getForumScope";

export class SurveysController {
  async createSurvey(file: any, body: any) {
    try {
      return await prisma.surveys.create({
        data: {
          survey_data: JSON.parse(file),
          asset_content_size: body.asset_content_size,
        },
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getSurveyById(surveyUuid: string) {
    try {
      const isSurveyExist = await prisma.surveys.findUnique({
        where: {
          uuid: surveyUuid,
        },
      });

      if (!isSurveyExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.SurveyNotFound,
          data: null,
        };
      }

      return isSurveyExist;
    } catch (error: any) {
      throw error;
    }
  }

  async updateSurvey(file: any, body: any) {
    try {
      return await prisma.surveys.update({
        where: {
          uuid: body.asset_uuid,
        },
        data: {
          survey_data: JSON.parse(file),
          asset_content_size: body.asset_content_size,
        },
      });
    } catch (error: any) {
      throw error;
    }
  }

  async listAllSurveysByForumUuid(
    userId: number,
    roleUuid: string,
    forumUuid: string
  ) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "all_surveys", "read");

      const scope = await getScopeForFilter(userId);

      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
      });

      if (!forum) {
        throw {
          statusCode: 404,
          message: StaticMessage.ForumNotFound,
          data: null,
        };
      }

      let whereCondition = await getConditionBasedOnScopeForSurveysSql(
        scope,
        forum.id
      );

      const surveys: any = await prisma.$queryRaw`
      SELECT
        s.uuid AS survey_uuid,
        l.name AS lesson_name,
        s."createdAt" AS created_at,
        MAX(uss."createdAt") AS completed_on
      FROM
        forum_course fc
        INNER JOIN chapters ch ON fc.chapter_id = ch.id
        INNER JOIN lessons l ON ch.id = l.chapter_id
        LEFT JOIN user_survey_status uss ON l.survey_id = uss.survey_id
        INNER JOIN surveys s ON l.survey_id = s.id
      WHERE
        fc.forum_id = (SELECT id FROM "Forum" WHERE uuid = ${forumUuid}::UUID)
        AND l.asset_type = 'survey'
        ${whereCondition}
      GROUP BY
        s.uuid, l.name, s."createdAt"
      ORDER BY
        completed_on DESC;
    `;

      const responseData = surveys.length
        ? surveys
          .filter((survey: any) => survey.completed_on !== null)
          .map((survey: any) => ({
            uuid: survey.survey_uuid,
            name: survey.lesson_name,
            created_at: survey.created_at,
            completed_on: survey.completed_on,
          }))
        : [];

      return {
        message: StaticMessage.SurveyDataRetrieved,
        data: responseData,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async downloadSurveysBySurveyId(
    userId: number,
    roleUuid: string,
    forumUuid: string,
    surveyUuid: string
  ) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "all_surveys", "read");

      const scope = await getScopeForFilter(userId);

      const isForumExist = await prisma.forum.findUnique({
        where: { uuid: forumUuid },
        select: {
          id: true,
          company: {
            select: {
              company_name: true,
            },
          },
          forum_name: true,
        },
      });

      if (!isForumExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.ForumNotFound,
          data: null,
        };
      }

      const whereCondition = await getConditionBasedOnScopeForSurveys(
        scope,
        isForumExist.id
      );

      const isSurveyExist = await prisma.surveys.findFirst({
        where: {
          uuid: surveyUuid,
          lessons: {
            some: {
              chapters: {
                forum_course: {
                  some: {
                    forum_id: isForumExist.id,
                    ...whereCondition,
                  },
                },
              },
            },
          },
        },
      });

      if (!isSurveyExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.SurveyNotFound,
          data: null,
        };
      }
      const surveyDetail = isSurveyExist.survey_data as any;

      const downloadSurveys = await prisma.user_survey_status.findMany({
        where: { survey_id: isSurveyExist.id },
        select: {
          user: true,
          survey_answers: true,
          survey_id: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const data = downloadSurveys.map((survey) => {
        const surveyAnswers = (survey.survey_answers as any)?.surveyAnswer;

        const result: any = {
          forum_name: isForumExist.forum_name,
          company_name: isForumExist.company.company_name,
          first_name: survey.user.first_name,
          last_name: survey.user.last_name,
          title: surveyDetail?.title || surveyDetail?.name,
        };

        surveyAnswers?.forEach((element: any) => {
          result[element.question] = element.answer;
        });

        const response = {
          ...result,
          survey_completed_on: survey.createdAt,
        };

        return response;
      });

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(wb, ws, "Surveys");

      const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

      const filename = `${surveyDetail?.title || surveyDetail?.name}_survey_of_${isForumExist.company.company_name}_${isForumExist.forum_name}`;

      return {
        buffer,
        filename: `${filename.replaceAll(" ", "_")}.xlsx`,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async createUserSurvey(
    forumUuid: string,
    surveyUuid: string,
    userId: number,
    body: any
  ) {
    try {
      const [user, forum, survey] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.forum.findUnique({ where: { uuid: forumUuid } }),
        prisma.surveys.findUnique({ where: { uuid: surveyUuid } }),
      ]);

      if (!user) {
        throw {
          statusCode: 404,
          message: StaticMessage.UserNotFound,
        };
      }

      if (!forum) {
        throw {
          statusCode: 404,
          message: StaticMessage.ForumNotFound,
        };
      }

      if (!survey) {
        throw {
          statusCode: 404,
          message: StaticMessage.SurveyNotFound,
        };
      }

      await prisma.user_survey_status.create({
        data: {
          user_id: user.id,
          survey_id: survey.id,
          survey_answers: body,
        },
      });

      return { message: StaticMessage.UserResponsesSaved, data: null };
    } catch (error) {
      throw error;
    }
  }

  async getUserSurvey(forumUuid: string, surveyUuid: string, userId: number) {
    try {
      const result: any = await prisma.$queryRaw`
      SELECT 
        uss.survey_answers
      FROM 
        "User" u
      INNER JOIN 
        "Forum" f ON f.uuid::uuid = ${forumUuid}::uuid
      INNER JOIN 
        "surveys" s ON s.uuid::uuid = ${surveyUuid}::uuid
      LEFT JOIN 
        "user_survey_status" uss ON uss.user_id = u.id AND uss.survey_id = s.id
      WHERE 
        u.id = ${userId}
      LIMIT 1;
    `;

      if (!result.length) {
        throw {
          statusCode: 404,
          message: StaticMessage.UserSurveyNotFound,
        };
      }

      const { survey_answers } = result[0];

      if (!survey_answers) {
        return {
          message: StaticMessage.UserSurveyAnswersNotFound,
          data: {
            user_survey_answers: null,
          },
        };
      }

      return {
        message: StaticMessage.UserResponseRetrieved,
        data: {
          user_survey_answers: survey_answers.surveyMetadata,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
