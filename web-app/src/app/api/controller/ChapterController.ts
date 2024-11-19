import { StaticMessage } from "../constants/StaticMessages";
import { Chapter, UpdateChapter } from "../infrastructure/dtos/Chapter";
import prisma from "@/lib/prisma";
import { ChapterValidator } from "../validators/ChapterValidator";
import { checkScopeAccess } from "../helpers/checkScopeAccess";
import { ModeratorGuideController } from "./ModeratorGuideController";
import { CourseValidator } from "../validators/CoursesValidator";

export class ChapterController {
  async CreateChapter(roleUuid: string, body: Chapter) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "add_course", "create");

      await new ChapterValidator().Chapter(body);
      const isCourseExist = await prisma.courses.findUnique({
        where: {
          uuid: body.course_uuid,
        },
      });

      if (!isCourseExist) {
        throw {
          message: StaticMessage.CourseNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const isChaptersExist = await prisma.chapters.findFirst({
        where: {
          name: body.name,
          course_id: isCourseExist.id,
        },
      });

      if (isChaptersExist) {
        throw {
          message: StaticMessage.ChapterAlreadyExist,
          data: null,
          statusCode: 404,
        };
      }

      const maxOrder = await prisma.chapters
        .findMany({
          where: { course_id: isCourseExist.id },
          orderBy: { order: "desc" },
          take: 1,
        })
        .then((chapters) => (chapters.length > 0 ? chapters[0].order : 0));

      const chapters = await prisma.chapters.create({
        data: {
          name: body.name,
          description: body.description,
          course_id: isCourseExist.id,
          order: maxOrder! + 1,
        },
        select: {
          uuid: true,
          name: true,
          description: true,
        },
      });

      return {
        message: StaticMessage.ChapterCreatedSuccessfully,
        data: {
          chapter_info: {
            uuid: chapters.uuid,
            name: chapters.name,
            description: chapters.description,
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async GetAllChapters(request: any, roleUuid: string) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "all_courses", "read");

      const searchQuery = request.nextUrl.searchParams.get("search");
      const page = Number(request.nextUrl.searchParams.get("page")) || 1;
      const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
      const offset = (page - 1) * limit;

      const chapters = await prisma.chapters.findMany({
        skip: offset,
        take: limit,
        where: searchQuery
          ? {
              name: {
                contains: searchQuery,
                mode: "insensitive",
              },
              is_active: true,
            }
          : {
              is_active: true,
            },
        select: {
          uuid: true,
          name: true,
          description: true,
          is_active: true,
          lessons: {
            orderBy: { order: "asc" },
          },
          order: true,
        },
        orderBy: { order: "asc" },
      });

      const count = await prisma.chapters.count({
        where: searchQuery
          ? {
              name: {
                contains: searchQuery,
                mode: "insensitive",
              },
              is_active: true,
            }
          : {
              is_active: true,
            },
      });

      if (!chapters) {
        throw {
          statusCode: 404,
          message: StaticMessage.ChaptersNotFound,
          data: null,
        };
      }

      const chapterMap = chapters.map((chapterItem) => ({
        chapter_info: {
          uuid: chapterItem.uuid,
          name: chapterItem.name,
          description: chapterItem.description,
          is_active: chapterItem.is_active,
          no_of_lessons: chapterItem.lessons.length,
          order: chapterItem.order,
        },
      }));

      return {
        message: StaticMessage.ChaptersFetchedSuccessfully,
        data: chapterMap,
        page_meta: {
          current: page,
          total: Math.ceil(count / limit),
          data_per_page: limit,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getChapterDetailByUuid(roleUuid: string, chapterUuid: string) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "view_course", "read");

      const chapter: any = await prisma.chapters.findUnique({
        where: {
          uuid: chapterUuid,
        },
        select: {
          id: true,
          uuid: true,
          name: true,
          description: true,
          is_active: true,
          lessons: {
            orderBy: { order: "asc" },
          },
          order: true,
        },
      });

      if (!chapter) {
        throw {
          statusCode: 404,
          message: StaticMessage.ChapterNotFound,
          data: null,
        };
      }

      const actionSteps = await prisma.action_steps.findMany({
        where: {
          chapter_id: chapter.id,
        },
      });

      const moderatorGuide = new ModeratorGuideController();

      const getModeratorGuide: any = await moderatorGuide.getModeratorGuide(
        chapterUuid
      );

      delete getModeratorGuide.data.action_step;

      return {
        message: StaticMessage.ChapterFetchedSuccessfully,
        data: {
          chapter_info: {
            uuid: chapter.uuid,
            name: chapter.name,
            description: chapter.description,
            is_active: chapter.is_active,
            order: chapter.order,
            lesson_info: chapter.lessons.map((lesson: any) => ({
              uuid: lesson.uuid,
              name: lesson.name,
              asset_type: lesson.asset_type,
              order: lesson.order,
              is_active: lesson.is_active,
            })),
            action_steps_info: actionSteps[0]
              ? {
                  uuid: actionSteps[0].uuid,
                  chapter_id: actionSteps[0].chapter_id,
                  name: actionSteps[0].name,
                  description: actionSteps[0].description,
                  is_active: actionSteps[0].is_active,
                }
              : {},
            moderator_guide_info: getModeratorGuide.data
              ? getModeratorGuide.data
              : {},
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateChapterDetailByUuid(chapterUuid: string, body: UpdateChapter) {
    try {
      await new ChapterValidator().UpdateChapter(body);

      const chapter: any = await prisma.chapters.findUnique({
        where: {
          uuid: chapterUuid,
        },
      });

      if (!chapter) {
        throw {
          statusCode: 404,
          message: StaticMessage.ChapterNotFound,
          data: null,
        };
      }

      await prisma.chapters.update({
        data: body,
        where: {
          uuid: chapterUuid,
        },
      });

      return {
        message: StaticMessage.ChapterUpdatedSuccessfully,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async deleteChapterDetailByUuid(chapterUuid: string) {
    try {
      const chapter: any = await prisma.chapters.findUnique({
        where: {
          uuid: chapterUuid,
        },
      });

      if (!chapter) {
        throw {
          statusCode: 404,
          message: StaticMessage.ChapterNotFound,
          data: null,
        };
      }

      await prisma.chapters.delete({
        where: {
          uuid: chapterUuid,
        },
      });

      return {
        message: StaticMessage.ChapterDeletedSuccessfully,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateChapterOrder(
    courseUuid: string,
    chapterUuid: string,
    newOrder: number
  ) {
    try {
      const isCourseExist = await prisma.courses.findUnique({
        where: {
          uuid: courseUuid,
        },
      });

      if (!isCourseExist) {
        throw {
          message: StaticMessage.CourseNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const isChaptersExist = await prisma.chapters.findUnique({
        where: {
          uuid: chapterUuid,
          course_id: isCourseExist.id,
        },
      });

      if (!isChaptersExist) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const chapters = await prisma.chapters.findMany({
        where: { course_id: isCourseExist.id },
        orderBy: { order: "asc" },
      });

      const updatedChapters = chapters.map((chapter, index) => {
        if (chapter.id === isChaptersExist.id) {
          return { ...chapter, order: newOrder };
        } else if (chapter.order! >= newOrder) {
          return { ...chapter, order: chapter.order! + 1 };
        }
        return chapter;
      });

        const sortedChapters = updatedChapters.sort(
          (a: any, b: any) => a.order - b.order
        );

        for (let index = 1; index <= sortedChapters.length; index++) {
          sortedChapters[index - 1].order = index;
        }


      // Update all affected chapters in the database
      const updatePromises = sortedChapters.map((chapter) =>
        prisma.chapters.update({
          where: { id: chapter.id },
          data: { order: chapter.order },
          select: {
            uuid: true,
            name: true,
            description: true,
            is_active: true,
            order: true,
          },
        })
      );

      await Promise.all(updatePromises);

      const finalChapters = await prisma.chapters.findMany({
        where: { course_id: isCourseExist.id },
        orderBy: { order: "asc" },
        select: {
          uuid: true,
          name: true,
          description: true,
          is_active: true,
          order: true,
        },
      });

      return {
        message: StaticMessage.ChapterOrderUpdatedSuccessfully,
        data: finalChapters,
      };
    } catch (err) {
      throw err;
    }
  }

  async updateChapterStatus(body: any, chapterUuid: string) {
    try {
      await new CourseValidator().UpdateCourseStatus(body);

      const chapter = await prisma.chapters.findUnique({
        where: { uuid: chapterUuid },
        select: {
          id: true,
          lessons: { select: { id: true } },
          action_steps: { select: { id: true } },
        },
      });

      if (!chapter) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const lessonIds = chapter.lessons.map((lesson) => lesson.id);

      const actionStepIds = chapter.action_steps.map(
        (actionStep) => actionStep.id
      );

      const { is_active } = body;

      await prisma.$transaction([
        prisma.chapters.update({
          where: { id: chapter.id },
          data: { is_active, updatedAt: new Date() },
        }),
        prisma.lessons.updateMany({
          where: { id: { in: lessonIds } },
          data: { is_active, updatedAt: new Date() },
        }),
        prisma.action_steps.updateMany({
          where: { id: { in: actionStepIds } },
          data: { is_active, updatedAt: new Date() },
        }),
      ]);

      const message = is_active ? "enabled" : "disabled";

      return {
        message: `Chapter ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
