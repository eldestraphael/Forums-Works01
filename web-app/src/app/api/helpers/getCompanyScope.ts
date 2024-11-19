import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { StaticMessage } from "../constants/StaticMessages";

export async function getCompanyScope(scope: string, userId: number) {
  try {
    let whereCondition: any = {
      is_active: true,
    };

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        is_active: true,
      },
      select: {
        company: {
          select: {
            id: true,
          },
        },
        user_forum: {
          select: {
            forum_id: true,
            forum: {
              select: {
                company_id: true,
              },
            },
          },
        },
      },
    });

    switch (scope) {
      case "application":
        break;
      case "company":
        whereCondition.id = user?.company.id;
        break;
      case "user":
        whereCondition.User = {
          some: {
            id: {
              in: [userId],
            },
          },
        };
        break;
      case "forum":
        whereCondition = {
          is_active: true,
          forum: {
            some: {
              user_forum: {
                some: {
                  forum: {
                    id: {
                      in: user?.user_forum.map((item) => item.forum_id),
                    },
                  },
                },
              },
            },
          },
        };
        break;
      default:
        throw {
          statusCode: 401,
          message: StaticMessage.InvalidScopeProvided,
          data: null,
        };
    }

    return whereCondition;
  } catch (error) {
    throw error;
  }
}
