import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";

export class ForumPrepController {
  async createForumPrep(file: any, body: any) {
    try {
      return await prisma.forum_preps.create({
        data: {
          forum_prep_data: JSON.stringify(file), // need to remove stringfy
          asset_content_size: body.asset_content_size,
        },
      });
    } catch (err: any) {
      throw err;
    }
  }

  async getForumPrepById(forumPrepUuid: string) {
    try {
      const isForumPrepExist = await prisma.forum_preps.findUnique({
        where: {
          uuid: forumPrepUuid,
        },
      });

      if (!isForumPrepExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.ForumPrepNotFound,
          data: null,
        };
      }

      return isForumPrepExist;
    } catch (err: any) {
      throw err;
    }
  }

  async createUserForumPrepAnswers(
    forumUuid: string,
    userUuid: string,
    body: any
  ) {
    try {
      let userForum = await prisma.user_forum.findFirst({
        where: {
          forum: {
            uuid: forumUuid,
          },
          user: {
            uuid: userUuid,
          },
        },
        select: {
          user: {
            select: {
              is_active: true,
              id: true,
            },
          },
        },
      });

      if (!userForum) {
        throw {
          statusCode: 404,
          message: StaticMessage.UserOrForumNotFound,
        };
      }

      const lesson = await prisma.lessons.findUnique({
        where: {
          uuid: body.lesson_uuid,
        },
        select: {
          user_forum_prework_status: {
            select: {
              id: true,
              lesson_id: true,
            },
          },
          id: true,
        },
      });

      if (!lesson) {
        throw {
          statusCode: 404,
          message: StaticMessage.LessonNotFound,
          data: null,
        };
      }

      const forumPrep = await prisma.forum_preps.findUnique({
        where: {
          uuid: body.forum_prep_uuid,
        },
      });

      if (!forumPrep) {
        throw {
          statusCode: 404,
          message: StaticMessage.ForumPrepNotFound,
          data: null,
        };
      }

      const userForumPreworkStatusId = lesson.user_forum_prework_status.filter(
        (item) => item.lesson_id === lesson.id
      );

      await prisma.user_forum_prep_status.create({
        data: {
          user_id: userForum.user.id,
          forum_prep_id: forumPrep.id,
          user_forum_prework_status_id: userForumPreworkStatusId[0].id,
          forum_prep_answers: body.forum_prep_answers,
          score: body.forum_prep_score,
        },
      });

      return {
        message: StaticMessage.StoredUserForumPrepAnswers,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
