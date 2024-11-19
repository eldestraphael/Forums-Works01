import prisma from "@/lib/prisma";
import { differenceInCalendarDays, isAfter, addMinutes } from "date-fns";
import { LessonController } from "./LessonController";
import { StaticMessage } from "../constants/StaticMessages";
import { StatusController } from "./StatusController";

export class UserForumPreWorkController {
  async getPreworkBasedOnUserForum(forumUuid: string, userUuid: string) {
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
            },
          },
        },
      });

      if (!userForum) {
        throw {
          statusCode: 401,
          message: "Unauthorized",
        };
      }

      let { forumCourse, chapter } = await this.calculateAndGetCurrentChapter(
        forumUuid
      );

      if (forumCourse && forumCourse.forum.is_active === false) {
        throw {
          statusCode: 400,
          message: StaticMessage.ForumIsNotActive,
          data: null,
        };
      }

      // Retrieve the user progress in the forum
      const userProgressList = await prisma.user_forum_prework_status.findMany({
        where: {
          user: {
            uuid: userUuid,
          },
          forum_course: {
            id: forumCourse?.id,
          },
        },
        include: {
          lessons: {
            include: {
              pdfs: true,
              videos: true,
              audios: true,
              images: true,
              surveys: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Get all lessons for the current chapter
      const allLessons = await prisma.lessons.findMany({
        where: {
          chapter_id: chapter?.id,
          is_active: true,
        },
        include: {
          pdfs: true,
          videos: true,
          audios: true,
          images: true,
          forum_preps: true,
          surveys: true,
        },
        orderBy: {
          order: "asc",
        },
      });

      // Create a map for quick lookup of user progress by lesson ID
      const userProgressMap = new Map(
        userProgressList.map((up) => [up.lesson_id, up])
      );

      const lessonCompletionCounts =
        await prisma.user_forum_prework_status.groupBy({
          by: ["lesson_id"],
          where: {
            forum_course_id: forumCourse?.id,
          },
          _count: {
            lesson_id: true,
          },
        });

      const lessonCompletionMap = new Map(
        lessonCompletionCounts.map((count) => [
          count.lesson_id,
          count._count.lesson_id,
        ])
      );

      // Map lessons to include user progress metadata
      let lessons = allLessons.map((lesson: any) => {
        const userProgress = userProgressMap.get(lesson.id);
        const completionCount = lessonCompletionMap.get(lesson.id) || 0;
        return {
          uuid: lesson.uuid,
          name: lesson.name,
          asset_type: lesson.asset_type,
          is_preview: lesson.is_preview,
          is_prerequisite: lesson.is_prerequisite,
          is_discussion_enabled: lesson.is_discussion_enabled,
          is_downloadable: lesson.is_downloadable,
          is_active: lesson.is_active,
          is_current_lesson:
            userProgress && userProgress.is_current_lesson
              ? userProgress.is_current_lesson
              : false,
          asset_info: new LessonController().checkAssetTypeAndReturnValue(
            lesson.asset_type,
            lesson
          ),
          prework_meta_data: userProgress
            ? {
              lesson_uuid: userProgress.lessons?.uuid,
              status: userProgress.status,
              status_percent: userProgress.status_percent,
              is_current_lesson: userProgress.is_current_lesson,
              completion_count: completionCount,
            }
            : {
              lesson_uuid: lesson.uuid,
              status: 0,
              status_percent: 0,
              is_current_lesson: false,
              completion_count: completionCount
            },
        };
      });

      if (!userProgressList.length) {
        lessons[0]["is_current_lesson"] = true;
      }

      return {
        message: StaticMessage.LMSPreworkDetailsFetched,
        data: {
          course_info: {
            uuid: forumCourse?.courses.uuid,
            name: forumCourse?.courses.name,
            describe: forumCourse?.courses.description,
          },
          chapter_info: chapter
            ? {
              uuid: chapter.uuid,
              name: chapter.name,
              describe: chapter.description,
            }
            : null,
          lessons: lessons,
        },
      };
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  }

  async createOrUpdateLessonPreworkStatus(
    forumUuid: string,
    userId: number,
    body: any
  ) {
    try {
      const forumCourse = await prisma.forum_course.findFirst({
        where: {
          forum: {
            uuid: forumUuid,
          },
          is_current_course: true,
        },
      });

      if (!forumCourse) {
        throw { statusCode: 404, message: StaticMessage.ForumNotFound };
      }

      let lesson = await prisma.lessons.findUnique({
        where: {
          uuid: body.lesson_uuid,
        },
        select: {
          id: true,
          chapter_id: true,
        },
      });

      if (!lesson) {
        throw { statusCode: 404, message: StaticMessage.LessonNotFound };
      }

      const existingStatus = await prisma.user_forum_prework_status.findFirst({
        where: {
          forum_course_id: forumCourse.id,
          user_id: userId,
          chapter_id: lesson.chapter_id,
          lesson_id: lesson.id,
        },
      });

      let userForumPreworkStatus;

      if (existingStatus) {
        // Update the existing record
        userForumPreworkStatus = await prisma.user_forum_prework_status.update({
          where: { id: existingStatus.id },
          data: {
            status: body.status,
            status_percent: body.status_percent,
            is_current_lesson: body.is_current_lesson,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create a new record
        userForumPreworkStatus = await prisma.user_forum_prework_status.create({
          data: {
            forum_course_id: forumCourse.id,
            user_id: userId,
            chapter_id: lesson.chapter_id,
            lesson_id: lesson.id,
            status: body.status,
            status_percent: body.status_percent,
            is_current_lesson: body.is_current_lesson,
          },
        });
      }

      return {
        message: StaticMessage.LessonStatusBasedOnPreWorkUpdated,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async calculateAndGetCurrentChapter(forumUuid: string) {
    try {
      // Get the current date and time
      const currentDate = new Date();
      const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

      // Retrieve the current course for the forum
      const forumCourse = await prisma.forum_course.findFirst({
        where: {
          forum: {
            uuid: forumUuid,
          },
          is_current_course: true,
        },
        include: {
          courses: true,
          chapters: true,
          forum: true,
        },
      });

      if (!forumCourse) {
        throw {
          statusCode: 404,
          message: StaticMessage.NoCurrentCourse,
        };
      }

      const currentDay = new Date(new Date().toISOString());

      const startingDate = forumCourse.starting_date!;
      const meetingDay = forumCourse.forum.meeting_day!; // Assuming this is a string like "Tuesday"
      const meetingTime = forumCourse.forum.meeting_time!; // Assuming this is a string like "12:00"

      let startingDateAndTime = new Date(
        `${startingDate.toISOString().split("T")[0]}T${meetingTime}.000Z`
      );

      if (currentDate < startingDateAndTime) {
        throw {
          message: StaticMessage.ForumHasNotStarted,
          statusCode: 400,
          data: null,
        };
      }

      let nextMeeting = await new StatusController().calculateNextMeeting(
        currentDay,
        meetingDay,
        meetingTime
      );

      let updatedNextMeeting = new Date(
        `${nextMeeting.split(" ")[0]}T${nextMeeting.split(" ")[1]}Z`
      );

      const nextMeetingEndTime = addMinutes(new Date(updatedNextMeeting), 90);

      // Calculate the difference in days
      let dayDifference = differenceInCalendarDays(
        nextMeetingEndTime,
        startingDate
      );

      if (currentDate < new Date(nextMeetingEndTime)) {
        if (dayDifference > 0) {
          dayDifference = dayDifference - 1;
        }
      }

      // Determine the current chapter based on the day difference
      const chapters = await prisma.chapters.findMany({
        where: {
          course_id: forumCourse.course_id,
        },
        orderBy: {
          order: "asc",
        },
      });

      const currentChapterIndex = chapters.findIndex(
        (chapter) => chapter.id === forumCourse.chapters?.id
      );

      let updatedChapterList =
        currentChapterIndex > 0
          ? chapters.slice(currentChapterIndex)
          : chapters;

      let chapter = updatedChapterList[Math.floor(dayDifference / 7)];

      if (!chapter) {
        throw {
          message: "No chapter found for this week",
          data: null,
        };
      }
      return { forumCourse, chapter };
    } catch (err: any) {
      throw err;
    }
  }
}
