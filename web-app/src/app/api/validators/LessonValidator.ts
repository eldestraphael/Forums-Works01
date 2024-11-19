import * as yup from "yup";

export class LessonValidator {
  async Lesson(body: any) {
    try {
      const lessonSchema = yup.object().shape({
        name: yup
          .string()
          .required("Name is required")
          .strict()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        chapter_uuid: yup
          .string()
          .uuid("Must be a valid UUID")
          .required("Chapter UUID is required"),
        asset_type: yup
          .mixed()
          .oneOf(
            ["pdf", "video", "audio", "text", "image", "forum_prep", "survey"],
            "Invalid asset type"
          )
          .strict()
          .required("Asset type is required"),
        asset_content_size: yup.number().optional(),
        is_preview: yup.boolean().optional(),
        is_prerequisite: yup.boolean().strict().optional(),
        is_discussion_enabled: yup.boolean().strict().optional(),
        is_downloadable: yup.boolean().strict().optional(),
      });

      await lessonSchema.validate(body, { abortEarly: false });
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

  async UpdateLesson(body: any) {
    try {
      const lessonSchema = yup.object().shape({
        name: yup
          .string()
          .strict()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        asset_type: yup
          .mixed()
          .oneOf(
            ["pdf", "video", "audio", "text", "image", "forum_prep", "survey"],
            "Invalid asset type"
          )
          .strict(),
        asset_content_size: yup.number().optional(),
        is_preview: yup.boolean().optional(),
        is_prerequisite: yup.boolean().strict().optional(),
        is_discussion_enabled: yup.boolean().strict().optional(),
        is_downloadable: yup.boolean().strict().optional(),
      });

      await lessonSchema.validate(body, { abortEarly: false });
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
