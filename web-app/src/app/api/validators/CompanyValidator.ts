import * as yup from "yup";
import { Company } from "../infrastructure/dtos/Company";

export class CompanyValidator {
  async Company(body: Company) {
    try {
      const companySchema = yup.object().shape({
        company_name: yup
          .string()
          .strict()
          .required()
          .max(50, "Must be alphanumeric with upto 50 characters"),
      });

      await companySchema.validate(body, { abortEarly: false });
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

  async UpdateCompany(body: any) {
    try {
      const UpdateCompanySchema = yup.object().shape({
        is_active: yup.bool().required(),
      });
      await UpdateCompanySchema.validate(body, { abortEarly: false });
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
