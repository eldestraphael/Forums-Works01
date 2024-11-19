import * as yup from "yup";
import { Course, UpdateCourse } from "../infrastructure/dtos/Course";

export class CourseValidator {
  async Course(body: Course) {
    try {
      const courseSchema = yup.object().shape({
        name: yup
          .string()
          .strict()
          .required()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        description: yup
          .string()
          .strict()
          .optional()
          .max(2500, "Must be alphanumeric with upto 2500 characters"),
      });

      await courseSchema.validate(body, { abortEarly: false });
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

  async PublishCourse(body: any) {
    try {
      const publishCourseSchema = yup.object().shape({
        publish: yup.boolean().strict().required(),
      });

      await publishCourseSchema.validate(body, { abortEarly: false });
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

  async UpdateCourse(body: UpdateCourse) {
    try {
      const updateCourseSchema = yup.object().shape({
        name: yup
          .string()
          .strict()
          .optional()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        description: yup
          .string()
          .strict()
          .optional()
          .max(2500, "Must be alphanumeric with upto 2500 characters"),
      });

      await updateCourseSchema.validate(body, { abortEarly: false });
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

  async UpdateCourseStatus(body: any) {
    try {
      const UpdateCourseSchema = yup.object().shape({
        is_active: yup.bool().required(),
      });
      await UpdateCourseSchema.validate(body, { abortEarly: false });
      return true;
    } catch (err: any) {
      const error = {
        statusCode: 422,
        message: `Invalid request`,
        data: err.errors,
      };
      throw error;
    }
  }
}
