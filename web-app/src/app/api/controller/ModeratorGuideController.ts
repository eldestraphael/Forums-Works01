import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { ModeratorGuideValidator } from "../validators/ModeratorGuideValidator";
import { ModeratorGuide } from "../infrastructure/dtos/ModeratorGuide";

export class ModeratorGuideController {
  async createModeratorGuide(chapterUuid: string, body: ModeratorGuide[]) {
    try {
      await new ModeratorGuideValidator().createModeratorGuide(body);

      const isChaptersExist = await prisma.chapters.findFirst({
        where: {
          uuid: chapterUuid,
        },
      });

      if (!isChaptersExist) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }
      let moderatorGuideResponse = [];
      for (let item of body) {
        if (item.section_uuid) {
          if (item.is_deleted) {
            await prisma.chapter_moderator_guide.delete({
              where: {
                uuid: item.section_uuid,
              },
            });
          } else {
            const moderatorGuideUpdated =
              await prisma.chapter_moderator_guide.update({
                data: {
                  chapter_id: isChaptersExist.id,
                  section_type: item.section_type,
                  type: item.type,
                  title: item.title,
                  description: item.description,
                  order: item.order,
                  duration: item.duration,
                  duration_per_person: item.duration_per_person,
                  link: item.link,
                },
                where: {
                  uuid: item.section_uuid,
                },
              });
            moderatorGuideResponse.push(moderatorGuideUpdated);
          }
        } else {
          const moderatorGuide = await prisma.chapter_moderator_guide.create({
            data: {
              chapter_id: isChaptersExist.id,
              section_type: item.section_type,
              type: item.type,
              title: item.title,
              description: item.description,
              order: item.order,
              duration: item.duration,
              duration_per_person: item.duration_per_person,
              link: item.link,
            },
          });
          moderatorGuideResponse.push(moderatorGuide);
        }
      }

      return {
        message: StaticMessage.ModeratorGuideCreatedSuccessfully,
        data: {
          moderator_guide_info: moderatorGuideResponse.map((item) => {
            return {
              uuid: item.uuid,
              chapter_info: {
                uuid: isChaptersExist.uuid,
                name: isChaptersExist.name,
                description: isChaptersExist.description,
              },
              section_type: item.section_type,
              type: item.type,
              title: item.title,
              description: item.description,
              order: item.order,
              duration: item.duration,
              duration_per_person: item.duration_per_person,
              link: item.link,
            };
          }),
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getModeratorGuide(chapterUuid: string) {
    try {
      const isChapterExist = await prisma.chapters.findFirst({
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

      const isActionStepsExist = await prisma.action_steps.findFirst({
        where: { chapter_id: isChapterExist.id, is_active: true },
      });

      let finalheader = [
        {
          section_uuid: isChapterExist.uuid,
          type: "logical",
          title: isChapterExist.name,
          description: isChapterExist.description,
          order: 1,
          duration: null,
          duration_per_person: null,
          link: null,
        },
      ];

      const getSectionData = async (sectionType: string) => {
        return [
          ...(await this.returnModeratorGuide(sectionType, "repeatable")),
          ...(await this.returnModeratorGuide(
            sectionType,
            "once",
            isChapterExist.id
          )),
        ]
          .sort((a: any, b: any) => a.order - b.order)
          .map((item: any) => ({
            section_uuid: item.uuid,
            type: item.type,
            title: item.title,
            description: item.description,
            order: item.order,
            duration: item.duration,
            duration_per_person: item.duration_per_person,
            link: item.link || null,
          }));
      };

      const header = await getSectionData("header");
      const body = await getSectionData("body");
      const footer = await getSectionData("footer");

      return {
        message: StaticMessage.ModeratorGuideFetchedSuccessfully,
        data: {
          header: [...finalheader, ...header],
          body: body,
          action_step:
            isActionStepsExist !== null
              ? {
                  uuid: isActionStepsExist.uuid,
                  name: isActionStepsExist.name,
                  description: isActionStepsExist.description || null,
                }
              : {},
          footer: footer,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getModeratorGuideByUuid(
    chapterUuid: string,
    moderatorGuideUuid: string
  ) {
    try {
      const isChaptersExist = await prisma.chapters.findFirst({
        where: {
          uuid: chapterUuid,
        },
      });

      if (!isChaptersExist) {
        throw {
          message: StaticMessage.ChapterNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const isModeratorGuideExist =
        await prisma.chapter_moderator_guide.findUnique({
          where: {
            uuid: moderatorGuideUuid,
          },
        });

      if (!isModeratorGuideExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.ModeratorGuideNotFound,
          data: null,
        };
      }

      return isModeratorGuideExist;
    } catch (err: any) {
      throw err;
    }
  }

  async returnModeratorGuide(sectionType: any, type: any, chapterId?: number) {
    try {
      const header = await prisma.chapter_moderator_guide.findMany({
        where: {
          ...(chapterId && { chapter_id: chapterId }),
          section_type: sectionType,
          type: type,
        },
        orderBy: { order: "asc" },
        select: {
          uuid: true,
          title: true,
          type: true,
          description: true,
          order: true,
          duration: true,
          duration_per_person: true,
          link: true,
        },
      });
      return header;
    } catch (err: any) {
      throw err;
    }
  }
}
