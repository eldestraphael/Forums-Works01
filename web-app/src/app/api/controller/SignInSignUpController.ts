import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";
import { UsersValidator } from "@/app/api/validators/UserSchema";
import { comparePassword } from "../helpers/PasswordValidator";
import { signJwtAccessToken } from "@/lib/jwt";
import * as bcrypt from "bcrypt";

interface RequestBody {
  first_name: string;
  last_name?: string;
  email: string;
  password?: string;
  phone?: string;
  job_title: string;
  company_name: string;
}

interface SignInRequestBody {
  email: string;
  password: string;
}

export class SignInSignUpController {
  async SignIn(body: SignInRequestBody) {
    try {
      await new UsersValidator().userSchemaSignIn(body, "signin");
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: body.email,
            mode: 'insensitive'
          },
          is_active: true,
        },
      });
      if (user === null) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      if (user.password === null) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.NoPasswordUser,
        };
      }

      let IsMatchPassword = await comparePassword(
        body.password,
        user.password!
      );
      if (!IsMatchPassword) {
        throw {
          statusCode: 401,
          data: null,
          message: StaticMessage.InvalidPassword,
        };
      }

      const { password, ...userWithoutPass } = user;
      const accessToken = await signJwtAccessToken(userWithoutPass);
      const result = {
        user_info: userWithoutPass,
        auth_info: accessToken,
      };

      return {
        message: StaticMessage.LoginSuccessfully,
        data: result,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async SignUp(body: RequestBody) {
    try {
      await new UsersValidator().userSchemaSignUp(body, "signup");
      const email = await prisma.user.findFirst({
        where: {
          email: body.email,
          is_active: true,
        },
      });
      if (email) {
        throw {
          message: StaticMessage.ExistEmail,
          data: null,
          statusCode: 400,
        };
      }

      const isCompanyExist = await prisma.company.findFirst({
        where: {
          company_name: body.company_name.trim().toLowerCase(),
          is_active: true,
        },
      });

      const companyData = isCompanyExist
        ? isCompanyExist
        : await prisma.company.create({
            data: {
              company_name: body.company_name.trim().toLowerCase(),
            },
          });

      const user = await prisma.user.create({
        data: {
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          company_id: companyData.id,
          phone: body.phone,
          job_title: body.job_title,
          password: body.password ? await bcrypt.hash(body.password, 10) : null,
        },
      });
      const { password, ...result } = user;
      return {
        message: StaticMessage.SuccessfullyRegister,
        data: null,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
