import { StaticMessage } from "../constants/StaticMessages";
import { Course, UpdateCourse } from "../infrastructure/dtos/Course";
import prisma from "@/lib/prisma";
import { CourseValidator } from "../validators/CoursesValidator";
import { checkScopeAccess } from "../helpers/checkScopeAccess";

export class CourseContoller {
  async CreateCourse(roleUuid: string, body: Course) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "add_course", "create");

      await new CourseValidator().Course(body);

      const isCourseExist = await prisma.courses.findFirst({
        where: {
          name: body.name,
        },
      });

      if (isCourseExist) {
        throw {
          message: StaticMessage.CourseAlreadyExist,
          data: null,
          statusCode: 404,
        };
      }

      const course = await prisma.courses.create({
        data: {
          name: body.name,
          description: body.description,
        },
        select: {
          id: true,
          uuid: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          chapters: true,
        },
      });

      return {
        message: StaticMessage.CourseCreatedSuccessfully,
        data: {
          course_info: {
            uuid: course.uuid,
            name: course.name,
            description: course.description,
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async GetAllCourses(request: any, roleUuid: string) {
    try {
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 404,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      let role = await prisma.roles.findUnique({
        where: {
          uuid: roleUuid,
        },
        select: {
          name: true,
        },
      });

      if (role === null) {
        throw {
          statusCode: 401,
          message: StaticMessage.RoleNotFound,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "all_courses", "read");

      const searchQuery = request.nextUrl.searchParams.get("search");
      const page = Number(request.nextUrl.searchParams.get("page")) || 1;
      const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
      const isDropdown =
        request.nextUrl.searchParams.get("isDropdown") || false;
      let isActive = request.nextUrl.searchParams.get("is_active") || false;
      const offset = (page - 1) * limit;

      const dynamicChaptersFilter = isDropdown
        ? {
            chapters: {
              some: {
                is_active: true,
              },
            },
          }
        : {};

      if (role?.name !== "Super Admin") {
        isActive = "true";
      }

      const activeFilter = isActive === "true" ? { is_active: true } : {};

      const courses = await prisma.courses.findMany({
        skip: offset,
        take: limit,
        where: {
          AND: [
            activeFilter,
            {
              ...dynamicChaptersFilter,
            },
          ],
          ...(searchQuery && {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          }),
        },
        select: {
          id: true,
          uuid: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          chapters: true,
          is_active: true,
        },
      });

      const count = await prisma.courses.count({
        where: {
          AND: [
            activeFilter,
            {
              ...dynamicChaptersFilter,
            },
          ],
          ...(searchQuery && {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          }),
        },
      });

      if (courses.length === 0) {
        throw {
          statusCode: 401,
          message: StaticMessage.CoursesNotFoundOrNotPublished,
          data: null,
        };
      }

      const courseMap = courses.map((courseItem) => ({
        course_info: {
          uuid: courseItem.uuid,
          name: courseItem.name,
          description: courseItem.description,
          no_of_chapters: courseItem.chapters.length,
          is_active: courseItem.is_active,
        },
      }));

      return {
        message: StaticMessage.CoursesFetchedSuccessfully,
        data: courseMap,
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

  async getCourseDetailByUuid(
    request: any,
    roleUuid: string,
    courseUuid: string
  ) {
    try {
      const isDropdown =
        request.nextUrl.searchParams.get("isDropdown") === "true";
      if (roleUuid === null || roleUuid === undefined) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "view_course", "read");

      const course: any = await prisma.courses.findUnique({
        where: {
          uuid: courseUuid,
        },
        select: {
          id: true,
          uuid: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          chapters: isDropdown
            ? {
                orderBy: {
                  order: "asc",
                },
                where: {
                  is_active: true,
                },
              }
            : {
                orderBy: {
                  order: "asc",
                },
              },
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
      return {
        message: StaticMessage.CourseFetchedSuccessfully,
        data: {
          course_info: {
            uuid: course.uuid,
            name: course.name,
            is_active: course.is_active,
            description: course.description,
            chapter_info: course.chapters.map((chapter: any) => ({
              uuid: chapter.uuid,
              name: chapter.name,
              description: chapter.description,
              is_active: chapter.is_active,
              order: chapter.order,
            })),
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateCourseDetailByUuid(
    roleUuid: string,
    body: UpdateCourse,
    courseUuid: string
  ) {
    try {
      if (!roleUuid) {
        throw {
          statusCode: 401,
          message: StaticMessage.NoPasswordUser,
          data: null,
        };
      }

      await checkScopeAccess(roleUuid, "view_course", "update");

      await new CourseValidator().UpdateCourse(body);

      const isCourseExist = await prisma.courses.findUnique({
        where: {
          uuid: courseUuid,
        },
      });

      if (!isCourseExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.CourseNotFound,
        };
      }

      const { name, description } = body;
      await prisma.courses.update({
        data: {
          name,
          description,
          updatedAt: new Date(),
        },
        where: {
          uuid: courseUuid,
        },
      });

      return {
        message: StaticMessage.CourseUpdatedSuccessfully,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deleteCourseDetailByUuid(courseUuid: string) {
    try {
      const course: any = await prisma.courses.findUnique({
        where: {
          uuid: courseUuid,
        },
      });

      if (!course) {
        throw {
          statusCode: 404,
          message: StaticMessage.CourseNotFound,
          data: null,
        };
      }

      await prisma.courses.delete({
        where: {
          uuid: courseUuid,
        },
      });

      return {
        message: StaticMessage.CourseDeletedSuccessfully,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async PublishCourse(courseUuid: string, body: Course) {
    try {
      await new CourseValidator().PublishCourse(body);

      const course = await prisma.courses.findUnique({
        where: { uuid: courseUuid },
        select: {
          chapters: {
            select: {
              id: true,
              lessons: { select: { id: true } },
              action_steps: { select: { id: true } },
            },
          },
        },
      });

      if (!course) {
        throw {
          message: StaticMessage.CourseNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const chapterIds = course.chapters.map((chapter) => chapter.id);

      const lessonIds = course.chapters.flatMap((chapter) =>
        chapter.lessons.map((lesson) => lesson.id)
      );

      const actionStepIds = course.chapters.flatMap((chapter) =>
        chapter.action_steps.map((actionStep) => actionStep.id)
      );

      await prisma.$transaction([
        prisma.courses.update({
          where: { uuid: courseUuid },
          data: { is_active: true, updatedAt: new Date() },
        }),
        prisma.chapters.updateMany({
          where: { id: { in: chapterIds } },
          data: { is_active: true, updatedAt: new Date() },
        }),
        prisma.lessons.updateMany({
          where: { id: { in: lessonIds } },
          data: { is_active: true, updatedAt: new Date() },
        }),
        prisma.action_steps.updateMany({
          where: { id: { in: actionStepIds } },
          data: { is_active: true, updatedAt: new Date() },
        }),
      ]);

      return {
        message: StaticMessage.CoursePublishedSuccessfully,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateCourseStatus(body: any, courseUuid: string) {
    try {
      await new CourseValidator().UpdateCourseStatus(body);

      const course = await prisma.courses.findUnique({
        where: { uuid: courseUuid },
        select: {
          chapters: {
            select: {
              id: true,
              lessons: { select: { id: true } },
              action_steps: { select: { id: true } },
            },
          },
        },
      });

      if (!course) {
        throw {
          message: StaticMessage.CourseNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const chapterIds = course.chapters.map((chapter) => chapter.id);

      const lessonIds = course.chapters.flatMap((chapter) =>
        chapter.lessons.map((lesson) => lesson.id)
      );

      const actionStepIds = course.chapters.flatMap((chapter) =>
        chapter.action_steps.map((actionStep) => actionStep.id)
      );

      const { is_active } = body;

      await prisma.$transaction([
        prisma.courses.update({
          data: {
            is_active,
            updatedAt: new Date(),
          },
          where: {
            uuid: courseUuid,
          },
        }),
        prisma.chapters.updateMany({
          where: { id: { in: chapterIds } },
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
        message: `Course ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
