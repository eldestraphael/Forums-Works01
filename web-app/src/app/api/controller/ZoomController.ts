import { StaticMessage } from "../constants/StaticMessages";
import prisma from "@/lib/prisma";
import {
  parse,
  subMinutes,
  addMinutes,
  isBefore,
  isAfter,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ZoomMeetingValidator } from "../validators/ZoomMeetingValidator";
import {
  JoinMeeting,
  LeaveMeeting,
  MeetingType,
} from "../infrastructure/dtos/ZoomMeeting";

const jwt = require("jsonwebtoken");

export class ZoomController {
  async getZoomToken(userUuid: string, forumUuid: string) {
    try {
      let isUserExist = await prisma.user.findUnique({
        where: {
          uuid: userUuid,
        },
      });

      if (!isUserExist) {
        throw {
          statusCode: 400,
          data: null,
          message: StaticMessage.InvalidUser,
        };
      }

      if (!isUserExist.is_active) {
        throw {
          statusCode: 400,
          data: null,
          message: StaticMessage.UnAuthorizedUser,
        };
      }

      let forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
      });

      if (!forum) {
        throw {
          statusCode: 400,
          data: null,
          message: StaticMessage.ForumNotFound,
        };
      }

      // Your Zoom API Key and API Secret
      const apiKey = process.env.ZOOM_SDK_KEY;
      const apiSecret = process.env.ZOOM_SDK_SECRET;
      const iat = Math.round((new Date().getTime() - 30000) / 1000);
      const exp = iat + 5400; // 60 seconds (1 minute) after iat

      // Set up the payload with required claims
      const payload = {
        app_key: apiKey,
        role_type: 1,
        tpc: forum.uuid,
        version: 1,
        iat: iat,
        exp: exp,
      };

      // Generate the JWT token
      const token = jwt.sign(payload, apiSecret);

      return {
        message: StaticMessage.ZoomTokenGenerated,
        data: { token: token },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async joinMeeting(userUuid: string, forumUuid: string, body: JoinMeeting) {
    try {
      await new ZoomMeetingValidator().JoinMeeting(body);

      const isForumExist = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
      });

      if (!isForumExist) {
        throw {
          message: StaticMessage.ForumNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const now = new Date();
      const meetingTimeInUTC = isForumExist.meeting_time!;

      // Parse the meeting time as UTC
      const [hours, minutes, seconds] = meetingTimeInUTC.split(":").map(Number);
      const meetingDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          hours,
          minutes,
          seconds
        )
      );

      const accessStartTime = subMinutes(meetingDate, 5);
      const accessEndTime = addMinutes(meetingDate, 90);

      if (isBefore(now, accessStartTime) || isAfter(now, accessEndTime)) {
        throw {
          message: StaticMessage.AccessDeniedToJoinTheMeeting,
          data: null,
          statusCode: 400,
        };
      }

      const {
        data: { token },
      } = await this.getZoomToken(userUuid, forumUuid);

      const isUserExist = await prisma.user.findUnique({
        where: {
          uuid: userUuid,
          is_active: true,
        },
      });

      if (!isUserExist) {
        throw {
          statusCode: 401,
          data: null,
          message: StaticMessage.UnAuthorizedUser,
        };
      }

      // Check if a forum meeting exists
      let forumMeetings = await prisma.forum_meetings.findFirst({
        where: {
          forum_id: isForumExist.id,
        },
      });

      // If no forum meeting exists, create one
      if (!forumMeetings) {
        forumMeetings = await prisma.forum_meetings.create({
          data: {
            forum_id: isForumExist.id,
            meeting_started_by: isUserExist.id,
            meeting_started_at: new Date(),
          },
        });
      }

      // Create an entry in the user_forum_meeting_status table
      const data: any = {
        user_id: isUserExist.id,
        forum_meeting_id: forumMeetings.id,
        meeting_type: body.type,
        checkin_time: new Date(),
      };

      if (body.type === MeetingType.bluetooth) {
        data["device_id"] = body.device_id;
        data["status"] = false;
      } else {
        data["device_id"] = body.device_id;
        data["status"] = true;
      }
      const forumMeetingStatus = await prisma.user_forum_meeting_status.create({
        data: data,
      });

      return {
        message: StaticMessage.AccessGrantedToJoinTheMeeting,
        data: {
          meeting_uuid: forumMeetings.uuid,
          meeting_status_uuid: forumMeetingStatus.uuid,
          token: body.type === MeetingType.zoom ? token : null,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async leaveMeeting(userUuid: string, forumUuid: string, body: LeaveMeeting) {
    try {
      await new ZoomMeetingValidator().LeaveMeeting(body);

      const isForumExist = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
      });

      if (!isForumExist) {
        throw {
          message: StaticMessage.ForumNotFound,
          data: null,
          statusCode: 404,
        };
      }

      const isUserExist = await prisma.user.findUnique({
        where: {
          uuid: userUuid,
          is_active: true,
        },
      });

      if (!isUserExist) {
        throw {
          statusCode: 401,
          data: null,
          message: StaticMessage.UnAuthorizedUser,
        };
      }

      const isForumMeetingExist = await prisma.forum_meetings.findUnique({
        where: {
          uuid: body.meeting_uuid,
          forum_id: isForumExist.id,
        },
      });

      if (!isForumMeetingExist) {
        throw {
          message: StaticMessage.ForumMeetingNotFound,
          data: null,
          statusCode: 404,
        };
      }

      let isForumMeetingStatusExist =
        await prisma.user_forum_meeting_status.findUnique({
          where: {
            uuid: body.meeting_status_uuid,
            checkout_time: null,
          },
        });

      if (!isForumMeetingStatusExist) {
        throw {
          message: StaticMessage.ForumMeetingStatusNotFound,
          data: null,
          statusCode: 404,
        };
      }

      await prisma.user_forum_meeting_status.update({
        data: {
          checkout_time: new Date(),
        },
        where: {
          uuid: body.meeting_status_uuid,
        },
      });

      return {
        message: StaticMessage.LeftMeetingSuccessfully,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getMeetingInfo(forumUuid: string, meetingUuid: string) {
    try {
      const isForumExist = await prisma.forum.findFirst({
        where: {
          uuid: forumUuid,
          is_active: true,
        },
        include: {
          user_forum: {
            select: {
              user: true,
            },
          },
        },
      });

      if (!isForumExist) {
        throw {
          message: StaticMessage.ForumNotFound,
          data: null,
          statusCode: 400,
        };
      }

      let isMeetingExist = await prisma.forum_meetings.findUnique({
        where: {
          uuid: meetingUuid,
          forum_id: isForumExist.id,
        },
      });

      if (!isMeetingExist) {
        throw {
          message: StaticMessage.ForumMeetingNotFound,
          data: null,
          statusCode: 400,
        };
      }

      let records: any = await prisma.$queryRaw`WITH user_meeting_status AS (
        SELECT
          u.uuid AS user_uuid,
          u.first_name,
          u.last_name,
          fm.uuid AS meeting_uuid,
          ufms.uuid AS meeting_status_uuid,
          ufms.meeting_type,
          ufms.status,
          ROW_NUMBER() OVER (PARTITION BY uf.user_id ORDER BY ufms."createdAt" DESC) AS rn,
          MAX(ufms.status::int) OVER (PARTITION BY uf.user_id) AS max_status
        FROM
            "Forum" f
        JOIN user_forum uf ON uf.forum_id = f.id
        JOIN "User" u ON uf.user_id = u.id
        LEFT JOIN user_forum_meeting_status ufms ON ufms.user_id = uf.user_id
        AND (ufms.meeting_type = 'bluetooth' OR ufms.meeting_type IS NULL)
        LEFT JOIN forum_meetings fm ON ufms.forum_meeting_id = fm.id
        AND (fm.uuid = ${meetingUuid}::uuid OR fm.uuid IS NULL)
        WHERE
            f.uuid = ${forumUuid}::uuid
            AND f.is_active = TRUE
    )
    SELECT
        user_uuid,
        first_name,
        last_name,
        meeting_uuid,
        meeting_status_uuid,
        meeting_type,
        status
    FROM
        user_meeting_status
    WHERE
        rn = 1 OR rn IS NULL;
     `;

      return {
        message: StaticMessage.InfoOfMeeting,
        data: {
          member_status: records.map((item: any) => {
            return {
              user_info: {
                uuid: item.user_uuid,
                first_name: item.first_name,
                last_name: item.last_name,
              },
              meeting_uuid: item.meeting_uuid || null,
              meeting_status_uuid: item.meeting_status_uuid || null,
              meeting_type: item.meeting_type || null,
              status: item.status || null,
            };
          }),
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async updateMeetingStatus(forumUuid: string, userUuid: string, body: any) {
    try {
      // Check if the meeting exists and was started by the current user
      const isForumMeetingExist = await prisma.forum_meetings.findUnique({
        where: {
          uuid: body.meeting_uuid,
        },
      });

      if (!isForumMeetingExist) {
        throw {
          message: StaticMessage.NoMeeting,
          data: null,
          statusCode: 404,
        };
      }

      const latestRecord = await prisma.user_forum_meeting_status.findFirst({
        where: {
          device_id: {
            in: body.device_id,
          },
          checkin_time: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (latestRecord) {
        await prisma.user_forum_meeting_status.update({
          where: { id: latestRecord.id },
          data: {
            status: body.status,
          },
        });
      }

      // Prepare the output response
      return {
        message: StaticMessage.MeetingStatusUpdated,
        data: body.device_id.map((id: string) => ({
          meeting_uuid: body.meeting_uuid,
          meeting_status_uuid: id,
          status: body.status,
        })),
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getUserMeetingStatus(forumUuid: string, userUuid: string) {
    try {
      const userStatus: any = await prisma.$queryRaw`SELECT
      ufms.checkin_time AS user_checkin_time,
      fm.meeting_started_at AS started_at,
      fm.uuid AS meeting_uuid,
      f.meeting_time,
      f.forum_name,
      CASE WHEN ufms.status THEN TRUE ELSE FALSE END as status
      FROM "Forum" f
      LEFT JOIN user_forum uf ON uf.forum_id = f.id
      LEFT JOIN "User" u ON u.id = uf.user_id
      LEFT JOIN forum_meetings fm ON fm.forum_id = f.id
      LEFT JOIN user_forum_meeting_status ufms ON ufms.forum_meeting_id = fm.id
      AND ufms.user_id = u.id
      AND ufms.status = TRUE
      AND ufms.meeting_type = 'bluetooth'
      AND ufms.checkin_time > now()::date - INTERVAL '1 day'
      AND ufms.checkin_time < now()::date + INTERVAL '1 day'
      WHERE f.uuid = ${forumUuid}::uuid
      AND f.is_active = TRUE
      AND u.uuid = ${userUuid}::uuid
      AND u.is_active = TRUE
      ORDER BY ufms.checkin_time ASC
      LIMIT 1;`;

      if (!userStatus.length) {
        return {
          message: StaticMessage.InfoOfMeeting,
          data: {
            forum_uuid: forumUuid,
            user_uuid: userUuid,
            meeting_time: null,
            forum_name: null,
            started_at: null,
            user_checkin_time: null,
            status: false,
          },
        };
      }

      const meetingStatus = userStatus[0];

      return {
        message: StaticMessage.InfoOfMeeting,
        data: {
          forum_uuid: forumUuid,
          user_uuid: userUuid,
          meeting_time: meetingStatus.meeting_time,
          forum_name: meetingStatus.forum_name,
          started_at: meetingStatus.started_at,
          user_checkin_time: meetingStatus.user_checkin_time || null,
          status: meetingStatus.status,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }
}
