import * as yup from "yup";

export class ResetPasswordValidator {
  async sendOTP(body: any) {
    try {
      const sendOTPSchema = yup.object().shape({
        email: yup.string().email().required(),
      });
      await sendOTPSchema.validate(body, { abortEarly: false });
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

  async verifyOTP(body: any) {
    try {
      const verifyOTPSchema = yup.object().shape({
        uuid: yup.string().required().uuid(),
        email: yup.string().email().required(),
        otp: yup.number().required(),
        password: yup
          .string()
          .min(8, "Password must be atleast 8 characters")
          .required(),
      });
      await verifyOTPSchema.validate(body, { abortEarly: false });
      return true;
    } catch (err: any) {
      const error = {
        statusCode: 422,
        data: err.errors,
      };
      throw error;
    }
  }
}
