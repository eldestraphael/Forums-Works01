import * as yup from "yup";
import { Course, UpdateCourse } from "../infrastructure/dtos/Course";
import { DleteFCMToken, FCM } from "../infrastructure/dtos/FCM";

export class FCMTokenValidator {
  async StoreFCMToken(body: FCM) {
    try {
      const storeFCMTokenSchema = yup.object().shape({
        fcm_token: yup
          .string()
          .strict()
          .required()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        device_id: yup
          .string()
          .strict()
          .required()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        device_meta: yup.object().strict().optional(),
      });

      await storeFCMTokenSchema.validate(body, { abortEarly: false });
      return true;
    } catch (err: any) {
      const validationErrors: any = {};
      err.inner.forEach((error: any) => {
        validationErrors[error.path] = error.message;
      });

      const error = {
        statusCode: 422,
        message: `One or more fields have incorrect data`,
        data: validationErrors,
      };
      throw error;
    }
  }

  async DeleteFCMToken(body: DleteFCMToken) {
    try {
      const deleteFCMTokenSchema = yup.object().shape({
        device_id: yup
          .string()
          .strict()
          .required()
          .max(255, "Must be alphanumeric with upto 255 characters"),
      });

      await deleteFCMTokenSchema.validate(body, { abortEarly: false });
      return true;
    } catch (err: any) {
      const validationErrors: any = {};
      err.inner.forEach((error: any) => {
        validationErrors[error.path] = error.message;
      });

      const error = {
        statusCode: 422,
        message: `One or more fields have incorrect data`,
        data: validationErrors,
      };
      throw error;
    }
  }
}
