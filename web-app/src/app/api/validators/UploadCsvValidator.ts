import * as yup from "yup";

export class UploadCsvValidator {
  async validateCSVRecords(body: any) {
    try {
      for (const item of body) {
        const hasPhoneNumber = item.phone && item.phone.length !== 0;

        const schema = yup.object().shape({
          first_name: yup.string().required().max(50),
          last_name: yup.string().max(50),
          job_title: yup.string().required().max(50),
          phone: hasPhoneNumber
            ? yup
                .string()
                .matches(
                  /^[0-9]{1,15}$/,
                  "Phone number must be a valid number with 1 to 15 digits."
                )
                .nullable()
            : yup.string().nullable(),
          company: yup.string().required().max(50),
          email: yup.string().required().email().max(50),
          password: yup
            .mixed()
            .oneOf(["YES", "NO", "yes", "no", "Yes", "No"])
            .required(),
          forum: yup.string().required().max(50),
        });

        await schema.validate(item, { abortEarly: false });
      }

      return true;
    } catch (err: any) {
      const validationErrors: any = {};

      if (err.inner) {
        err.inner.forEach((error: any) => {
          if (!validationErrors[error.path]) {
            validationErrors[error.path] = [];
          }
          validationErrors[error.path].push(error.message);
        });
      }

      const error = {
        statusCode: 422,
        message: `One or more fields have incorrect data`,
        data: validationErrors,
      };
      throw error;
    }
  }
}
