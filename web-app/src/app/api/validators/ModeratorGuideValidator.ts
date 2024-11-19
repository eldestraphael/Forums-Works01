import * as yup from "yup";
import { ModeratorGuide } from "../infrastructure/dtos/ModeratorGuide";

export class ModeratorGuideValidator {
  async createModeratorGuide(body: ModeratorGuide[]) {
    try {
      const moderatorGuideSchema = yup.array(
        yup.object().shape({
          section_type: yup
            .mixed()
            .oneOf(["header", "body", "footer"], "Invalid section type")
            .strict()
            .required(),
          type: yup
            .mixed()
            .oneOf(["logical", "repeatable", "once"], "Invalid type")
            .strict()
            .required(),
          title: yup
            .string()
            .optional()
            .strict()
            .max(250, "Must be alphanumeric with upto 250 characters"),
          description: yup
            .string()
            .optional()
            .strict()
            .max(2500, "Must be alphanumeric with upto 2500 characters"),
          order: yup.number().strict().required(),
          duration: yup.number().strict().optional(),
          duration_per_person: yup.number().strict().optional(),
          link: yup.string().strict().optional(),
        })
      );

      await moderatorGuideSchema.validate(body, { abortEarly: false });
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
