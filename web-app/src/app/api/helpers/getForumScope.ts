import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { StaticMessage } from "../constants/StaticMessages";

export async function getConditionBasedOnForumForFilter(
  scope: string,
  userId: number,
  roleName?: string
) {
  try {
    let whereCondition: any;

    if (roleName === "Super Admin" || roleName === "Client Admin") {
      whereCondition = {
        OR: [{ is_active: true }, { is_active: false }],
      };
    } else {
      whereCondition = {
        is_active: true,
      };
    }

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
        whereCondition.user_forum = {
          some: {
            user_id: userId,
          },
        };

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

export async function getConditionBasedOnScopeForForum(
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
        condition = Prisma.sql`AND c.id = ${companyId}`;
        break;
      case "user":
        condition = Prisma.sql`AND f.id = ANY(SELECT forum_id FROM user_forum WHERE user_id = ${userId})`;
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

export async function getConditionBasedOnScopeForSurveys(
  scope: string,
  forumId: number
) {
  try {
    let condition: any = {};

    switch (scope) {
      case "application":
        // No additional condition needed for 'application' scope
        break;

      case "company":
        // Retrieve the companyId associated with the provided forumId
        const forum = await prisma.forum.findUnique({
          where: { id: forumId },
          select: { company_id: true },
        });

        // Handle the case where the forum may not be found
        if (!forum) {
          throw new Error("Forum not found");
        }

        // Retrieve all forum IDs associated with the same companyId
        const companyForumIds = await prisma.forum.findMany({
          where: { company_id: forum.company_id },
          select: { id: true },
        });

        // Build the condition to filter based on the company forum IDs
        condition = {
          forum_id: {
            in: companyForumIds.map(forum => forum.id),
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

    return condition;
  } catch (error) {
    throw error;
  }
}

export async function getConditionBasedOnScopeForSurveysSql(
  scope: string,
  forumId: number
) {
  try {
    let condition: any = Prisma.empty;

    switch (scope) {
      case "application":
        break;
      case "company":
        condition = Prisma.sql`
          AND fc.forum_id IN (
            SELECT id FROM "Forum" WHERE company_id = (
              SELECT company_id FROM "Forum" WHERE id = ${forumId}
            )
          )
        `;
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
