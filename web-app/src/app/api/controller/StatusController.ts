import { StaticMessage } from "../constants/StaticMessages";
import prisma from "@/lib/prisma";
import { UserForumPreWorkController } from "./UserForumPreWorkController";
import { subMonths } from "date-fns";
import { CalculateAverage } from "../helpers/calculateAverage";

const jwt = require("jsonwebtoken");

export class StatusController {
  async getStatus(userUuid: string, forumUuid: string) {
    try {
      // Find the user forum
      let userForum = await prisma.user_forum.findFirst({
        where: {
          forum: {
            uuid: forumUuid,
          },
          user: {
            uuid: userUuid,
          },
        },
        select: {
          user: {
            select: {
              is_active: true,
            },
          },
        },
      });

      let status = userForum ? userForum.user.is_active : false;
      let nextMeeting = null;

      let { forumCourse, chapter } =
        await new UserForumPreWorkController().calculateAndGetCurrentChapter(
          forumUuid
        );

      if (forumCourse && forumCourse.forum.is_active === false) {
        throw {
          statusCode: 400,
          message: StaticMessage.ForumIsNotActive,
          data: null,
        };
      }

      // Calculate next meeting if the user is active
      if (status) {
        const currentDay = new Date(
          new Date().toISOString().split("T")[0] + "T00:00:00Z"
        );
        const meetingDay = forumCourse?.forum.meeting_day;
        const meetingTime = forumCourse?.forum.meeting_time;

        nextMeeting = await this.calculateNextMeeting(
          currentDay,
          meetingDay,
          meetingTime
        );
      }

      // Get total lessons in the chapter
      const totalTasks = await prisma.lessons.findMany({
        where: {
          chapter_id: chapter?.id,
          is_active: true,
        },
        select: {
          id: true,
          uuid: true,
          asset_type: true,
          pdf_id: true,
          video_id: true,
          audio_id: true,
          image_id: true,
          survey_id: true,
        },
      });

      let totalTaskDuration = 0;

      for (let task of totalTasks) {
        let assetContentSize = 0;
        switch (task.asset_type) {
          case "pdf":
            if (task.pdf_id) {
              const pdf = await prisma.pdfs.findUnique({
                where: {
                  id: task.pdf_id,
                },
              });

              assetContentSize = pdf?.asset_content_size
                ? pdf.asset_content_size * 5 * 60
                : 0; // 300 seconds per page = 5 minutes, 1 minute = to 60 secs
            }
            break;
          case "audio":
            if (task.audio_id) {
              const audio = await prisma.audios.findUnique({
                where: {
                  id: task.audio_id,
                },
              });

              assetContentSize = audio ? audio.asset_content_size ?? 0 : 0;
            }
            break;
          case "video":
            if (task.video_id) {
              const video = await prisma.videos.findUnique({
                where: {
                  id: task.video_id,
                },
              });

              assetContentSize = video ? video.asset_content_size ?? 0 : 0;
            }
            break;
          case "image":
            if (task.image_id) {
              const image = await prisma.images.findUnique({
                where: {
                  id: task.image_id,
                },
              });

              assetContentSize = image?.asset_content_size
                ? image.asset_content_size * 5 * 60
                : 0; // 300 seconds per page = 5 minutes, 1 minute = to 60 secs
            }
            break;
          case "survey":
            if (task.survey_id) {
              const survey = await prisma.surveys.findUnique({
                where: {
                  id: task.survey_id,
                },
              });

              assetContentSize = survey?.asset_content_size
                ? survey.asset_content_size * 60
                : 0; // 60 seconds per survey = 1 minute = to 60 secs
            }
            break;
        }
        totalTaskDuration += assetContentSize;
      }

      const lessonIdArray = totalTasks.map((lesson) => lesson.id);

      // Get completed lessons by the user
      const completedTasks = await prisma.user_forum_prework_status.findMany({
        where: {
          chapter_id: chapter?.id,
          user: {
            uuid: userUuid,
          },
          forum_course_id: forumCourse?.id,
          status_percent: 100,
          lesson_id: {
            in: lessonIdArray,
          },
        },
        include: {
          lessons: {
            select: {
              asset_type: true,
            },
          },
        },
      });

      let totalDuration = 0;

      for (let task of completedTasks) {
        if (
          task.lessons?.asset_type === "pdf" ||
          task.lessons?.asset_type === "image"
        ) {
          totalDuration += (task.status ?? 0) * 5 * 60;
        } else if (task.lessons?.asset_type === "survey") {
          totalDuration += (task.status ?? 0) * 1 * 60;
        } else {
          totalDuration += task.status ?? 0;
        }
      }

      let action_step = await prisma.action_steps.findFirst({
        where: {
          chapter_id: chapter?.id,
          is_active: true,
        },
      });

      // Calculate action step completion status
      let completionStatus =
        action_step !== null
          ? await this.calculateActionStepCompletionStatus(
              userUuid,
              forumUuid,
              action_step.times_per_year,
              action_step.id,
              forumCourse?.forum.meeting_day!,
              forumCourse?.forum.meeting_time!,
              forumCourse?.starting_date!
            )
          : [];

      const threeMonthsAgo = subMonths(new Date(), 3);

      const scores = await prisma.user_per_forum_health_score.findMany({
        where: {
          user: {
            uuid: userUuid,
          },
          forum: {
            uuid: forumUuid,
          },
          date: {
            gte: threeMonthsAgo,
          },
        },
        select: {
          score: true,
        },
      });

      return {
        message: StaticMessage.MemberStatus,
        data: status
          ? {
              status: status, // false if user doesn't belong to the forum
              momentum:
                await new CalculateAverage().calculateMomentumPercentage(
                  scores
                ),
              prework: {
                total_tasks: totalTasks.length,
                completed_tasks: completedTasks.length,
                total_time: totalTaskDuration,
                completed_time: totalDuration,
              },
              action_step: {
                completion_status: completionStatus,
              },
              forum_meeting: {
                next_meeting: nextMeeting,
              },
            }
          : { status: status },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async calculateNextMeeting(
    currentDate: any,
    meetingDay: any,
    meetingTime: any
  ) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayIndex = currentDate.getUTCDay();
    const meetingDayIndex = daysOfWeek.indexOf(meetingDay);

    let daysUntilNextMeeting = (meetingDayIndex - currentDayIndex + 7) % 7;
    if (daysUntilNextMeeting === 0) {
      const currentTime = new Date().toISOString().split("T")[1].split(".")[0];
      if (currentTime >= meetingTime) {
        const [meetingHours, meetingMinutes, meetingSeconds] = meetingTime
          .split(":")
          .map(Number);
        const meetingDateTime = new Date(currentDate);
        meetingDateTime.setUTCHours(
          meetingHours,
          meetingMinutes,
          meetingSeconds,
          0
        );

        const meetingEndTime = new Date(meetingDateTime.getTime() + 90 * 60000); // 90 minutes later
        if (new Date() <= meetingEndTime) {
          return meetingDateTime
            .toISOString()
            .replace("T", " ")
            .substring(0, 19);
        } else {
          daysUntilNextMeeting = 7;
        }
      }
    }

    const nextMeetingDate = new Date(currentDate);
    nextMeetingDate.setUTCDate(currentDate.getUTCDate() + daysUntilNextMeeting);
    const [hours, minutes, seconds] = meetingTime.split(":");
    nextMeetingDate.setUTCHours(hours, minutes, seconds, 0);

    return nextMeetingDate.toISOString().replace("T", " ").substring(0, 19);
  }

  async calculateActionStepCompletionStatus(
    userUuid: string,
    forumUuid: string,
    timesPerYear: number,
    actionStepId: number,
    meetingDay: string,
    meetingTime: string,
    startDate: Date
  ) {
    const currentDate = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Function to get the closest past and future occurrences of the specified day of the week
    const getClosestDay = (dayOfWeek: any, time: any) => {
      const today = new Date();
      const dayIndex = daysOfWeek.indexOf(dayOfWeek);

      const [hours, minutes, seconds] = time.split(":").map(Number);

      let previousDate = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          hours,
          minutes,
          seconds
        )
      );
      while (previousDate.getUTCDay() !== dayIndex || previousDate > today) {
        previousDate.setUTCDate(previousDate.getUTCDate() - 1);
      }

      let nextDate = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          hours,
          minutes,
          seconds
        )
      );
      while (nextDate.getUTCDay() !== dayIndex || nextDate <= today) {
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      }

      return { previousDate, nextDate };
    };

    // Calculate start_time and end_time
    const { previousDate: start_date, nextDate: end_date } = getClosestDay(
      meetingDay,
      meetingTime
    );
    const start_time = new Date(
      `${start_date.toISOString().split("T")[0]}T${meetingTime}.000Z`
    );
    const end_time = new Date(
      `${end_date.toISOString().split("T")[0]}T${meetingTime}.000Z`
    );

    const interval_per_day = 24 * 60 * 60 * 1000; // One day in milliseconds

    const completionStatus = [];
    let currentStart = new Date(startDate);
    const [hours, minutes, seconds] = meetingTime.split(":").map(Number);
    currentStart.setUTCHours(hours, minutes, seconds, 0); // Set the start time to the meeting time on startDate

    if (new Date(startDate) < start_time) {
      currentStart = start_time;
    }

    const actionStepCompleted =
      await prisma.user_forum_action_step_status.findMany({
        where: {
          user: { uuid: userUuid },
          forum: { uuid: forumUuid },
          action_step_id: actionStepId,
          createdAt: {
            gte: currentStart,
            lt: end_time,
          },
        },
      });

    // Helper function to check if a date is a weekday
    const isWeekday = (date: any) => {
      const day = date.getDay();
      return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
    };

    while (currentStart < end_time) {
      if (!isWeekday(currentStart)) {
        // If it's a weekend, skip to the next weekday
        currentStart.setTime(currentStart.getTime() + interval_per_day); // One day in milliseconds
        continue;
      }

      let nextStart = new Date(currentStart);
      nextStart.setTime(currentStart.getTime() + interval_per_day - 1); // One day minus 1 millisecond

      // Handle weekend edge case
      if (currentStart.getDay() === 5) {
        // If it's Friday
        nextStart.setTime(currentStart.getTime() + interval_per_day - 1); // Extend to Monday 11:59:59
      }

      const actions = actionStepCompleted.filter((info: any) => {
        const actionDate = new Date(info.createdAt);
        return actionDate >= currentStart && actionDate < nextStart;
      });

      if (currentDate >= nextStart) {
        // Past intervals
        completionStatus.push(actions.length ? 1 : -1);
      } else if (currentDate >= currentStart && currentDate < nextStart) {
        // Current interval
        completionStatus.push(actions.length ? 1 : 0);
      } else {
        // Future intervals
        completionStatus.push(0);
      }

      currentStart.setTime(currentStart.getTime() + interval_per_day); // Move to the next day
    }

    return completionStatus;
  }
}
