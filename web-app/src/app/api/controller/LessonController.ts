import { StaticMessage } from "../constants/StaticMessages";
import prisma from "@/lib/prisma";
import { LessonValidator } from "../validators/LessonValidator";
import { PdfsController } from "./PdfsController";
import { VideosController } from "./VideosController";
import { AudiosController } from "./AudioController";
import { ImagesController } from "./ImagesController";
import { CourseValidator } from "../validators/CoursesValidator";
import { ForumPrepController } from "./ForumPrepController";
import { SurveysController } from "./SurveysController";

export class LessonController {
  async createLesson(file: any, body: any) {
    try {
      await new LessonValidator().Lesson(body);

      const isChapterExist = await prisma.chapters.findUnique({
        where: {
          uuid: body.chapter_uuid,
        },
      });
      if (!isChapterExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.ChapterNotFound,
          data: null,
        };
      }

      const maxOrder = await prisma.lessons
        .findMany({
          where: { chapter_id: isChapterExist.id },
          orderBy: { order: "desc" },
          take: 1,
        })
        .then((lesson) => (lesson.length > 0 ? lesson[0].order : 0));

      let asset: any;
      let lesson;
      if (body.asset_type === "pdf") {
        if (file) {
          asset = await new PdfsController().createPdfs(file, body);
        } else {
          asset = await new PdfsController().getPdfsById(body.asset_uuid);
        }

        lesson = await this.createLessonForPdf(
          body,
          asset,
          isChapterExist,
          maxOrder!
        );
      } else if (body.asset_type === "video") {
        if (file) {
          asset = await new VideosController().createVideos(file, body);
        } else {
          asset = await new VideosController().getVideosById(body.asset_uuid);
        }

        lesson = await this.createLessonForVideo(
          body,
          asset,
          isChapterExist,
          maxOrder!
        );
      } else if (body.asset_type === "audio") {
        if (file) {
          asset = await new AudiosController().createAudios(file, body);
        } else {
          asset = await new AudiosController().getAudiosById(body.asset_uuid);
        }

        lesson = await this.createLessonForAudio(
          body,
          asset,
          isChapterExist,
          maxOrder!
        );
      } else if (body.asset_type === "image") {
        if (file) {
          asset = await new ImagesController().createImages(file, body);
        } else {
          asset = await new ImagesController().getImageById(body.asset_uuid);
        }

        lesson = await this.createLessonForImage(
          body,
          asset,
          isChapterExist,
          maxOrder!
        );
      } else if (body.asset_type === "forum_prep") {
        asset = await new ForumPrepController().createForumPrep(file, body);

        lesson = await this.createLessonForForumPreps(
          body,
          asset,
          isChapterExist,
          maxOrder!
        );
      } else if (body.asset_type === "survey") {
        asset = await new SurveysController().createSurvey(file, body);

        lesson = await this.createLessonForsurveys(
          body,
          asset,
          isChapterExist,
          maxOrder!
        );
      } else {
        throw Error("Invalid asset type");
      }

      return {
        message: StaticMessage.LessonCreatedSuccessfully,
        data: {
          lesson_info: {
            uuid: lesson.uuid,
            name: lesson.name,
            asset_type: lesson.asset_type,
            is_preview: lesson.is_preview,
            is_prerequisite: lesson.is_prerequisite,
            is_discussion_enabled: lesson.is_discussion_enabled,
            is_downloadable: lesson.is_downloadable,
            asset_info: {
              uuid: asset.uuid,
              name: asset.name ?? null,
              url: asset.url ?? null,
              asset_content_size: asset.asset_content_size,
            },
          },
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllLessons(request: any) {
    try {
      const searchQuery = request.nextUrl.searchParams.get("search");
      const page = Number(request.nextUrl.searchParams.get("page")) || 1;
      const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
      const offset = (page - 1) * limit;

      const lessons = await prisma.lessons.findMany({
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
        include: {
          pdfs: true,
          videos: true,
          audios: true,
          images: true,
          forum_preps: true,
          surveys: true,
        },
        orderBy: { order: "asc" },
      });

      const count = await prisma.lessons.count({
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

      if (!lessons) {
        throw {
          statusCode: 404,
          message: StaticMessage.LessonNotFound,
          data: null,
        };
      }

      const lessonsMap = lessons.map((lessonItem) => ({
        lesson_info: {
          uuid: lessonItem.uuid,
          name: lessonItem.name,
          asset_type: lessonItem.asset_type,
          is_preview: lessonItem.is_preview,
          is_prerequisite: lessonItem.is_prerequisite,
          is_discussion_enabled: lessonItem.is_discussion_enabled,
          is_downloadable: lessonItem.is_downloadable,
          is_active: lessonItem.is_active,
          order: lessonItem.order,
          asset_info: this.checkAssetTypeAndReturnValue(
            lessonItem.asset_type,
            lessonItem
          ),
        },
      }));

      return {
        message: StaticMessage.LessonsFetchedSuccessfully,
        data: lessonsMap,
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

  async getLessonDetailByUuid(lessonUuid: string) {
    try {
      const lesson = await prisma.lessons.findUnique({
        where: {
          uuid: lessonUuid,
        },
        include: {
          pdfs: true,
          videos: true,
          audios: true,
          images: true,
          forum_preps: true,
          surveys: true,
        },
      });

      if (!lesson) {
        throw {
          statusCode: 404,
          message: StaticMessage.LessonNotFound,
          data: null,
        };
      }

      return {
        message: StaticMessage.LessonFetchedSuccessfully,
        data: {
          lesson_info: {
            uuid: lesson.uuid,
            name: lesson.name,
            asset_type: lesson.asset_type,
            is_preview: lesson.is_preview,
            is_prerequisite: lesson.is_prerequisite,
            is_discussion_enabled: lesson.is_discussion_enabled,
            is_downloadable: lesson.is_downloadable,
            is_active: lesson.is_active,
            order: lesson.order,
            asset_info: this.checkAssetTypeAndReturnValue(
              lesson.asset_type,
              lesson
            ),
          },
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async createLessonForPdf(
    body: any,
    asset: any,
    chapter: any,
    maxOrder: number
  ) {
    try {
      return await prisma.lessons.create({
        data: {
          name: body.name,
          chapter_id: chapter.id,
          pdf_id: asset.id,
          asset_type: body.asset_type,
          is_preview: body.is_preview,
          is_prerequisite: body.is_prerequisite,
          is_discussion_enabled: body.is_discussion_enabled,
          is_downloadable: body.is_downloadable,
          order: maxOrder + 1,
          is_active: false,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async createLessonForImage(
    body: any,
    asset: any,
    chapter: any,
    maxOrder: number
  ) {
    try {
      return await prisma.lessons.create({
        data: {
          name: body.name,
          chapter_id: chapter.id,
          image_id: asset.id,
          asset_type: body.asset_type,
          is_preview: body.is_preview,
          is_prerequisite: body.is_prerequisite,
          is_discussion_enabled: body.is_discussion_enabled,
          is_downloadable: body.is_downloadable,
          order: maxOrder + 1,
          is_active: false,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async createLessonForVideo(
    body: any,
    asset: any,
    chapter: any,
    maxOrder: number
  ) {
    try {
      return await prisma.lessons.create({
        data: {
          name: body.name,
          chapter_id: chapter.id,
          video_id: asset.id,
          asset_type: body.asset_type,
          is_preview: body.is_preview,
          is_prerequisite: body.is_prerequisite,
          is_discussion_enabled: body.is_discussion_enabled,
          is_downloadable: body.is_downloadable,
          order: maxOrder + 1,
          is_active: false,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async createLessonForAudio(
    body: any,
    asset: any,
    chapter: any,
    maxOrder: number
  ) {
    try {
      return await prisma.lessons.create({
        data: {
          name: body.name,
          chapter_id: chapter.id,
          audio_id: asset.id,
          asset_type: body.asset_type,
          is_preview: body.is_preview,
          is_prerequisite: body.is_prerequisite,
          is_discussion_enabled: body.is_discussion_enabled,
          is_downloadable: body.is_downloadable,
          order: maxOrder + 1,
          is_active: false,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async createLessonForForumPreps(
    body: any,
    asset: any,
    chapter: any,
    maxOrder: number
  ) {
    try {
      return await prisma.lessons.create({
        data: {
          name: body.name,
          chapter_id: chapter.id,
          forum_prep_id: asset.id,
          asset_type: body.asset_type,
          order: maxOrder + 1,
          is_active: false,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async createLessonForsurveys(
    body: any,
    asset: any,
    chapter: any,
    maxOrder: number
  ) {
    try {
      return await prisma.lessons.create({
        data: {
          name: body.name,
          chapter_id: chapter.id,
          survey_id: asset.id,
          asset_type: body.asset_type,
          order: maxOrder + 1,
          is_active: false,
        },
      });
    } catch (error: any) {
      throw error;
    }
  }

  async updateLesson(body: any, lessonUuid: string, file: any) {
    try {
      await new LessonValidator().UpdateLesson(body);

      const isLessonExist = await prisma.lessons.findUnique({
        where: {
          uuid: lessonUuid,
        },
      });

      if (!isLessonExist) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.LessonNotFound,
        };
      }

      let updatedBody;
      if (body.asset_type) {
        if (body.asset_type === "pdf") {
          let asset;
          if (file) {
            asset = await new PdfsController().createPdfs(file, body);
          } else {
            asset = await new PdfsController().getPdfsById(body.asset_uuid);
          }
          updatedBody = {
            ...body,
            pdf_id: asset.id,
            video_id: null,
            audio_id: null,
            image_id: null,
            forum_prep_id: null,
            survey_id: null,
          };
        } else if (body.asset_type === "video") {
          let asset;
          if (file) {
            asset = await new VideosController().createVideos(file, body);
          } else {
            asset = await new VideosController().getVideosById(body.asset_uuid);
          }
          updatedBody = {
            ...body,
            video_id: asset.id,
            pdf_id: null,
            audio_id: null,
            image_id: null,
            forum_prep_id: null,
            survey_id: null,
          };
        } else if (body.asset_type === "audio") {
          let asset;
          if (file) {
            asset = await new AudiosController().createAudios(file, body);
          } else {
            asset = await new AudiosController().getAudiosById(body.asset_uuid);
          }
          updatedBody = {
            ...body,
            audio_id: asset.id,
            video_id: null,
            pdf_id: null,
            image_id: null,
            forum_prep_id: null,
            survey_id: null,
          };
        } else if (body.asset_type === "image") {
          let asset;
          if (file) {
            asset = await new ImagesController().createImages(file, body);
          } else {
            asset = await new ImagesController().getImageById(body.asset_uuid);
          }
          updatedBody = {
            ...body,
            image_id: asset.id,
            pdf_id: null,
            video_id: null,
            audio_id: null,
            forum_prep_id: null,
            survey_id: null,
          };
        } else if (body.asset_type === "forum_prep") {
          let asset;
          if (file) {
            asset = await new ForumPrepController().createForumPrep(file, body);
          } else {
            asset = await new ForumPrepController().getForumPrepById(
              body.asset_uuid
            );
          }
          updatedBody = {
            ...body,
            forum_prep_id: asset.id,
            image_id: null,
            pdf_id: null,
            video_id: null,
            audio_id: null,
            survey_id: null,
          };
        } else if (body.asset_type === "survey") {
          let asset;
          if (file) {
            asset = await new SurveysController().updateSurvey(file, body);
          } else {
            asset = await new SurveysController().getSurveyById(
              body.asset_uuid
            );
          }
          updatedBody = {
            ...body,
            survey_id: asset.id,
            forum_prep_id: null,
            image_id: null,
            pdf_id: null,
            video_id: null,
            audio_id: null,
          };
        } else {
          throw Error("Invalid asset type");
        }
        delete updatedBody.asset_uuid;
      } else if (!body.asset_type && !file) {
        updatedBody = { ...body };
      }

      const { asset_content_size, ...restUpdatedBody } = updatedBody;

      await prisma.lessons.update({
        data: {
          ...restUpdatedBody,
          updatedAt: new Date(),
        },
        where: {
          uuid: lessonUuid,
        },
      });

      return {
        message: StaticMessage.LessonUpdatedSuccessfully,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateLessonOrder(
    chapterUuid: string,
    lessonUuid: string,
    newOrder: number
  ) {
    try {
      const isChapterExist = await prisma.chapters.findUnique({
        where: {
          uuid: chapterUuid,
        },
      });

      if (!isChapterExist) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const isLessonExist = await prisma.lessons.findUnique({
        where: {
          uuid: lessonUuid,
          chapter_id: isChapterExist.id,
        },
      });

      if (!isLessonExist) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const lessons = await prisma.lessons.findMany({
        where: { chapter_id: isChapterExist.id },
        orderBy: { order: "asc" },
      });

      const updatedLessons = lessons.map((lesson) => {
        if (lesson.uuid === lessonUuid) {
          return { ...lesson, order: newOrder };
        } else if (lesson.order! >= newOrder) {
          return { ...lesson, order: lesson.order! + 1 };
        }
        return lesson;
      });

      const sortedLessons = updatedLessons.sort(
        (a: any, b: any) => a.order - b.order
      );

      for (let index = 1; index <= sortedLessons.length; index++) {
        sortedLessons[index - 1].order = index;
      }

      const updatePromises = sortedLessons.map((lesson) =>
        prisma.lessons.update({
          where: { id: lesson.id },
          data: { order: lesson.order },
          select: {
            uuid: true,
            name: true,
            is_active: true,
            order: true,
          },
        })
      );

      await Promise.all(updatePromises);

      const finalLessons = await prisma.lessons.findMany({
        where: { chapter_id: isChapterExist.id },
        orderBy: { order: "asc" },
        select: {
          uuid: true,
          name: true,
          is_active: true,
          order: true,
        },
      });

      return {
        message: StaticMessage.LessonOrderUpdatedSuccessfully,
        data: finalLessons,
      };
    } catch (err) {
      throw err;
    }
  }

  async deleteLessonByUuid(lessonUuid: string) {
    try {
      const lesson: any = await prisma.lessons.findUnique({
        where: {
          uuid: lessonUuid,
        },
      });

      if (!lesson) {
        throw {
          statusCode: 404,
          message: StaticMessage.LessonNotFound,
          data: null,
        };
      }

      await prisma.lessons.delete({
        where: {
          uuid: lessonUuid,
        },
      });

      return {
        message: StaticMessage.LessonDeletedSuccessfully,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  checkAssetTypeAndReturnValue(assetType: any, lessonResponse: any) {
    try {
      switch (assetType) {
        case "pdf":
          return {
            uuid: lessonResponse.pdfs.uuid,
            name: lessonResponse.pdfs.name,
            url: lessonResponse.pdfs.url,
            asset_content_size: lessonResponse.pdfs.asset_content_size,
          };
        case "video":
          return {
            uuid: lessonResponse.videos.uuid,
            name: lessonResponse.videos.name,
            url: lessonResponse.videos.url,
            asset_content_size: lessonResponse.videos.asset_content_size,
          };
        case "audio":
          return {
            uuid: lessonResponse.audios.uuid,
            name: lessonResponse.audios.name,
            url: lessonResponse.audios.url,
            asset_content_size: lessonResponse.audios.asset_content_size,
          };
        case "image":
          return {
            uuid: lessonResponse.images.uuid,
            name: lessonResponse.images.name,
            url: lessonResponse.images.url,
            asset_content_size: lessonResponse.images.asset_content_size,
          };
        case "forum_prep":
          return {
            uuid: lessonResponse.forum_preps.uuid,
            name: lessonResponse.forum_preps.name ?? null,
            url: lessonResponse.forum_preps.url ?? null,
            forum_prep_info: JSON.parse(
              lessonResponse.forum_preps.forum_prep_data
            ),
            asset_content_size: lessonResponse.forum_preps.asset_content_size,
          };
        case "survey":
          return {
            uuid: lessonResponse.surveys.uuid,
            name: lessonResponse.surveys.name ?? null,
            url: lessonResponse.surveys.url ?? null,
            survey_data: lessonResponse.surveys.survey_data,
            asset_content_size: lessonResponse.surveys.asset_content_size,
          };
        default:
          return null;
      }
    } catch (err) {
      throw err;
    }
  }

  async updateLessonStatus(body: any, lessonUuid: string) {
    try {
      await new CourseValidator().UpdateCourseStatus(body);

      const lesson = await prisma.lessons.findUnique({
        where: { uuid: lessonUuid },
      });

      if (!lesson) {
        throw {
          message: StaticMessage.LessonNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const { is_active } = body;

      await prisma.lessons.update({
        where: { id: lesson.id },
        data: { is_active, updatedAt: new Date() },
      });

      const message = is_active ? "enabled" : "disabled";

      return {
        message: `Lesson ${message} successfully`,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
