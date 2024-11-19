import fs from "fs";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
let uuidv4 = require("uuid");
const prisma = new PrismaClient();

export async function updatedseed() {
  await prisma.forum.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.courses.deleteMany({});
  await prisma.chapters.deleteMany({});
  await prisma.action_steps.deleteMany({});
  await prisma.lessons.deleteMany({});
  await prisma.surveys.deleteMany({});
  await prisma.user_forum.deleteMany({});
  await prisma.user_forum_prework_status.deleteMany({});
  await prisma.forum_meetings.deleteMany({});
  await prisma.user_forum_meeting_status.deleteMany({});
  await prisma.user_forum_action_step_status.deleteMany({});
  await prisma.chapter_moderator_guide.deleteMany({});

  const chapterPerCourse = 3;
  const defaultCount = 100000;

  let password = await bcrypt.hash("Password@123", 10);
  let userDetails: any = [];
  let forumDetails: any = [];
  let courseDetails: any = [];
  let chapterDetails: any = [];
  let actionStepDetails: any = [];
  let lessonDetails: any = [];
  let forumCourseDetails: any = [];
  let forumMeetingDetails: any = [];
  let userForumMeetingStatusDetails: any = [];

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

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let daysCount = 0;

  await prisma.$transaction(
    async (prisma) => {
      const companies = [
        { name: "Company 1", forums: 2, courses: 1, usersPerForum: 5 },
        { name: "Company 2", forums: 1, courses: 1, usersPerForum: 5 },
        { name: "Company 3", forums: 0, courses: 0, usersPerForum: 5 },
      ];

      let userId = defaultCount + 1;
      let forumId = defaultCount + 1;
      let courseId = defaultCount + 1;
      let chapterId = defaultCount + 1;

      for (let cIndex = 0; cIndex < companies.length; cIndex++) {
        let company = await prisma.company.create({
          data: {
            id: cIndex + 1 + defaultCount,
            uuid: uuidv4.v4(),
            company_name: companies[cIndex].name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });

        let jobCount = 0;

        for (
          let uIndex = 0;
          uIndex < companies[cIndex].usersPerForum * companies[cIndex].forums;
          uIndex++
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
              id: userId,
              uuid: uuidv4.v4(),
              first_name: `Cpy${cIndex + 1}fn${uIndex + 1}`,
              last_name: `Com${cIndex + 1}ln${uIndex + 1}`,
              email: `f${uIndex + 1}.l${uIndex + 1}_cp${cIndex + 1}@company${
                cIndex + 1
              }.com`,
              password: password,
              company_id: company.id,
              phone: "2348001111111",
              job_title: jobTitles[jobCount % jobTitles.length],
              role_uuid: role?.uuid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

          userDetails.push(user);
          jobCount += 1;
          userId += 1;
        }

        for (let fIndex = 0; fIndex < companies[cIndex].forums; fIndex++) {
          let forum = await prisma.forum.create({
            data: {
              id: forumId,
              uuid: uuidv4.v4(),
              company_id: company.id,
              forum_name: `${companies[cIndex].name} Forum ${fIndex + 1}`,
              meeting_day: daysOfWeek[daysCount % daysOfWeek.length],
              meeting_time: `1${daysCount % 10}:00:00`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

          daysCount += 1;
          forumDetails.push(forum);
          forumId += 1;

          for (
            let coIndex = 0;
            coIndex < companies[cIndex].courses;
            coIndex++
          ) {
            let course = await prisma.courses.create({
              data: {
                id: courseId,
                uuid: uuidv4.v4(),
                name: `Course ${courseId - 100000}`,
                description: `Course ${courseId - 100000} description`,
                is_active: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            });

            courseDetails.push(course);

            for (let chIndex = 1; chIndex <= chapterPerCourse; chIndex++) {
              let chapter = await prisma.chapters.create({
                data: {
                  id: chapterId,
                  course_id: course.id,
                  uuid: uuidv4.v4(),
                  name: `Course ${courseId - 100000} Chapter ${chIndex}`,
                  description: `Course${
                    courseId - 100000
                  } Chapter${chIndex} description`,
                  order: chIndex,
                  is_active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });

              chapterDetails.push(chapter);

              chapterId += 1;
            }

            // Create chapter moderator guide entries

            for (let i = 0; i < 1; i++) {
              const chapter = chapterDetails[i];
              await prisma.chapter_moderator_guide.create({
                data: {
                  uuid: uuidv4.v4(),
                  chapter_id: chapter.id,
                  section_type: SectionType.header,
                  type: Type.once,
                  title: "More possibilities for a modern brand presence.",
                  description:
                    "Introducing BMW’s new brand design for online and offline communication",
                  order: 1,
                  duration: 600,
                  duration_per_person: 120,
                  link: "https://www.bmw.com/en/index.html",
                  is_active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });
              await prisma.chapter_moderator_guide.create({
                data: {
                  uuid: uuidv4.v4(),
                  chapter_id: chapter.id,
                  section_type: SectionType.body,
                  type: Type.once,
                  title:
                    "Thema Introducing BMW’s new brand design for online and offline communication.",
                  description:
                    "The global launch of the new brand design starts on 3 March 2020.",
                  order: 1,
                  duration: 60,
                  duration_per_person: 30,
                  link: "https://www.bmw.com/en/index.html",
                  is_active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });
              await prisma.chapter_moderator_guide.create({
                data: {
                  uuid: uuidv4.v4(),
                  chapter_id: chapter.id,
                  section_type: SectionType.footer,
                  type: Type.once,
                  title: "The BMW Group",
                  description:
                    "The success of the BMW Group has always been based on long-term thinking and responsible action",
                  order: 1,
                  duration: 60,
                  duration_per_person: 15,
                  link: "https://www.bmw.com/en/index.html",
                  is_active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });
            }
            courseId += 1;
          }
        }
      }

      for (let i = 0; i < chapterDetails.length; i++) {
        try {
          let actionStep = await prisma.action_steps.create({
            data: {
              chapter_id: chapterDetails[i].id,
              name: `Action Step for ${chapterDetails[i].name}`,
              description: `Action step description for ${chapterDetails[i].description}`,
              times_per_year: 1,
              is_active: true,
            },
          });

          actionStepDetails.push(actionStep);
        } catch (error) {
          throw error;
        }
      }

      const usersPerForum = 5; // Number of users per forum
      const daysToAddPerActionStep = 7; // Days to add for each subsequent action step

      const userActionSteps: any = {
        "Action Step 1": {
          "100001": [1, 2, 3, 4, 5],
          "100002": [1, 4, 5],
          "100003": [1, 3],
          "100004": [1, 5],
          "100005": [5],
        },
        "Action Step 2": {
          "100001": [1, 2, 3, 4, 5],
          "100002": [1],
          "100003": [1, 2, 3],
          "100004": [4, 5],
          "100005": [2, 3, 4, 5],
        },
        "Action Step 3": {
          "100001": [1, 2, 3, 4, 5],
          "100002": [1, 2, 3],
          "100003": [1, 2, 5],
          "100004": [1, 4, 5],
          "100005": [1, 2, 3, 4, 5],
        },
      };

      for (let fIndex = 0; fIndex < forumDetails.length; fIndex++) {
        const forum = forumDetails[fIndex];

        // Select 5 users for the current forum
        const linkedUsers = userDetails.slice(
          fIndex * usersPerForum,
          (fIndex + 1) * usersPerForum
        );

        console.log(
          `Forum ${forum.forum_name} has ${linkedUsers.length} users linked.`
        );

        for (let actionStepIndex = 0; actionStepIndex < 3; actionStepIndex++) {
          const actionStep = actionStepDetails[actionStepIndex];
          let currentDate = new Date();
          currentDate.setDate(
            currentDate.getDate() + actionStepIndex * daysToAddPerActionStep
          );

          for (let u = 0; u < linkedUsers.length; u++) {
            const user = linkedUsers[u];

            const userActionDays =
              userActionSteps[`Action Step ${actionStepIndex + 1}`][
                String(100000 + u + 1)
              ];
            if (!userActionDays) continue;

            for (
              let dayIndex = 0;
              dayIndex < userActionDays.length;
              dayIndex++
            ) {
              const day = userActionDays[dayIndex];

              let entryDate = new Date(currentDate);
              entryDate.setDate(entryDate.getDate() + day);

              try {
                await prisma.user_forum_action_step_status.create({
                  data: {
                    user_id: user.id,
                    forum_id: forum.id,
                    action_step_id: actionStep.id,
                    message: `Day ${day}: ${actionStep.name} for ${forum.forum_name}`,
                    createdAt: entryDate.toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                });
              } catch (error) {
                console.error("Error inserting data:", error);
              }
            }
          }
        }
      }

      const lessonAssetMapping = [
        { chapter: 1, lesson: 1, type: "video", order: 1 },
        { chapter: 1, lesson: 2, type: "audio", order: 2 },
        { chapter: 1, lesson: 3, type: "survey", order: 3 },
        { chapter: 1, lesson: 4, type: "pdf", order: 4 },
        { chapter: 1, lesson: 5, type: "survey", order: 5 },
        { chapter: 2, lesson: 6, type: "image", order: 1 },
        { chapter: 2, lesson: 7, type: "audio", order: 2 },
        { chapter: 2, lesson: 8, type: "pdf", order: 3 },
        { chapter: 3, lesson: 9, type: "video", order: 1 },
        { chapter: 3, lesson: 10, type: "pdf", order: 2 },
        { chapter: 3, lesson: 11, type: "pdf", order: 3 },
        { chapter: 3, lesson: 12, type: "audio", order: 4 },
        { chapter: 3, lesson: 13, type: "video", order: 5 },
      ];

      const data = JSON.parse(
        fs.readFileSync("./prisma/seedData/asset_urls.json", "utf-8")
      );

      let count = 0;
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
                  asset_content_size: 2,
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
                  asset_content_size: 304,
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
                  asset_content_size: 624,
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
                  asset_content_size: 1,
                  url: assetData.url,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });
              assetId = image.id;
              assetName = image.name;
            }
            break;
          case "survey":
            if (data.Surveys) {
              assetData = data.Surveys[count];
              const survey = await prisma.surveys.create({
                data: {
                  uuid: uuidv4.v4(),
                  survey_data: assetData,
                  asset_content_size: 6, // 6 questions per survey (Approx) - // 6 * 60 = 360 secs
                  is_active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });
              assetId = survey.id;
              count++;
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
              survey_id: assetType === "survey" ? assetId : null,
              asset_type: assetTypes as any,
              is_preview: true,
              is_prerequisite: false,
              is_discussion_enabled: false,
              is_downloadable: true,
              is_active: true,
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

        let forumCourse = await prisma.forum_course.create({
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

        forumCourseDetails.push(forumCourse);

        let userId;

        switch (forum.id) {
          case 100001:
            userId = 100001;
            break;
          case 100002:
            userId = 100006;
            break;
          case 100003:
            userId = 100011;
            break;
          default:
            break;
        }

        if (userId) {
          const forumMeeting = await prisma.forum_meetings.create({
            data: {
              forum_id: forum.id,
              meeting_started_by: userId,
              meeting_started_at: new Date(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

          forumMeetingDetails.push(forumMeeting);
          let userMeetingStatus = await prisma.user_forum_meeting_status.create(
            {
              data: {
                user_id: userId,
                forum_meeting_id: forumMeeting.id,
                meeting_type: "zoom",
                checkin_time: new Date(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }
          );

          userForumMeetingStatusDetails.push(userMeetingStatus);
        }
      }

      for (let f = 0; f < forumDetails.length; f++) {
        let chapter: { course_id: any; id: any };
        if (f === 0) {
          chapter = chapterDetails.slice(0, 3)[0];
        } else if (f === 1) {
          chapter = chapterDetails.slice(3, 6)[0];
        } else if (f === 2) {
          chapter = chapterDetails.slice(6, 9)[0];
        } else {
          chapter = chapterDetails.slice(9, 12)[0];
        }

        const lesson = lessonDetails[0];

        for (let u = 0; u < 5; u++) {
          const user = userDetails[u];

          const forumCourse = forumCourseDetails.find(
            (fc: { course_id: any }) => fc.course_id === chapter.course_id
          );

          if (forumCourse) {
            if (forumCourse.chapter_id === chapter.id) {
              await prisma.user_forum_prework_status.create({
                data: {
                  forum_course_id: forumCourse.id,
                  user_id: user.id,
                  chapter_id: chapter.id,
                  lesson_id: lesson.id,
                  status: 0,
                  status_percent: 0,
                  is_current_lesson: true,
                },
              });
            }
          }
        }
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
          userPerForum += 1;
        }
      }
    },
    { timeout: 6000000 }
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

enum SectionType {
  header = "header",
  body = "body",
  footer = "footer",
}

enum Type {
  logical = "logical",
  repeatable = "repeatable",
  once = "once",
}
