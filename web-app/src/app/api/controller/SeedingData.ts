import prisma from "@/lib/prisma";
import { addDays, format } from "date-fns";
import { StaticMessage } from "../constants/StaticMessages";
import * as bcrypt from "bcrypt";

export async function createRecords(body: any) {
  try {
    let env = process.env.NODE_ENV;

    // if (env !== "production") {
    let password = await bcrypt.hash("Password@123", 10);
    let createdCourse: any = [];

    await prisma.$transaction(
      async (prisma) => {
        for (let data of body) {
          const { courses, companies } = data;

          const roles = await prisma.roles.findMany({
            select: {
              uuid: true,
              name: true,
            },
          });

          const roleJson = roles.reduce((acc: any, role: any) => {
            acc[role.name] = role.uuid;
            return acc;
          }, {});

          // Handle courses creation
          for (const course of courses) {
            let chapterOrder = 1;

            let courseData = await prisma.courses.create({
              data: {
                name: course.course_name,
                description: course.course_desc,
                chapters: {
                  create: course.chapters.map((chapter: any) => {
                    let lessonOrder = 1;
                    return {
                      name: chapter.chapter_name,
                      description: chapter.chapter_desc,
                      order: chapterOrder++,
                      lessons: {
                        create: chapter.lessons.map((lesson: any) => ({
                          name: lesson.lesson_name,
                          asset_type: lesson.lesson_asset_type,
                          [lesson.lesson_asset_type === "video"
                            ? "videos"
                            : lesson.lesson_asset_type === "pdf"
                            ? "pdfs"
                            : lesson.lesson_asset_type === "audio"
                            ? "audios"
                            : lesson.lesson_asset_type === "image"
                            ? "images"
                            : "forum_preps"]: {
                            create: {
                              name: lesson.lesson_name,
                              url: lesson.lesson_asset_url,
                              asset_content_size: lesson.asset_content_size,
                            },
                          },
                          is_active: true,
                          order: lessonOrder++,
                        })),
                      },
                      action_steps: {
                        create: {
                          name: chapter.action_step.action_step_name,
                          description: chapter.action_step.action_step_desc,
                          times_per_year: 356,
                          is_active: true,
                        },
                      },
                      is_active: true,
                    };
                  }),
                },
                is_active: true,
              },
            });

            const courseDetails = await prisma.courses.findUnique({
              where: {
                id: courseData?.id,
              },
              include: {
                chapters: {
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                    },
                    action_steps: true,
                  },
                  orderBy: { order: "asc" },
                },
              },
            });

            createdCourse.push(courseDetails);
          }

          // Handle companies creation
          for (const companyData of companies) {
            const company = await prisma.company.create({
              data: {
                company_name: companyData.company_name,
                is_active: true,
              },
            });

            let forums = companyData.company_forums;

            for (let forumData of forums) {
              let forumMeeting;
              const forum = await prisma.forum.create({
                data: {
                  company_id: company.id,
                  forum_name: forumData.forum_name,
                  meeting_day: calculateForumMeetingDay(
                    forumData.forum_meeting_day
                  ) as any,
                  meeting_time: forumData.forum_meeting_time,
                  is_active: true,
                },
              });

              let forumCourse;
              for (
                let courseIndex = 0;
                courseIndex < createdCourse.length;
                courseIndex++
              ) {
                forumCourse = await prisma.forum_course.create({
                  data: {
                    forum_id: forum.id,
                    course_id: createdCourse[courseIndex]?.id!,
                    chapter_id: createdCourse[courseIndex]?.chapters[0].id,
                    starting_date: new Date(
                      calculateForumStartDate(
                        forumData.forum_start_date,
                        forumData.forum_meeting_time
                      )
                    ),
                    is_current_course: true,
                  },
                });
              }

              let users = forumData.forum_members;

              for (let userDetails of users) {
                const user = await prisma.user.create({
                  data: {
                    first_name: userDetails.forum_members_first_name,
                    last_name: userDetails.forum_members_last_name,
                    email: userDetails.forum_members_email,
                    password: password,
                    company_id: company.id,
                    role_uuid: userDetails.forum_members_role
                      ? roleJson[userDetails.forum_members_role]
                      : "Client Admin",
                    phone: userDetails.forum_members_phone,
                    job_title: userDetails.forum_members_job_title,
                  },
                });
                await prisma.user_forum.create({
                  data: {
                    user_id: user.id,
                    forum_id: forum.id,
                  },
                });

                let memberPreworkData = userDetails.forum_members_data.prework;
                let memberActionStepData =
                  userDetails.forum_members_data.action_step;
                let memberMeetingData = userDetails.forum_members_data.meeting;
                for (
                  let courseIndex = 0;
                  courseIndex < createdCourse.length;
                  courseIndex++
                ) {
                  const course = createdCourse[courseIndex];
                  for (
                    let chapterIndex = 0;
                    chapterIndex < course.chapters.length;
                    chapterIndex++
                  ) {
                    if (course.chapters[chapterIndex]) {
                      let lessons =
                        createdCourse[courseIndex]?.chapters[chapterIndex]
                          .lessons!;
                      for (
                        let lessonIndex = 0;
                        lessonIndex < lessons.length;
                        lessonIndex++
                      ) {
                        if (lessons[lessonIndex]) {
                          if (
                            memberPreworkData &&
                            memberPreworkData[courseIndex] &&
                            memberPreworkData[courseIndex][chapterIndex] &&
                            memberPreworkData[courseIndex][chapterIndex][
                              lessonIndex
                            ]
                          ) {
                            await prisma.user_forum_prework_status.create({
                              data: {
                                forum_course_id: forumCourse?.id!,
                                chapter_id:
                                  createdCourse[courseIndex]?.chapters[
                                    chapterIndex
                                  ].id!,
                                lesson_id: lessons[lessonIndex].id!,
                                user_id: user.id,
                                status:
                                  memberPreworkData[courseIndex][chapterIndex][
                                    lessonIndex
                                  ].prework_status,
                                status_percent:
                                  memberPreworkData[courseIndex][chapterIndex][
                                    lessonIndex
                                  ].prework_status_percent,
                                is_current_lesson:
                                  memberPreworkData[courseIndex][chapterIndex][
                                    lessonIndex
                                  ].prework_is_current_lesson,
                              },
                            });
                          }
                        }
                      }
                    }

                    if (
                      memberActionStepData &&
                      memberActionStepData[courseIndex] &&
                      memberActionStepData[courseIndex][chapterIndex]
                    ) {
                      for (let actionStepData of memberActionStepData[
                        courseIndex
                      ][chapterIndex]) {
                        await prisma.user_forum_action_step_status.create({
                          data: {
                            user_id: user.id,
                            forum_id: forum.id,
                            action_step_id:
                              createdCourse[courseIndex]?.chapters[chapterIndex]
                                .action_steps[0].id!,
                            message: actionStepData.action_step_message,
                            createdAt: new Date(
                              calculateForumStartDate(
                                actionStepData.action_step_timestamp.split(
                                  " "
                                )[0],
                                actionStepData.action_step_timestamp.split(
                                  " "
                                )[1]
                              )
                            ),
                          },
                        });
                      }
                    }

                    if (
                      memberMeetingData &&
                      memberMeetingData[courseIndex] &&
                      memberMeetingData[courseIndex][chapterIndex]
                    ) {
                      for (let meetingData of memberMeetingData[courseIndex][
                        chapterIndex
                      ]) {
                        if (users[0].forum_members_email === user.email) {
                          forumMeeting = await prisma.forum_meetings.create({
                            data: {
                              forum_id: forum.id,
                              meeting_started_by: user.id,
                              meeting_started_at: new Date(
                                calculateForumStartDate(
                                  memberMeetingData[courseIndex][
                                    chapterIndex
                                  ][0].meeting_checkin_time.split(" ")[0],
                                  memberMeetingData[courseIndex][
                                    chapterIndex
                                  ][0].meeting_checkin_time.split(" ")[1]
                                )
                              ),
                              createdAt: new Date(
                                calculateForumStartDate(
                                  memberMeetingData[courseIndex][
                                    chapterIndex
                                  ][0].meeting_checkin_time.split(" ")[0],
                                  memberMeetingData[courseIndex][
                                    chapterIndex
                                  ][0].meeting_checkin_time.split(" ")[1]
                                )
                              ),
                            },
                          });
                        }

                        await prisma.user_forum_meeting_status.create({
                          data: {
                            user_id: user.id,
                            forum_meeting_id: forumMeeting?.id!,
                            meeting_type: meetingData.meeting_type,
                            checkin_time: new Date(
                              calculateForumStartDate(
                                meetingData.meeting_checkin_time.split(" ")[0],
                                meetingData.meeting_checkin_time.split(" ")[1]
                              )
                            ),
                            checkout_time: meetingData.meeting_checkout_time
                              ? new Date(
                                  calculateForumStartDate(
                                    meetingData.meeting_checkout_time.split(
                                      " "
                                    )[0],
                                    meetingData.meeting_checkout_time.split(
                                      " "
                                    )[1]
                                  )
                                )
                              : null,
                            status: meetingData.status,
                          },
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { timeout: 6000000 }
    );

    return {
      message: StaticMessage.TestingDataCreatedSuccessfully,
      data: null,
    };
    // } else {
    //   throw {
    //     message: `This endpoint is not supported in ${env} environment.`,
    //     statusCode: 400,
    //   };
    // }
  } catch (err: any) {
    throw err;
  }

  function calculateForumMeetingDay(meetingDayOffset: string) {
    const meetingDayOffsetInt = parseInt(meetingDayOffset, 10);

    // Calculate meeting day from the start date
    let meetingDate = addDays(new Date(), meetingDayOffsetInt);
    const formattedMeetingDay = format(meetingDate, "EEEE"); // EEEE for full day name (e.g., 'Sunday')

    return formattedMeetingDay;
  }

  function calculateForumStartDate(startOffset: string, time: string) {
    // Convert startOffset and meetingDayOffset to integers
    const startOffsetInt = parseInt(startOffset);

    // Calculate start date
    let startDate = addDays(new Date(), startOffsetInt);
    const formattedStartDate = format(startDate, "yyyy-MM-dd");

    return `${formattedStartDate}T${time}.000Z`;
  }
}
