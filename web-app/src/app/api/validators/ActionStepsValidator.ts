import * as yup from "yup";
import {
  ActionSteps,
  UpdateActionSteps,
} from "../infrastructure/dtos/ActionSteps";

export class ActionStepsValidator {
  async ActionSteps(body: ActionSteps) {
    try {
      const actionStepsSchema = yup.object().shape({
        chapter_uuid: yup.string().strict().uuid().required(),
        name: yup
          .string()
          .required()
          .strict()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        description: yup
          .string()
          .required()
          .strict()
          .max(2500, "Must be alphanumeric with upto 2500 characters"),
        times_per_year: yup.number().strict().required(),
      });

      await actionStepsSchema.validate(body, { abortEarly: false });
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

  async UpdateActionSteps(body: UpdateActionSteps) {
    try {
      const updateActionStepsSchema = yup.object().shape({
        chapter_uuid: yup.string().strict().uuid().optional(),
        name: yup
          .string()
          .optional()
          .strict()
          .max(255, "Must be alphanumeric with upto 255 characters"),
        description: yup
          .string()
          .optional()
          .strict()
          .max(2500, "Must be alphanumeric with upto 2500 characters"),
        times_per_year: yup.number().strict().optional(),
      });

      await updateActionStepsSchema.validate(body, { abortEarly: false });
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
