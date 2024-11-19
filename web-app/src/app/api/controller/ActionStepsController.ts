import { StaticMessage } from "../constants/StaticMessages";
import prisma from "@/lib/prisma";
import { ActionSteps } from "../infrastructure/dtos/ActionSteps";
import { ActionStepsValidator } from "../validators/ActionStepsValidator";

export class ActionStepsController {
  async CreateActionSteps(body: ActionSteps) {
    try {
      await new ActionStepsValidator().ActionSteps(body);

      const isChapterExist = await prisma.chapters.findUnique({
        where: {
          uuid: body.chapter_uuid,
        },
      });

      if (!isChapterExist) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const actionStepsExist = await prisma.action_steps.findMany({
        where: { chapter_id: isChapterExist.id },
      });

      if (actionStepsExist.length) {
        throw {
          message: StaticMessage.ActionStepsAlreadyExist,
          data: null,
          statusCode: 404,
        };
      }

      const actionSteps = await prisma.action_steps.create({
        data: {
          chapter_id: isChapterExist.id,
          name: body.name,
          description: body.description,
          times_per_year: body.times_per_year,
          is_active: false,
        },
      });

      return {
        message: StaticMessage.AnActionStepsCreatedSuccessfully,
        data: {
          action_steps_info: {
            chapter_id: actionSteps.chapter_id,
            name: actionSteps.name,
            description: actionSteps.description,
            times_per_year: actionSteps.times_per_year,
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getActionStepsByUuid(actionStepsUuid: string) {
    try {
      const actionSteps = await prisma.action_steps.findUnique({
        where: {
          uuid: actionStepsUuid,
        },
      });

      if (!actionSteps) {
        throw {
          statusCode: 404,
          message: StaticMessage.ActionStepsNotFound,
          data: null,
        };
      }

      return {
        message: StaticMessage.ActionStepsFetchedSuccessfully,
        data: {
          action_steps_info: {
            uuid: actionSteps.uuid,
            chapter_id: actionSteps.chapter_id,
            name: actionSteps.name,
            description: actionSteps.description,
            times_per_year: actionSteps.times_per_year,
            is_active: actionSteps.is_active,
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateActionStepsDetailByUuid(
    actionStepsUuid: string,
    body: {
      chapter_uuid?: string;
      name?: string;
      description?: string;
      times_per_year?: number;
    }
  ) {
    try {
      await new ActionStepsValidator().UpdateActionSteps(body);

      const actionSteps = await prisma.action_steps.findUnique({
        where: {
          uuid: actionStepsUuid,
        },
      });

      if (!actionSteps) {
        throw {
          statusCode: 404,
          message: StaticMessage.ActionStepsNotFound,
          data: null,
        };
      }

      let chapter;
      if (body.chapter_uuid) {
        chapter = await prisma.chapters.findUnique({
          where: {
            uuid: body.chapter_uuid,
          },
          select: {
            id: true,
            uuid: true,
            name: true,
            description: true,
            is_active: true,
            lessons: true,
          },
        });

        if (!chapter) {
          throw {
            statusCode: 404,
            message: StaticMessage.ChapterNotFound,
            data: null,
          };
        }
      }

      const updateData: any = {};
      if (body.chapter_uuid)
        updateData.chapter_id = chapter ? chapter.id : actionSteps.chapter_id;
      if (body.name) updateData.name = body.name;
      if (body.description) updateData.description = body.description;
      if (body.times_per_year) updateData.times_per_year = body.times_per_year;

      updateData.updatedAt = new Date();

      await prisma.action_steps.update({
        data: updateData,
        where: {
          uuid: actionStepsUuid,
        },
      });

      return {
        message: StaticMessage.ActionStepsUpdatedSuccessfully,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deleteActionStepsByUuid(actionStepsUuid: string) {
    try {
      const actionSteps: any = await prisma.action_steps.findUnique({
        where: {
          uuid: actionStepsUuid,
        },
      });

      if (!actionSteps) {
        throw {
          statusCode: 404,
          message: StaticMessage.ActionStepsNotFound,
          data: null,
        };
      }

      await prisma.action_steps.delete({
        where: {
          uuid: actionStepsUuid,
        },
      });

      return {
        message: StaticMessage.ActionStepsDeletedSuccessfully,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
  async storeActionStepTransaction(
    userId: number,
    forumUuid: string,
    chaptersUuid: string,
    message: string
  ) {
    try {
      // Check if the forum exists
      const isForumExist = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
      });

      if (!isForumExist) {
        throw {
          message: StaticMessage.ForumNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const isChaptersExist = await prisma.chapters.findUnique({
        where: {
          uuid: chaptersUuid,
        },
        include: {
          action_steps: true,
        },
      });

      let actionStep = isChaptersExist?.action_steps;

      if (!actionStep || actionStep.length === 0) {
        throw {
          message: StaticMessage.ActionStepsNotFound,
          data: null,
          statusCode: 404,
        };
      }

      // Check if the action step exists
      const isActionStepExist = await prisma.action_steps.findUnique({
        where: {
          uuid: actionStep[0].uuid,
        },
      });

      if (!isActionStepExist) {
        throw {
          message: StaticMessage.ActionStepsNotFound,
          data: null,
          statusCode: 404,
        };
      }

      // Create the transaction entry
      const actionStepTransaction =
        await prisma.user_forum_action_step_status.create({
          data: {
            user_id: userId,
            forum_id: isForumExist.id,
            action_step_id: isActionStepExist.id,
            message: message,
          },
        });

      return {
        message: StaticMessage.AnActionStepsCreatedSuccessfully,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getMessagesByForumAndActionStep(
    forumUuid: string,
    chapterUuid: string,
    userUuid: string,
    previousOrder: number
  ) {
    try {
      // Check if the forum exists
      const isForumExist = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
      });

      if (!isForumExist) {
        throw {
          message: StaticMessage.ForumNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const isChaptersExist = await prisma.chapters.findUnique({
        where: {
          uuid: chapterUuid,
        },
        select: {
          course_id: true,
        },
      });

      const allChapters = await prisma.chapters.findMany({
        where: {
          courses: {
            id: isChaptersExist?.course_id,
          },
        },
        orderBy: {
          order: "asc",
        },
        include: {
          action_steps: true,
        },
      });

      const currentIndex = allChapters.findIndex(
        (chapter) => chapter.uuid === chapterUuid
      );

      if (currentIndex === -1) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }

      let targetIndex = currentIndex - previousOrder;

      if (targetIndex < 0) {
        return {
          message: StaticMessage.NoPreviousChapterFound,
          data: {
            message: [],
            action_step_info: {},
            other_user_first_names: [],
            is_current_chapter: targetIndex === currentIndex ? true : false,
            previous_chapter_count: 0,
          },
        };
      }

      let actionStep = allChapters[targetIndex].action_steps;

      if (!actionStep || actionStep.length === 0) {
        throw {
          message: StaticMessage.ActionStepsNotFound,
          data: null,
          statusCode: 404,
        };
      }

      // Check if the action step exists
      const isActionStepExist = await prisma.action_steps.findUnique({
        where: {
          uuid: actionStep[0].uuid,
        },
      });

      if (!isActionStepExist) {
        throw {
          message: StaticMessage.ActionStepsNotFound,
          data: null,
          statusCode: 404,
        };
      }

      if (!isActionStepExist.is_active) {
        throw {
          message: StaticMessage.ActionStepsNotPublished,
          data: null,
          statusCode: 400,
        };
      }

      // Retrieve messages
      const allMessages = await prisma.user_forum_action_step_status.findMany({
        where: {
          forum_id: isForumExist.id,
          action_step_id: isActionStepExist.id,
        },
        include: {
          user: {
            select: {
              uuid: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Get today's date string
      const todayDateString = new Date().toDateString();
      if (previousOrder === 0) {
        // Filter today's messages by the user
        const userTodayMessages = allMessages.filter(
          (message) =>
            message.user.uuid === userUuid &&
            message.createdAt.toDateString() === todayDateString
        );

        // Check if there are no messages for today by the user
        if (userTodayMessages.length === 0) {
          const otherUserFirstNames = allMessages
            .filter(
              (message) => message.createdAt.toDateString() === todayDateString
            )
            .map((message) => message.user.first_name);

          return {
            message: StaticMessage.MessagesFetchedSuccessfully,
            data: {
              message: [],
              action_step_info: {
                uuid: isActionStepExist.uuid,
                name: isActionStepExist.name,
                description: isActionStepExist.description,
              },
              is_current_chapter: targetIndex === currentIndex ? true : false,
              other_user_first_names: [...new Set(otherUserFirstNames)],
              previous_chapter_count: currentIndex,
            },
          };
        }
      }

      // Determine the frequency based on times_per_year
      const frequency = isActionStepExist.times_per_year;
      let period: number;

      switch (frequency) {
        case 1:
          period = 365; // yearly
          break;
        case 4:
          period = 90; // quarterly
          break;
        case 12:
          period = 30; // monthly
          break;
        case 52:
          period = 7; // weekly
          break;
        case 365:
          period = 1; // daily
          break;
        default:
          period = 0;
          break;
      }

      // Filter user messages based on the submission frequency
      const userMessages = allMessages.filter(
        (message) => message.user.uuid === userUuid
      );

      const submissionDates = userMessages.map((message) =>
        message.createdAt.toDateString()
      );
      // Filter all messages based on the user's submission dates
      const filteredMessages = allMessages.filter((message) =>
        submissionDates.includes(message.createdAt.toDateString())
      );

      // Get the list of first names of other users who submitted action steps
      const otherUserFirstNames = allMessages
        .filter(
          (message) => message.createdAt.toDateString() === todayDateString
        )
        .map((message) => message.user.first_name);

      const responseData = filteredMessages.map((message) => ({
        action_step_message: {
          user_info: {
            uuid: message.user.uuid,
            first_name: message.user.first_name,
            last_name: message.user.last_name,
            email: message.user.email,
          },
          uuid: message.uuid,
          message: message.message,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        },
      }));

      return {
        message: StaticMessage.MessagesFetchedSuccessfully,
        data: {
          message: responseData,
          action_step_info: {
            uuid: isActionStepExist.uuid,
            name: isActionStepExist.name,
            description: isActionStepExist.description,
          },
          is_current_chapter: targetIndex === currentIndex ? true : false,
          other_user_first_names:
            previousOrder > 0 ? [] : [...new Set(otherUserFirstNames)],
          previous_chapter_count: currentIndex,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateActionStepStatus(body: any, actionStepUuid: string) {
    try {
      const action_step = await prisma.action_steps.findUnique({
        where: { uuid: actionStepUuid },
      });

      if (!action_step) {
        throw {
          message: StaticMessage.LessonNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const { is_active } = body;

      await prisma.action_steps.update({
        where: { id: action_step.id },
        data: { is_active, updatedAt: new Date() },
      });

      const message = is_active ? "enabled" : "disabled";

      return {
        message: `Action step ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
