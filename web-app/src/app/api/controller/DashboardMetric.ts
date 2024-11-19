import prisma from "@/lib/prisma";

export class DashboardMetric {
  async getMetricDataBasedOnUser(
    userId: number,
    from: string,
    to: string,
    forumQuery: string | null
  ) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const total_sessions: any =
        await prisma.$queryRaw`SELECT SUM(total_sessions) AS total_sessions
        FROM (
            SELECT COUNT(DISTINCT DATE(ufh.date)) AS total_sessions
            FROM "user_forum_healths" AS ufh
            JOIN "Forum" AS f ON f.id = ufh.forum_id
            WHERE ufh.user_id = ${userId}
            AND (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
            AND ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
            GROUP BY f.id
        ) AS subquery;`;

      const on_time: any = await prisma.$queryRaw`SELECT 
        COALESCE(ROUND((
            SUM(CASE WHEN hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ufh.id), 0)
        ), 2), 0) AS on_time_percentage
        FROM 
            user_forum_healths ufh
        JOIN 
            "Forum" f ON ufh.forum_id = f.id
        JOIN 
            health_mcq_options hmo ON ufh.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs fhm ON hmo.forum_health_mcq_id = fhm.id
        WHERE 
          ufh.user_id = ${userId}
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND fhm.keyword = 'attendance'
        AND ufh.is_active = true
        AND ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const pre_work: any = await prisma.$queryRaw`SELECT 
        COALESCE(ROUND((
            SUM(CASE WHEN hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ufh.id), 0)
        ), 2), 0) AS successful_prework_percentage
        FROM 
            user_forum_healths ufh
        JOIN 
            "Forum" f ON ufh.forum_id = f.id
        JOIN 
            health_mcq_options hmo ON ufh.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs fhm ON hmo.forum_health_mcq_id = fhm.id
        WHERE 
          ufh.user_id = ${userId}
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND fhm.keyword = 'pre_work'
        AND ufh.is_active = true
        AND ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const action_step: any = await prisma.$queryRaw`SELECT
      ROUND(
        (SUM(ufh.score)/(5*COUNT(*))*100)
        , 2) as successful_action_steps_percentage
        FROM
            user_forum_healths ufh
        JOIN
            "Forum" AS f ON f.id = ufh.forum_id
        JOIN
            health_mcq_options hmo ON ufh.health_mcq_option_id = hmo.id
        JOIN
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE 
            ufh.health_mcq_option_id >= 99930 
			  AND 
            ufh.health_mcq_option_id <= 99935 
        AND
            ufh.user_id = ${userId}
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND ufh.is_active = true
        AND ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      return [
        {
          title: "Total No. Of Sessions",
          description:
            "The total number of sessions the user attended during the forum.",
          value: Number(total_sessions[0].total_sessions),
          unit: "",
        },
        {
          title: "On Time",
          description:
            "Percentage of sessions where the user attended meetings on time.",
          value: Number(on_time[0].on_time_percentage),
          unit: "%",
        },
        {
          title: "Successful Prework",
          description:
            "Percentage of sessions where the user completed the prework successfully.",
          value: Number(pre_work[0].successful_prework_percentage),
          unit: "%",
        },
        {
          title: "Successful Action Steps",
          description:
            "Percentage of sessions where the user completed the action steps successfully.",
          value: Number(action_step[0].successful_action_steps_percentage),
          unit: "%",
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getMetricData(
    from: string,
    to: string,
    forumQuery: string | null,
    companyQuery: string | null
  ) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const total_sessions: any =
        await prisma.$queryRaw`SELECT CAST(COUNT(DISTINCT DATE(ufh.date)) AS INTEGER) AS total_sessions
        FROM "user_forum_healths" AS ufh
        JOIN "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = ufh.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const on_time: any = await prisma.$queryRaw`SELECT 
    ROUND(
        (SUM(CASE WHEN hfmc.keyword = 'attendance' AND hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT DATE(uf.date)),
        2
        ) AS on_time_percentage
        FROM 
            user_forum_healths uf
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND 
            (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const pre_work: any = await prisma.$queryRaw`SELECT 
        ROUND(
            (SUM(CASE WHEN hfmc.keyword = 'pre_work' AND hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0) / 
            COUNT(DISTINCT DATE(uf.date)),
            2
        ) AS successful_prework_percentage
        FROM 
            user_forum_healths uf
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND
            (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const action_step: any = await prisma.$queryRaw`SELECT
      ROUND(
        (SUM(uf.score)/(5*COUNT(*))*100)
        , 2) as successful_action_steps_percentage
        FROM
            user_forum_healths uf
        JOIN
            "Forum" AS f ON f.id = uf.forum_id
        JOIN "Company" AS c ON f.company_id = c.id
        JOIN
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE
            uf.health_mcq_option_id >= 99930 
			  AND 
            uf.health_mcq_option_id <= 99935 
        AND
	          (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND
            (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      return [
        {
          title: "Total No. Of Sessions",
          description: "The total number of sessions the user attended during the forum.",
          value: Number(total_sessions[0].total_sessions),
          unit: "",
        },
        {
          title: "On Time",
          description: "Percentage of sessions where the user attended meetings on time.",
          value: Number(on_time[0].on_time_percentage),
          unit: "%",
        },
        {
          title: "Successful Prework",
          description: "Percentage of sessions where the user completed the prework successfully.",
          value: Number(pre_work[0].successful_prework_percentage),
          unit: "%",
        },
        {
          title: "Successful Action Steps",
          description: "Percentage of sessions where the user completed the action steps successfully.",
          value: Number(action_step[0].successful_action_steps_percentage),
          unit: "%",
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getMetricDataBasedOnCompany(
    companyUuid: string,
    from: string,
    to: string
  ) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const total_sessions: any = await prisma.$queryRaw`
      SELECT SUM(session_count) AS total_sessions
      FROM (
          SELECT f.id, COUNT(DISTINCT DATE(ufh.date)) AS session_count
          FROM "user_forum_healths" AS ufh
          JOIN "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = ufh.user_id)
          JOIN "Company" AS c ON f.company_id = c.id
          WHERE c.uuid =  ${companyUuid}::uuid
          AND ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
          GROUP BY f.id
      ) AS subquery`;

      const on_time: any = await prisma.$queryRaw`
      SELECT ROUND(
          (SUM(CASE WHEN hfmc.keyword = 'attendance' AND hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
          2
          ) AS on_time_percentage
          FROM 
              user_forum_healths uf
          JOIN 
              "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
          JOIN "Company" AS c ON f.company_id = c.id
          JOIN 
              health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
          JOIN 
              forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
          WHERE
              c.uuid = ${companyUuid}::uuid
          AND hfmc.keyword = 'attendance'
          AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};
    `;

      const pre_work: any = await prisma.$queryRaw`
      SELECT 
          ROUND(
              (SUM(CASE WHEN hfmc.keyword = 'pre_work' AND hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0) / 
              COUNT(*),
              2
          ) AS successful_prework_percentage
          FROM 
              user_forum_healths uf
          JOIN 
              "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
          JOIN "Company" AS c ON f.company_id = c.id
          JOIN 
              health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
          JOIN 
              forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
          WHERE
              c.uuid = ${companyUuid}::uuid
          AND hfmc.keyword = 'pre_work'
          AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};
    `;

      const action_step: any = await prisma.$queryRaw`SELECT
      ROUND(
        (SUM(uf.score)/(5*COUNT(*))*100)
        , 2) as successful_action_steps_percentage
        FROM
            user_forum_healths uf
        JOIN
            "Forum" AS f ON f.id = uf.forum_id
        JOIN "Company" AS c ON f.company_id = c.id
        JOIN
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE
            uf.health_mcq_option_id >= 99930 
			  AND 
            uf.health_mcq_option_id <= 99935 
        AND
            c.uuid = ${companyUuid}::uuid
        AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      return [
        {
          title: "Total No. Of Sessions",
          description: "The total number of sessions attended by users within the company during the forum.",
          value: Number(total_sessions[0].total_sessions),
          unit: "",
        },
        {
          title: "On Time",
          description: "Percentage of sessions where users attended meetings on time.",
          value: Number(on_time[0].on_time_percentage),
          unit: "%",
        },
        {
          title: "Successful Prework",
          description: "Percentage of sessions where users successfully completed the prework.",
          value: Number(pre_work[0].successful_prework_percentage),
          unit: "%",
        },
        {
          title: "Successful Action Steps",
          description: "Percentage of sessions where users successfully completed the assigned action steps.",
          value: Number(action_step[0].successful_action_steps_percentage),
          unit: "%",
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getMetricDataBasedOnForum(forumUuid: string, from: string, to: string) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const total_sessions: any =
        await prisma.$queryRaw`SELECT CAST(COUNT(DISTINCT DATE(ufh.date)) AS INTEGER) AS total_sessions
        FROM "user_forum_healths" AS ufh
        JOIN "Forum" AS f ON f.id = ufh.forum_id
        WHERE f.uuid = ${forumUuid}::uuid
        AND ufh.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const on_time: any = await prisma.$queryRaw`SELECT 
    ROUND(
        (SUM(CASE WHEN hfmc.keyword = 'attendance' AND hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
        2
        ) AS on_time_percentage
        FROM 
            user_forum_healths uf
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE
            f.uuid = ${forumUuid}::uuid
        AND hfmc.keyword = 'attendance'
        AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const pre_work: any = await prisma.$queryRaw`SELECT 
        ROUND(
            (SUM(CASE WHEN hfmc.keyword = 'pre_work' AND hmo.mcq_option = 'Yes' THEN 1 ELSE 0 END) * 100.0) / 
            COUNT(*),
            2
        ) AS successful_prework_percentage
        FROM 
            user_forum_healths uf
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE
	        f.uuid = ${forumUuid}::uuid
        AND hfmc.keyword = 'pre_work'
        AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      const action_step: any = await prisma.$queryRaw`SELECT
      ROUND(
        (SUM(uf.score)/(5*COUNT(*))*100)
        , 2) as successful_action_steps_percentage
        FROM
            user_forum_healths uf
        JOIN
            "Forum" AS f ON f.id = uf.forum_id
        JOIN
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        WHERE
            uf.health_mcq_option_id >= 99930 
			  AND 
            uf.health_mcq_option_id <= 99935 
        AND
            f.uuid = ${forumUuid}::uuid
        AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)};`;

      return [
        {
          title: "Total No. Of Sessions",
          description: "The total number of sessions attended by users in the forum.",
          value: Number(total_sessions[0].total_sessions),
          unit: "",
        },
        {
          title: "On Time",
          description: "Percentage of sessions where users attended meetings on time in the forum.",
          value: Number(on_time[0].on_time_percentage),
          unit: "%",
        },
        {
          title: "Successful Prework",
          description: "Percentage of sessions where users successfully completed the prework in the forum.",
          value: Number(pre_work[0].successful_prework_percentage),
          unit: "%",
        },
        {
          title: "Successful Action Steps",
          description: "Percentage of sessions where users successfully completed the action steps in the forum.",
          value: Number(action_step[0].successful_action_steps_percentage),
          unit: "%",
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }
}
