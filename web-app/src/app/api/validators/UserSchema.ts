import * as yup from "yup";
export class UsersValidator {
  async userSchemaSignUp(body: any, api: string) {
    try {
      const SignUpUsersSchema = yup.object().shape({
        first_name: yup.string().required("First Name is required"),
        last_name: yup.string(),
        email: yup
          .string()
          .email("Email is not valid")
          .required("Email is required"),
        password: yup
          .string()
          .min(8, "Password is too short - should be 8 chars minimum."),
        company_name: yup.string().required("Company name is required"),
        job_title: yup.string().required("Job title is required"),
        phone: yup
          .string()
          .min(10, "Phone number is incorrect - should be 10 chars minimum."),
      });
      await SignUpUsersSchema.validate(body, { abortEarly: false });
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

  async userSchemaSignIn(body: any, api: string) {
    try {
      const SignInUsersSchema = yup.object().shape({
        email: yup
          .string()
          .email("Email is not valid")
          .required("Email is required"),
        password: yup
          .string()
          .min(8, "Password is too short - should be 8 chars minimum.")
          .required("Password is required"),
      });
      await SignInUsersSchema.validate(body, { abortEarly: false });
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

  async UpdateUser(body: any) {
    try {
      const UpdateUserSchema = yup.object().shape({
        is_active: yup.bool().required(),
      });
      await UpdateUserSchema.validate(body, { abortEarly: false });
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

  async UserAclRequest(body: any) {
    try {
      const UpdateUserSchema = yup.array(
        yup.object().shape({
          module: yup.string().strict().required().max(50),
          sub_module: yup.string().strict().max(50),
          actions: yup.array().of(yup.string().strict()).min(1).required(),
        })
      );
      await UpdateUserSchema.validate(body, { abortEarly: false });
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
