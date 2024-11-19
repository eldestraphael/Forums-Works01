import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { StaticMessage } from "../constants/StaticMessages";

export async function getConditionBasedOnScopeForFilter(
  scope: string,
  userId: number
) {
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
          },
        },
      },
    });

    switch (scope) {
      case "application":
        break;
      case "company":
        whereCondition.company_id = user?.company.id;
        break;
      case "user":
        whereCondition.id = userId;
        break;
      case "forum":
        whereCondition.user_forum = {
          some: {
            forum_id: {
              in: user?.user_forum.map((item) => item.forum_id),
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

export async function getScopeForFilter(userId: number) {
  try {
    const userScope: any = await prisma.$queryRaw`
          SELECT 
              s.keyword AS scope_name
          FROM
              "User" u
          LEFT JOIN
              "role_privileges" rp ON rp.role_uuid = u.role_uuid
          LEFT JOIN
              "scopes" s ON s.uuid = rp.scope_uuid
          WHERE
              u.id = ${userId}
              AND rp.is_active = true
              AND s.is_active = true
          GROUP BY 
              u.id, s.keyword
          ORDER BY
              u.id ASC;
      `;

    return userScope[0].scope_name;
  } catch (error) {
    throw error;
  }
}

export async function getConditionBasedOnScope(
  scope: string,
  userId: number,
  companyId: number
) {
  try {
    let condition: any = Prisma.empty;
    switch (scope) {
      case "application":
        break;
      case "company":
        condition = Prisma.sql`AND u.company_id = ${companyId}`;
        break;
      case "user":
        condition = Prisma.sql`AND u.id = ${userId}`;
        break;
      case "forum":
        condition = Prisma.sql`AND f.id = ANY(SELECT forum_id FROM user_forum WHERE user_id = ${userId})`;
        break;
      default:
        throw {
          statusCode: 401,
          message: StaticMessage.InvalidScopeProvided,
          data: null,
        };
    }

    return condition;
  } catch (error) {
    throw error;
  }
}
