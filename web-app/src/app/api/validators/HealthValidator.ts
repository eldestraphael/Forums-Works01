import * as yup from "yup";

export class HealthValidator {
  async updateHealth(body: any) {
    try {
      const UpdateHealthSchema = yup.object().shape({
        new_answers: yup.array(
          yup.object().shape({
            mcq_option_uuid: yup.string().uuid().required(),
          })
        ).min(1).required(),
        old_answers: yup.array(
          yup.object().shape({
            mcq_option_uuid: yup.string().uuid().required(),
          })
        ).min(1).required(),
      });
      await UpdateHealthSchema.validate(body, { abortEarly: false });
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
