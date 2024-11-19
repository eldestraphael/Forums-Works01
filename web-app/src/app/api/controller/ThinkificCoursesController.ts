import prisma from "@/lib/prisma";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { StaticMessage } from "../constants/StaticMessages";

enum AssetType {
  Pdf = "pdf",
  Video = "video",
  Text = "text",
  Audio = "audio",
  Image = "image",
}

export class ThinkificCoursesController {
  async migrateCoursesFromThinkific(pageNumber: number, limit: number) {
    try {
      if (!process.env.THINKIFIC_API_KEY || !process.env.THINKIFIC_SUB_DOMAIN) {
        throw new Error("Thinkific API key or subdomain is missing.");
      }

      const metaItems = await prisma.faw_thinkific_course_meta.findFirst({
        select: {
          thinkific_total_items: true,
          id: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      if (!metaItems) {
        const userMeta = await this.fetchCourseData(pageNumber, limit);
        const { total_items } = userMeta.data.meta.pagination;

        const createdMeta = await prisma.faw_thinkific_course_meta.create({
          data: {},
        });

        const { fetchedRecords } = await this.fetchRecords(
          total_items,
          pageNumber,
          limit,
          createdMeta.id
        );

        await prisma.faw_thinkific_course_meta.update({
          where: { id: createdMeta.id },
          data: {
            migrated_count: fetchedRecords,
            thinkific_total_items: fetchedRecords,
          },
        });

        return {
          messages: StaticMessage.coursesFetchedSuccessfully,
          data: null,
        };
      } else {
        const previousFinalPage = Math.ceil(
          metaItems.thinkific_total_items! / limit
        );

        const reminderValue = metaItems.thinkific_total_items! % limit;

        const currentPageNumber =
          reminderValue === 0 ? previousFinalPage + 1 : previousFinalPage;

        const itemsCount = await prisma.faw_thinkific_courses.count();

        const migratedMeta = await prisma.faw_thinkific_course_meta.create({
          data: {},
        });

        const { fetchedRecords, courseTotalItems } = await this.fetchRecords(
          itemsCount,
          currentPageNumber,
          limit,
          migratedMeta.id
        );

        const migratedCountDifference = courseTotalItems - fetchedRecords;

        await prisma.faw_thinkific_course_meta.update({
          where: { id: migratedMeta.id },
          data: {
            migrated_count: migratedCountDifference,
            thinkific_total_items: courseTotalItems,
          },
        });

        return {
          messages: StaticMessage.coursesMigratedSuccessfully,
          data: null,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async fetchCourseData(pageNumber: number, limit: number) {
    return axios.get(
      `https://api.thinkific.com/api/public/v1/courses?page=${pageNumber}&limit=${limit}`,
      {
        headers: {
          "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
          "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
        },
      }
    );
  }

  async fetchRecords(
    itemsCount: number,
    pageNumber: number,
    limit: number,
    metaId: number
  ) {
    let fetchedRecords = 0;
    let courseTotalItems = 0;
    let course;

    while (fetchedRecords < itemsCount) {
      const remainingRecords = itemsCount - fetchedRecords;
      const recordsToFetch = Math.min(limit, remainingRecords);

      const courseData = await this.fetchCourseData(pageNumber, limit);

      fetchedRecords += recordsToFetch;

      if (fetchedRecords < itemsCount) {
        pageNumber++;
      }

      course = await this.processCourseData(courseData.data.items, metaId);

      courseTotalItems = courseData.data.meta.pagination.total_items;
    }

    return { fetchedRecords, courseTotalItems, course };
  }

  async processCourseData(courseItems: any[], metaId: number) {
    for (const item of courseItems) {
      const existingCourse = await prisma.faw_thinkific_courses.findUnique({
        where: { id: item.id },
      });

      if (!existingCourse) {
        await prisma.faw_thinkific_courses.create({
          data: {
            id: item.id,
            faw_thinkific_course_meta_id: metaId,
            name: item.name,
            slug: item.slug,
            product_id: item.product_id,
            description: item.description,
            thinkific_user_id: item.user_id,
            instructor_id: item.instructor_id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });

        await prisma.courses.create({
          data: {
            id: item.id,
            name: item.name,
            description: item.description,
          },
        });
      }
    }
  }

  async getAllCourses() {
    try {
      const courses = await prisma.faw_thinkific_courses.findMany();

      if (!courses) {
        throw {
          message: StaticMessage.ThinkificCoursesNotFound,
          data: null,
          statusCode: 404,
        };
      }

      return {
        message: StaticMessage.ThinkificCoursesFetchedSuccessfully,
        data: courses.map((item) => {
          return { course_info: item };
        }),
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getCourseByUuid(courseUuid: string) {
    try {
      const course = await prisma.faw_thinkific_courses.findUnique({
        where: {
          uuid: courseUuid,
        },
      });

      if (!course) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ThinkificCourseNotFound,
        };
      }

      return {
        message: StaticMessage.ThinkificCourseFetchedSuccessfully,
        data: {
          course_info: course,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async migrateChaptersFromThinkific(courseUuid: string) {
    try {
      const isCourseExist = await prisma.courses.findUnique({
        where: { uuid: courseUuid },
      });

      if (!isCourseExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ThinkificCourseNotFound,
        };
      }

      const courseResponse = await axios.get(
        `https://api.thinkific.com/api/public/v1/courses/${isCourseExist.id}`,
        {
          headers: {
            "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
            "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
          },
        }
      );

      const chapterIds = courseResponse.data.chapter_ids;

      const chapterPromises = chapterIds.map(async (chapterId: any) => {
        try {
          const chapterResponse = await axios.get(
            `https://api.thinkific.com/api/public/v1/chapters/${chapterId}`,
            {
              headers: {
                "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
              },
            }
          );

          const { id, name, description, position } = chapterResponse.data;

          return prisma.chapters.create({
            data: {
              id,
              name,
              description,
              course_id: isCourseExist.id,
              order: position,
            },
          });
        } catch (error) {
          throw error;
        }
      });

      await Promise.all(chapterPromises);

      return {
        message: StaticMessage.chaptersMigratedSuccessfully,
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async migrateLessonsFromThinkific(courseUuid: string, chapterUuid: string) {
    try {
      const isCourseExist = await prisma.courses.findUnique({
        where: { uuid: courseUuid },
      });

      if (!isCourseExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ThinkificCourseNotFound,
        };
      }

      const isChapterExist = await prisma.chapters.findUnique({
        where: { uuid: chapterUuid },
      });

      if (!isChapterExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.ChapterNotFound,
        };
      }

      const chapterResponse = await axios.get(
        `https://api.thinkific.com/api/public/v1/chapters/${isChapterExist.id}`,
        {
          headers: {
            "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
            "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
          },
        }
      );

      const lessonIds = chapterResponse.data.content_ids;

      const lessonPromises = lessonIds.map(async (chapterId: any) => {
        try {
          const lessonResponse = await axios.get(
            `https://api.thinkific.com/api/public/v1/contents/${chapterId}`,
            {
              headers: {
                "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
              },
            }
          );

          const { id, name, contentable_type } = lessonResponse.data;

          if (
            contentable_type === "Pdf" ||
            contentable_type === "Audio" ||
            contentable_type === "Video" ||
            contentable_type === "Image"
          ) {
            let asset_type: AssetType | undefined;

            if (contentable_type === "Pdf") {
              asset_type = AssetType.Pdf;
            } else if (contentable_type === "Audio") {
              asset_type = AssetType.Audio;
            } else if (contentable_type === "Video") {
              asset_type = AssetType.Video;
            } else if (contentable_type === "Image") {
              asset_type = AssetType.Image;
            }

            if (asset_type) {
              return await prisma.lessons.create({
                data: {
                  id,
                  name,
                  chapter_id: isChapterExist.id,
                  asset_type,
                  is_active: false,
                },
              });
            }
          }

          return null;
        } catch (error) {
          throw error;
        }
      });

      await Promise.all(lessonPromises);

      return {
        message: StaticMessage.chaptersMigratedSuccessfully,
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }
}
