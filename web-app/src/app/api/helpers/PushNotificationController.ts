import * as admin from "firebase-admin";
import * as serviceAccount from "./serviceAccountKey.json";
import prisma from "@/lib/prisma";

// Initialize Firebase Admin SDK
const newAdmin = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  },
  `${crypto.randomUUID()}`
);

export class PushNotificationController {
  async sendForumCreatedNotification(forum: any): Promise<void> {
    try {
      const userIds = forum.users_info.map((user: any) => user.id);

      const usersToken = await prisma.user_fcm_tokens.findMany({
        where: {
          user_id: { in: userIds },
          is_active: true,
        },
      });

      for (let userToken of usersToken) {
        const token = userToken.fcm_token;

        const title = `You have been added to the ${forum.forum_name} forum`;
        const body = `You have been added to the forum ${forum.forum_name}, which will occur every ${forum.meeting_day}`;

        if (!token || typeof token !== "string") {
          throw new Error("Invalid FCM token provided");
        }

        const message: admin.messaging.Message = {
          notification: {
            title: title,
            body: body,
          },
          android: {
            notification: {
              sound: "default",
            },
            data: {
              title: title,
              body: body,
            },
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: title,
                  body: body,
                },
                sound: "default",
                badge: 1,
                contentAvailable: true,
              },
            },
          },
          token: token,
        };

        await newAdmin.messaging().send(message);
      }
    } catch (error: any) {
      throw error;
    }
  }
}
