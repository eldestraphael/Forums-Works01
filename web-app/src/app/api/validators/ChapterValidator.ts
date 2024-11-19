import * as yup from "yup";
import { Chapter, UpdateChapter } from "../infrastructure/dtos/Chapter";

export class ChapterValidator {
  async Chapter(body: Chapter) {
    try {
      const chapterSchema = yup.object().shape({
        name: yup
          .string()
          .required()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        description: yup
          .string()
          .notRequired()
          .max(2500, "Must be alphanumeric with upto 2500 characters"),
        course_uuid: yup.string().uuid().required(),
      });

      await chapterSchema.validate(body, { abortEarly: false });
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

  async UpdateChapter(body: UpdateChapter) {
    try {
      const updateChapterSchema = yup.object().shape({
        name: yup
          .string()
          .optional()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        description: yup
          .string()
          .optional()
          .max(2500, "Must be alphanumeric with upto 2500 characters"),
        course_uuid: yup.string().uuid().optional(),
      });

      await updateChapterSchema.validate(body, { abortEarly: false });
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
