import { StaticMessage } from "../constants/StaticMessages";
import { ResetPasswordValidator } from "../validators/ResetPasswordValidator";
import { EmailController } from "../helpers/emailService";
import { addMinutes, generateOTP } from "../helpers/otpGenerator";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcrypt";
let uuid = require("uuid");

export class ResetPasswordController {
  async getOTPEmail(email: string): Promise<Record<string, string | any>> {
    try {
      await new ResetPasswordValidator().sendOTP({ email });
      const user = await prisma.user.findFirst({
        where: { email: email, is_active: true },
      });
      if (user === null) {
        throw {
          statusCode: 404,
          data: null,
          message: StaticMessage.UserNotFound,
        };
      }

      const otp = await generateOTP();

      const result = await prisma.userResetPasswordOtps.create({
        data: {
          uuid: uuid.v4(),
          user_id: user.id,
          otp: parseInt(otp),
          expiresAt: await addMinutes(new Date(), 15),
        },
      });

      await new EmailController().resetPasswordOTP(email, otp);

      return {
        message: StaticMessage.OtpSuccess,
        data: {
          reset_info: {
            uuid: result.uuid,
            email: email,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async VerifyOTP(body: any) {
    try {
      await new ResetPasswordValidator().verifyOTP(body);
      const result = await prisma.userResetPasswordOtps.findFirst({
        where: { uuid: body.uuid },
      });

      if (result !== null) {
        if (result.otp !== Number(body.otp)) {
          throw {
            statusCode: 400,
            message: StaticMessage.OtpIncorrect,
            data: {
              reset_info: {
                uuid: result.uuid,
                email: body.email,
              },
            },
          };
        }
        const currentTime = new Date();
        if (currentTime > result.expiresAt) {
          throw {
            statusCode: 400,
            message: StaticMessage.OtpExpires,
            data: {
              reset_info: {
                uuid: result.uuid,
                email: body.email,
              },
            },
          };
        }

        body.password = await bcrypt.hash(body.password, 10);

        const updatedResp = await prisma.user.update({
          data: { password: body.password },
          where: { email: body.email },
        });

        return {
          message: StaticMessage.PasswordResetSuccess,
          data: {
            reset_info: {
              uuid: result.uuid,
              email: body.email,
            },
          },
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
