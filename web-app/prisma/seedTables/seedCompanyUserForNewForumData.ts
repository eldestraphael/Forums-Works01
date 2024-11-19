import { AssetType, PrismaClient } from "@prisma/client";
import fs from "fs";
let uuidv4 = require("uuid");

const prisma = new PrismaClient();

export async function seedCompanyUserForNewForumData() {
  const forumSize = 2;
  const courseSize = 6;
  const chapterPerCourse = 3;
  const lessonPerChapter = 3;
  const defaultCount = 110000;

  const userDetails: Array<{ id: number }> = [];
  const forumDetails = [];
  const courseDetails = [];
  const chapterDetails = [];
  const lessonDetails = [];

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let daysCount = 0;

  const companies = await prisma.company.findMany();
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });

  users.forEach((user) => userDetails.push({ id: user.id }));

  let forumNumber = 1;
  for (let size = 0; size < companies.length; size++) {
    for (let fSize = 0; fSize < forumSize; fSize++) {
      const forum = await prisma.forum.create({
        data: {
          id: defaultCount + size * forumSize + fSize + 1,
          uuid: uuidv4.v4(),
          company_id: companies[size].id,
          forum_name: `Company ${size + 1} Forum ${forumNumber} New`,
          meeting_day: daysOfWeek[daysCount % daysOfWeek.length],
          meeting_time: `1${daysCount % daysOfWeek.length}:00:00`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      daysCount += 1;
      forumDetails.push(forum);
      forumNumber++;
    }
  }

  for (let cSize = 1; cSize <= courseSize; cSize++) {
    const course = await prisma.courses.create({
      data: {
        id: cSize + defaultCount,
        uuid: uuidv4.v4(),
        name: `Course ${cSize} New`,
        description: `Course ${cSize} description New`,
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
          uuid: uuidv4.v4(),
          name: `Course ${cSize} Chapter ${chSize} New`,
          description: `Course ${cSize} Chapter ${chSize} description New`,
          order: chSize,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      chapterDetails.push(chapter);
    }
  }

  const lessonAssetMapping = [
    { chapter: 1, lesson: 1, type: "video", order: 1 },
    { chapter: 1, lesson: 2, type: "audio", order: 2 },
    { chapter: 1, lesson: 3, type: "pdf", order: 3 },
    { chapter: 2, lesson: 4, type: "image", order: 1 },
    { chapter: 2, lesson: 5, type: "audio", order: 2 },
    { chapter: 2, lesson: 6, type: "pdf", order: 3 },
    { chapter: 3, lesson: 7, type: "video", order: 1 },
    { chapter: 3, lesson: 8, type: "pdf", order: 2 },
    { chapter: 3, lesson: 9, type: "pdf", order: 3 },
    { chapter: 3, lesson: 10, type: "audio", order: 4 },
    { chapter: 3, lesson: 11, type: "video", order: 5 },
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
              uuid: uuidv4.v4(),
              name: `Lesson ${lSize + 1} PDF`,
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
              uuid: uuidv4.v4(),
              name: `Lesson ${lSize + 1} Video`,
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
              uuid: uuidv4.v4(),
              name: `Lesson ${lSize + 1} Audio`,
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
              uuid: uuidv4.v4(),
              name: `Lesson ${lSize + 1} Image`,
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
          uuid: uuidv4.v4(),
          name: `Lesson ${lSize + 1}`,
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
          order: lessonAssetMapping[lSize].order,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      lessonDetails.push(lesson);
    }
  }

  for (let i = 0; i < forumDetails.length; i++) {
    const forum = forumDetails[i];
    const course = courseDetails[i % courseDetails.length];
    const chapter =
      chapterDetails[(i * chapterPerCourse) % chapterDetails.length];
    const forumCourseId = defaultCount + i + 1;

    await prisma.forum_course.create({
      data: {
        id: forumCourseId,
        uuid: uuidv4.v4(),
        forum_id: forum.id,
        course_id: course.id,
        chapter_id: chapter.id,
        is_current_course: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        starting_date: new Date(formatDate(new Date())),
      },
    });
  }

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
          uuid: uuidv4.v4(),
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
