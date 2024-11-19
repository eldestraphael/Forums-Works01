import fs from "fs";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
let uuidv4 = require("uuid");
const prisma = new PrismaClient();
let userMcqOptionCnt = 1;
let totalUserMcqOptionCnt = 1;

export async function seedCompanyUserForumData() {
  const companySize = 3;
  const userSize = 10;
  const forumSize = 2;
  const courseSize = 6;
  const chapterPerCourse = 3;
  const defaultCount = 100000;

  let password = await bcrypt.hash("Password@123", 10);
  let userDetails = [];
  let forumDetails = [];
  let courseDetails = [];
  let chapterDetails = [];

  const jobTitles = [
    "CEO",
    "CFO",
    "COO",
    "Manager",
    "Manager",
    "Executive",
    "Executive",
    "Executive",
    "Senior Executive",
    "Senior Executive",
  ];

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

  await prisma.company.deleteMany({});
  await prisma.courses.deleteMany({});

  for (let size = 1; size <= companySize; size++) {
    let company = await prisma.company.create({
      data: {
        id: size + defaultCount,
        uuid: uuidv4.v4(),
        company_name: `Company ${size}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    let jobCount = 0;

    const userStartIndex = (size - 1) * userSize + 1;
    for (
      let uSize = userStartIndex;
      uSize <= userStartIndex - 1 + userSize;
      uSize++
    ) {
      let roleName = "";
      if (jobCount === 0) {
        roleName = "Super Admin";
      } else if (jobCount === 1) {
        roleName = "Client Admin";
      } else if (jobCount < 4) {
        roleName = "Client Forum Leader";
      } else {
        roleName = "Client Forum Member";
      }

      const role = await prisma.roles.findFirst({
        where: {
          name: roleName,
        },
      });

      let user = await prisma.user.create({
        data: {
          id: uSize + defaultCount,
          uuid: uuidv4.v4(),
          first_name: `Cpy${size}fn${uSize}`,
          last_name: `Com${size}ln${uSize}`,
          email: `f${uSize}.l${uSize}_cp${size}@company${size}.com`,
          password: password,
          company_id: size + defaultCount,
          phone: "2348001111111",
          job_title: jobTitles[jobCount],
          role_uuid: role?.uuid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      userDetails.push(user);
      jobCount += 1;
    }

    const forumStartIndex = (size - 1) * forumSize + 1;
    for (
      let fSize = forumStartIndex;
      fSize <= forumStartIndex - 1 + forumSize;
      fSize++
    ) {
      let forum = await prisma.forum.create({
        data: {
          id: fSize + defaultCount,
          uuid: uuidv4.v4(),
          company_id: size + defaultCount,
          forum_name: `Company ${size} Forum ${fSize}`,
          meeting_day: daysOfWeek[daysCount],
          meeting_time: `1${daysCount}:00:00`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      daysCount += 1;
      forumDetails.push(forum);
    }
  }

  for (let cSize = 1; cSize <= courseSize; cSize++) {
    let course = await prisma.courses.create({
      data: {
        id: cSize + defaultCount,
        uuid: uuidv4.v4(),
        name: `Course ${cSize}`,
        description: `Course ${cSize} description`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    courseDetails.push(course);

    for (let chSize = 1; chSize <= chapterPerCourse; chSize++) {
      let chapter = await prisma.chapters.create({
        data: {
          id: (cSize - 1) * chapterPerCourse + chSize + defaultCount,
          course_id: course.id,
          uuid: uuidv4.v4(),
          name: `Course ${cSize} Chapter ${chSize}`,
          description: `Course${cSize} Chapter${chSize} description`,
          order: chSize,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      chapterDetails.push(chapter);
    }
  }

  for (let i = 0; i < forumDetails.length; i++) {
    let forum = forumDetails[i];
    let course = courseDetails[i];
    let j = 0;

    let chapter = chapterDetails[i * chapterPerCourse + j];
    let forumCourseId = defaultCount + i + 1;

    const currentDate = new Date();

    const dateToFormat = new Date(
      currentDate.getTime() - 8 * 7 * 24 * 60 * 60 * 1000
    );

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
        starting_date: new Date(formatDate(dateToFormat)),
      },
    });
  }

  let userPerForum = 1;
  for (let forumIndex = 0; forumIndex < forumDetails.length; forumIndex++) {
    const linkedUserPerForum = userDetails.slice(
      forumIndex * 5,
      (forumIndex + 1) * 5
    );
    for (let item of linkedUserPerForum) {
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
      const dates = getDate(new Date());
      for (let date of dates) {
        await createUserForumHealth(
          item,
          forumDetails[forumIndex],
          date as any
        );
      }
      userPerForum += 1;
    }
  }
}

function pickRandomOption(options: any) {
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

async function getRandonOptionsBasedOnMcq() {
  const data: any = JSON.parse(
    fs.readFileSync("./prisma/seedData/mcqPerOption.json", "utf-8")
  );

  let result: any = [];

  await data.forEach((item: any) => {
    const randomOption = pickRandomOption(item.mcq_option_list);
    result.push(randomOption);
  });
  return result;
}

async function createUserForumHealth(item: any, forumDetails: any, date: Date) {
  const defaultCount = 100000;
  let mcqWithOptions = await getRandonOptionsBasedOnMcq();
  let totalScore = 0;
  for (let option of mcqWithOptions) {
    await prisma.user_forum_healths.create({
      data: {
        id: userMcqOptionCnt + defaultCount,
        user_id: item.id,
        forum_id: forumDetails.id,
        date: new Date(date),
        health_mcq_option_id: option.mcq_option_id,
        score: option.mcq_option_value,
      },
    });
    totalScore += Number(option.mcq_option_value);
    userMcqOptionCnt += 1;
  }
  let onetimeHealthScore = (totalScore / 5) * 10;
  await prisma.user_per_forum_health_score.create({
    data: {
      id: totalUserMcqOptionCnt + defaultCount,
      user_id: item.id,
      forum_id: forumDetails.id,
      date: new Date(date),
      score: onetimeHealthScore,
    },
  });
  totalUserMcqOptionCnt += 1;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDate(currentDate: Date) {
  const datesArray = [];
  for (let i = 0; i < 8; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i * 7);
    datesArray.push(formatDate(date));
  }
  return datesArray.sort();
}
