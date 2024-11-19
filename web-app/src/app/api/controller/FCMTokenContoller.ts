import { StaticMessage } from "../constants/StaticMessages";
import prisma from "@/lib/prisma";
import { DleteFCMToken, FCM } from "../infrastructure/dtos/FCM";
import { FCMTokenValidator } from "../validators/FCMTokenValidator";

export class FCMTokenContoller {
  async StoreFCMToken(userId: number, body: FCM) {
    try {
      await new FCMTokenValidator().StoreFCMToken(body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw {
          message: StaticMessage.UserNotFound,
          data: null,
          statusCode: 404,
        };
      }

      await prisma.user_fcm_tokens.deleteMany({
        where: {
          user_id: userId,
          is_active: true,
        },
      });

      await prisma.user_fcm_tokens.upsert({
        where: {
          user_id: userId,
          device_id: body.device_id,
        },
        update: {
          fcm_token: body.fcm_token,
          device_meta: JSON.stringify(body.device_meta),
          is_active: true,
          updatedAt: new Date(),
        },
        create: {
          user_id: userId,
          device_id: body.device_id,
          fcm_token: body.fcm_token,
          device_meta: JSON.stringify(body.device_meta),
          is_active: true,
          createdAt: new Date(),
        },
      });

      return {
        message: StaticMessage.FCMTokenStored,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async DeleteFCMToken(userId: number, body: DleteFCMToken) {
    try {
      await new FCMTokenValidator().DeleteFCMToken(body);

      const deletedToken = await prisma.user_fcm_tokens.deleteMany({
        where: {
          user_id: userId,
          device_id: body.device_id,
          is_active: true,
          user: {
            id: userId,
          },
        },
      });

      if (deletedToken.count === 0) {
        throw {
          message: StaticMessage.UserOrFCMTokenNotFound,
          data: null,
          statusCode: 404,
        };
      }

      return {
        message: StaticMessage.FCMTokenDeleted,
        data: null,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
