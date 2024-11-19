import * as yup from "yup";

interface MemberRequestBody {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  company_uuid: string;
  forums_info: [
    {
      uuid: string;
    }
  ];
}

export class MemberValidator {
  async AddMember(body: any) {
    try {
      const AddMemberSchema = yup.object().shape({
        first_name: yup
          .string()
          .strict()
          .required()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        last_name: yup
          .string()
          .strict()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        email: yup.string().email().required(),
        phone: yup
          .mixed()
          .nullable()
          .notRequired()
          .test(
            "is-string-or-null",
            "Must be 10-15 digits",
            (value) =>
              !value || (typeof value === "string" && /^\d{10,15}$/.test(value))
          ),
        job_title: yup
          .string()
          .strict()
          .required()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        company_uuid: yup.string().uuid().required(),
        role_uuid: yup.string().uuid().required(),
        forums_info: yup.array(
          yup.object().shape({
            uuid: yup.string().uuid().required(),
          })
        ),
      });
      await AddMemberSchema.validate(body, { abortEarly: false });
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

  async UpdateMember(body: any) {
    try {
      const UpdateMemberSchema = yup.object().shape({
        first_name: yup
          .string()
          .strict()
          .required()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        last_name: yup
          .string()
          .strict()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        email: yup.string().email().required(),
        phone: yup
          .mixed()
          .nullable()
          .notRequired()
          .test(
            "is-string-or-null",
            "Must be 10-15 digits",
            (value) =>
              !value || (typeof value === "string" && /^\d{10,15}$/.test(value))
          ),
        job_title: yup
          .string()
          .strict()
          .strict()
          .required()
          .max(50, "Must be alphanumeric with upto 50 characters"),
        company_uuid: yup.string().uuid().required(),
        role_uuid: yup.string().uuid().required(),
        forums_info: yup.array(
          yup.object().shape({
            uuid: yup.string().uuid(),
          })
        ),
      });
      await UpdateMemberSchema.validate(body, { abortEarly: false });
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
