import * as yup from "yup";
import { Forum, UpdateForum } from "../infrastructure/dtos/Forum";

export type AddForumAttendance = {
  member_uuid: string;
  mcqs: mscOption[];
};

export type mscOption = {
  mcq_option_uuid: string;
};

export class ForumValidator {
  async Forum(body: Forum) {
    try {
      const forumSchema = yup.object().shape({
        forum_name: yup
          .string()
          .strict()
          .required()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        meeting_day: yup
          .string()
          .strict()
          .required()
          .max(10, "Must be alphanumeric with upto 10 characters"),
        meeting_time: yup
          .string()
          .required()
          .matches(
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Must be time in 24 hour format"
          ),
        company_uuid: yup.string().uuid().required(),
        course_uuid: yup.string().uuid().required(),
        chapter_uuid: yup.string().uuid().optional(),
      });

      await forumSchema.validate(body, { abortEarly: false });
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

  async addForumAttendance(body: any) {
    try {
      const AddForumAttendanceSchema = yup
        .array()
        .of(
          yup.object().shape({
            member_uuid: yup.string().uuid().required(),
            mcqs: yup
              .array()
              .of(
                yup.object().shape({
                  mcq_option_uuid: yup.string().uuid().required(),
                })
              )
              .min(1),
          })
        )
        .min(1);

      await AddForumAttendanceSchema.validate(body, { abortEarly: false });
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

  async updateForum(body: UpdateForum) {
    try {
      const updateForumSchema = yup.object().shape({
        forum_name: yup
          .string()
          .strict()
          .optional()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        meeting_day: yup
          .string()
          .strict()
          .optional()
          .max(10, "Must be alphanumeric with upto 10 characters"),
        meeting_time: yup
          .string()
          .optional()
          .matches(
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Must be time in 24 hour format"
          ),
        company_uuid: yup.string().uuid().optional(),
        starting_date: yup.string().optional(),
        add_users: yup
          .array()
          .of(yup.string().uuid("Each user ID must be a valid UUID"))
          .optional(),
        remove_users: yup
          .array()
          .of(yup.string().uuid("Each user ID must be a valid UUID"))
          .optional(),
      });
      await updateForumSchema.validate(body, { abortEarly: false });
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

  async UpdateIsActiveInForum(body: any) {
    try {
      const UpdateIsActiveInForumSchema = yup.object().shape({
        is_active: yup.bool().required(),
      });
      await UpdateIsActiveInForumSchema.validate(body, { abortEarly: false });
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
