import prisma from "@/lib/prisma";

export class DashboardPivot {
  async getPivotDataBasedOnUser(
    userId: number,
    from: string,
    to: string,
    forumQuery: string | null
  ) {
    try {
      let toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1);
      const topFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY SUM(ufh.score) DESC) AS INTEGER) AS ranking,
      MAX(ufh.date) AS date,
      CAST(SUM(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "Forum" AS f ON f.id = ufh.forum_id
      WHERE
        ufh.user_id = ${userId}
      AND 
        (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        ufh.forum_id,
        ufh.date
      ORDER BY
        SUM(ufh.score) DESC
      LIMIT 5;`;

      const bottomFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY SUM(ufh.score) ASC) AS INTEGER) AS ranking,
      MAX(ufh.date) AS date,
      CAST(SUM(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "Forum" AS f ON f.id = ufh.forum_id
      WHERE
        ufh.user_id = ${userId}
      AND 
        (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        ufh.forum_id,
        ufh.date
      ORDER BY
        SUM(ufh.score) ASC
      LIMIT 5;`;

      return [
        {
          title: "Top 5 Health Score",
          description: "A list of the top 5 forum sessions.",
          data: topFiveForumSessions,
        },
        {
          title: "Bottom 5 Health Score",
          description: "A list of the bottom 5 forum sessions.",
          data: bottomFiveForumSessions,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getPivotData(
    from: string,
    to: string,
    forumQuery: string | null,
    companyQuery: string | null
  ) {
    try {
      let toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1);
      const topFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY SUM(ufh.score) DESC) AS INTEGER) AS ranking,
      MAX(ufh.date) AS date,
      CAST(SUM(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_per_forum_health_score WHERE user_id = ufh.user_id)
      JOIN "Company" AS c ON f.company_id = c.id
      WHERE
        (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
      AND
        (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        ufh.forum_id,
        ufh.date
      ORDER BY
        SUM(ufh.score) DESC
      LIMIT 5;`;

      const bottomFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY SUM(ufh.score) ASC) AS INTEGER) AS ranking,
      MAX(ufh.date) AS date,
      CAST(SUM(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_per_forum_health_score WHERE user_id = ufh.user_id)
      JOIN "Company" AS c ON f.company_id = c.id
      WHERE
        (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
      AND
        (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        ufh.forum_id,
        ufh.date
      ORDER BY
        SUM(ufh.score) ASC
      LIMIT 5;`;

      return [
        {
          title: "Top 5 Forum Sessions",
          description: "A list of the top 5 forum sessions.",
          data: topFiveForumSessions,
        },
        {
          title: "Bottom 5 Forum Sessions",
          description: "A list of the bottom 5 forum sessions.",
          data: bottomFiveForumSessions,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getPivotDataBasedOnCompany(
    companyUuid: string,
    from: string,
    to: string
  ) {
    try {
      let toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1);
      const topFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY AVG(ufh.score) DESC) AS INTEGER) AS ranking,
      f.forum_name AS forum_name,
      CAST(AVG(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = ufh.user_id)
      JOIN "Company" AS c ON f.company_id = c.id      
      WHERE c.uuid = ${companyUuid}::uuid
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        f.id,
        f.forum_name
      ORDER BY
        AVG(ufh.score) DESC
      LIMIT 5;`;

      const bottomFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY AVG(ufh.score) ASC) AS INTEGER) AS ranking,
      f.forum_name AS forum_name,
      CAST(AVG(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = ufh.user_id)
      JOIN "Company" AS c ON f.company_id = c.id      
      WHERE c.uuid = ${companyUuid}::uuid
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        f.id,
        f.forum_name
      ORDER BY
        AVG(ufh.score) ASC
      LIMIT 5;`;

      return [
        {
          title: "Top 5 Forum",
          description: "A list of the top 5 forum sessions.",
          data: topFiveForumSessions,
        },
        {
          title: "Bottom 5 Forum",
          description: "A list of the bottom 5 forum sessions.",
          data: bottomFiveForumSessions,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getPivotDataBasedOnForum(forumUuid: string, from: string, to: string) {
    try {
      let toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1);
      const topFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY AVG(ufh.score) DESC) AS INTEGER) AS ranking,
      CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS user_name,
      CAST(AVG(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "User" AS u ON u.id = ufh.user_id
      JOIN 
        "Forum" AS f ON f.id = ufh.forum_id
      WHERE
        f.uuid = ${forumUuid}::uuid
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        u.id,
        user_name
      ORDER BY
        AVG(ufh.score) DESC
      LIMIT 5;`;

      const bottomFiveForumSessions: any = await prisma.$queryRaw`SELECT
      CAST(ROW_NUMBER() OVER (ORDER BY AVG(ufh.score) ASC) AS INTEGER) AS ranking,
      CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS user_name,
      CAST(AVG(ufh.score) AS INTEGER) AS health_score
      FROM
        user_per_forum_health_score ufh
      JOIN 
        "User" AS u ON u.id = ufh.user_id
      JOIN 
        "Forum" AS f ON f.id = ufh.forum_id
      WHERE
        f.uuid = ${forumUuid}::uuid
      AND 
        ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
      GROUP BY
        u.id,
        user_name
      ORDER BY
        AVG(ufh.score) ASC
      LIMIT 5;`;

      return [
        {
          title: "Top 5 Users",
          description: "A list of the top 5 users.",
          data: topFiveForumSessions,
        },
        {
          title: "Bottom 5 Users",
          description: "A list of the bottom 5 users.",
          data: bottomFiveForumSessions,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }
}
