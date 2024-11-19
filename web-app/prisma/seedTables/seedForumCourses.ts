import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function seedForumCourses() {
  const courseSize = 6;
  const chapterPerCourse = 7;
  const defaultCount = 110000;

  const userDetails: Array<{ id: number }> = [];
  const forumDetails: any = [];
  const courseDetails = [];
  const chapterDetails = [];
  const lessonDetails = [];

  let daysCount = 0;

  const companies = await prisma.company.findMany();
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });

  users.forEach((user) => userDetails.push({ id: user.id }));

  for (let cSize = 1; cSize <= courseSize; cSize++) {
    const course = await prisma.courses.create({
      data: {
        id: cSize + defaultCount,
        uuid: uuidv4(),
        name: `Customized Course ${cSize}`,
        description: `Customized Course ${cSize} description`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    courseDetails.push(course);

    for (let chSize = 1; chSize <= chapterPerCourse; chSize++) {
      const chapter = await prisma.chapters.create({
        data: {
          id: (cSize - 1) * chapterPerCourse + chSize + defaultCount,
          course_id: course.id,
          uuid: uuidv4(),
          name: `Customized Course ${cSize} Chapter ${chSize}`,
          description: `Customized Course ${cSize} Chapter ${chSize} description`,
          order: chSize,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      chapterDetails.push(chapter);
    }
  }

  const lessonAssetMapping = [
    { chapter: 1, lesson: 1, type: "video" },
    { chapter: 2, lesson: 1, type: "pdf" },
    { chapter: 3, lesson: 1, type: "video" },
    { chapter: 4, lesson: 1, type: "video" },
    { chapter: 5, lesson: 1, type: "audio" },
    { chapter: 6, lesson: 1, type: "pdf" },
    { chapter: 7, lesson: 1, type: "image" },
    { chapter: 8, lesson: 1, type: "audio" },
    { chapter: 9, lesson: 1, type: "pdf" },
    { chapter: 10, lesson: 1, type: "video" },
    { chapter: 11, lesson: 1, type: "pdf" },
    { chapter: 12, lesson: 1, type: "pdf" },
    { chapter: 13, lesson: 1, type: "audio" },
    { chapter: 14, lesson: 1, type: "video" },
    { chapter: 15, lesson: 1, type: "video" },
    { chapter: 16, lesson: 1, type: "audio" },
    { chapter: 17, lesson: 1, type: "pdf" },
    { chapter: 18, lesson: 1, type: "image" },
    { chapter: 19, lesson: 1, type: "audio" },
    { chapter: 20, lesson: 1, type: "pdf" },
    { chapter: 21, lesson: 1, type: "video" },
    { chapter: 22, lesson: 1, type: "pdf" },
    { chapter: 23, lesson: 1, type: "pdf" },
    { chapter: 24, lesson: 1, type: "audio" },
    { chapter: 25, lesson: 1, type: "video" },
    { chapter: 26, lesson: 1, type: "video" },
    { chapter: 27, lesson: 1, type: "audio" },
    { chapter: 28, lesson: 1, type: "pdf" },
    { chapter: 29, lesson: 1, type: "image" },
    { chapter: 30, lesson: 1, type: "audio" },
    { chapter: 31, lesson: 1, type: "pdf" },
    { chapter: 32, lesson: 1, type: "video" },
    { chapter: 33, lesson: 1, type: "pdf" },
    { chapter: 34, lesson: 1, type: "pdf" },
    { chapter: 35, lesson: 1, type: "audio" },
    { chapter: 36, lesson: 1, type: "video" },
    { chapter: 37, lesson: 1, type: "audio" },
    { chapter: 38, lesson: 1, type: "pdf" },
    { chapter: 39, lesson: 1, type: "video" },
    { chapter: 40, lesson: 1, type: "pdf" },
    { chapter: 41, lesson: 1, type: "pdf" },
    { chapter: 42, lesson: 1, type: "audio" },
  ];

  const data = JSON.parse(
    fs.readFileSync("./prisma/seedData/asset_urls.json", "utf-8")
  );

  for (let lSize = 0; lSize < lessonAssetMapping.length; lSize++) {
    const assetType = lessonAssetMapping[lSize].type;
    const chapterIndex = lessonAssetMapping[lSize].chapter - 1;
    const chapterId = chapterDetails[chapterIndex].id;

    const assetTypes = assetType;
    let assetData = null;
    let assetId = null;
    let assetName = "";

    switch (assetType) {
      case "pdf":
        if (data.PDFs) {
          assetData = data.PDFs[lSize % data.PDFs.length];

          const pdf = await prisma.pdfs.create({
            data: {
              uuid: uuidv4(),
              name: `Customized Lesson ${lSize + 1} PDF`,
              url: assetData.url,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
          assetId = pdf.id;
          assetName = pdf.name;
        }
        break;
      case "video":
        if (data.Videos) {
          assetData = data.Videos[lSize % data.Videos.length];
          const video = await prisma.videos.create({
            data: {
              uuid: uuidv4(),
              name: `Customized Lesson ${lSize + 1} Video`,
              url: assetData.url,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
          assetId = video.id;
          assetName = video.name;
        }
        break;
      case "audio":
        if (data.Audios) {
          assetData = data.Audios[0];

          const audio = await prisma.audios.create({
            data: {
              uuid: uuidv4(),
              name: `Customized Lesson ${lSize + 1} Audio`,
              url: assetData.url,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
          assetId = audio.id;
          assetName = audio.name;
        }
        break;
      case "image":
        if (data.Images) {
          assetData = data.Images[lSize % data.Images.length];
          const image = await prisma.images.create({
            data: {
              uuid: uuidv4(),
              name: `Customized Lesson ${lSize + 1} Image`,
              url: assetData.url,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
          assetId = image.id;
          assetName = image.name;
        }
        break;
      default:
        break;
    }

    if (assetId) {
      const lesson = await prisma.lessons.create({
        data: {
          uuid: uuidv4(),
          name: `Customized Lesson ${lSize + 1}`,
          chapter_id: chapterId,
          pdf_id: assetType === "pdf" ? assetId : null,
          video_id: assetType === "video" ? assetId : null,
          audio_id: assetType === "audio" ? assetId : null,
          image_id: assetType === "image" ? assetId : null,
          asset_type: assetTypes as any,
          is_preview: true,
          is_prerequisite: false,
          is_discussion_enabled: false,
          is_downloadable: true,
          is_active: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      lessonDetails.push(lesson);
    }
  }

  let forumCourseId = 1;

  const createForumAndCourses = async (
    forumData: string | any[],
    courseData: any[],
    chapterData: any[]
  ) => {
    for (let i = 0; i < forumData.length; i++) {
      const forum = await prisma.forum.create({
        data: {
          id: defaultCount + i + 1,
          uuid: uuidv4(),
          company_id: companies[0].id,
          forum_name: `Customized Forum ${i + 1}`,
          meeting_day: forumData[i].meeting_day,
          meeting_time: forumData[i].meeting_time,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      forumDetails.push(forum);

      const courses = courseData[i];

      for (const course of courses) {
        const startingChapter = chapterData.find(
          (chapter: { course_id: any }) => chapter.course_id === course.id
        );

        if (startingChapter) {
          await prisma.forum_course.create({
            data: {
              id: defaultCount + forumCourseId,
              uuid: uuidv4(),
              forum_id: forum.id,
              course_id: course.id,
              chapter_id: startingChapter.id,
              is_current_course: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              starting_date: forumData[i].starting_date,
            },
          });
          forumCourseId += 1;
        }
      }
    }

    return forumDetails;
  };

  const forumData = [
    {
      meeting_day: "Monday",
      meeting_time: "12:00:00",
      starting_date: new Date(
        formatDate(new Date(new Date().setDate(new Date().getDate() - 2)))
      ),
    },
    {
      meeting_day: "Friday",
      meeting_time: "00:00:00",
      starting_date: new Date(
        formatDate(new Date(new Date().setDate(new Date().getDate() - 1)))
      ),
    },
    {
      meeting_day: "Sunday",
      meeting_time: "15:00:00",
      starting_date: new Date(formatDate(new Date())),
    },
    {
      meeting_day: "Thursday",
      meeting_time: "07:30:00",
      starting_date: new Date(
        formatDate(new Date(new Date().setDate(new Date().getDate() + 7)))
      ),
    },
  ];

  const courseData = [
    [courseDetails[0]],
    [courseDetails[3]],
    [courseDetails[1]],
    [courseDetails[5]],
  ];

  const chapters = chapterDetails;

  await createForumAndCourses(forumData, courseData, chapters);

  let userPerForum = 1;
  for (let forumIndex = 0; forumIndex < forumDetails.length; forumIndex++) {
    const linkedUserPerForum = userDetails.slice(
      forumIndex * 5,
      (forumIndex + 1) * 5
    );
    for (const item of linkedUserPerForum) {
      await prisma.user_forum.create({
        data: {
          id: userPerForum + defaultCount,
          uuid: uuidv4(),
          user_id: item.id,
          forum_id: forumDetails[forumIndex].id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      userPerForum += 1;
    }
  }

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
