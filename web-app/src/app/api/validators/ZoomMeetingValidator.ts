import * as yup from "yup";
import { Chapter, UpdateChapter } from "../infrastructure/dtos/Chapter";
import { JoinMeeting, LeaveMeeting } from "../infrastructure/dtos/ZoomMeeting";

export class ZoomMeetingValidator {
  async JoinMeeting(body: JoinMeeting) {
    try {
      const joinMeetingSchema = yup.object().shape({
        type: yup.string().oneOf(["zoom", "bluetooth"], "Invalid meeting type").required(),
        device_id: yup.string().optional(),
      });

      await joinMeetingSchema.validate(body, { abortEarly: false });
      return true;
    } catch (err: any) {
      const validationErrors: any = {};
      if (err.inner) {
        err.inner.forEach((error: any) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        validationErrors[err.path] = err.message;
      }

      throw {
        statusCode: 422,
        message: `One or more fields have incorrect data`,
        data: validationErrors,
      };
    }
  }

  async LeaveMeeting(body: LeaveMeeting) {
    try {
      const leaveMeetingSchema = yup.object().shape({
        type: yup.mixed().oneOf(["zoom", "bluetooth"], "Invalid meeting type").required(),
        meeting_uuid: yup.string().uuid().required(),
        meeting_status_uuid: yup.string().uuid().required(),
      });

      await leaveMeetingSchema.validate(body, { abortEarly: false });
      return true;
    } catch (err: any) {
      const validationErrors: any = {};
      if (err.inner) {
        err.inner.forEach((error: any) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        validationErrors[err.path] = err.message;
      }

      throw {
        statusCode: 422,
        message: `One or more fields have incorrect data`,
        data: validationErrors,
      };
    }
  }
}
