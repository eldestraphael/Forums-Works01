import prisma from "@/lib/prisma";

export class DashboardChart {
  async getChartDataBasedOnUser(
    userId: number,
    from: string,
    to: string,
    forumQuery: string | null
  ) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const attendanceDistribution: any = await prisma.$queryRaw`SELECT 
        hmo.mcq_option_description AS name,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'attendance' 
            AND uf.user_id = ${userId}
            AND (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
            AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            hmo.mcq_option_description;`;

      const attendanceTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(uf.date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'attendance'
            AND uf.user_id = ${userId}
            AND (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
            AND uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(uf.date), hmo.mcq_option_description
        ORDER BY 
            DATE(uf.date);`;

      const preWorkTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'pre_work'
        AND
            uf.user_id = ${userId}
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(uf.date), hmo.mcq_option_description
        ORDER BY 
            DATE(uf.date);`;

      const actionStepTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'action_steps'
        AND
            uf.user_id = ${userId}
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(uf.date), hmo.mcq_option_description
        ORDER BY 
            DATE(uf.date);`;

      return [
        {
          title: "Attendance",
          description: "A pie chart showing the distribution of users' attendance in the forum, categorizing users based on their attendance levels.",
          type: "pie_chart",
          data: attendanceDistribution,
        },
        {
          title: "Attendance",
          description: "A stacked bar chart displaying the trend of users' attendance over time in the forum, highlighting patterns and changes.",
          type: "stacked_bar",
          data: attendanceTrendOverTime,
        },
        {
          title: "Pre Work",
          description: "A stacked bar chart illustrating the trend of users' prework completion over time in the forum, showing how consistently users completed prework tasks.",
          type: "stacked_bar",
          data: preWorkTrendOverTime,
        },
        {
          title: "Action Step",
          description: "A stacked bar chart representing the trend of users' completion of action steps over time in the forum, tracking user engagement with assigned tasks.",
          type: "stacked_bar",
          data: actionStepTrendOverTime,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getChartData(
    from: string,
    to: string,
    forumQuery: string | null,
    companyQuery: string | null
  ) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const attendanceDistribution: any = await prisma.$queryRaw`SELECT 
        hmo.mcq_option_description AS name,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'attendance' 
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND
            (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            hmo.mcq_option_description;`;

      const attendanceTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'attendance'
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND
            (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      const preWorkTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'pre_work'
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND
            (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      const actionStepTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'action_steps'
        AND 
            (${!forumQuery} OR f.uuid = ANY(STRING_TO_ARRAY(${forumQuery}, ',')::UUID[]))
        AND
            (${!companyQuery} OR c.uuid = ANY(STRING_TO_ARRAY(${companyQuery}, ',')::UUID[]))
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      return [
        {
          title: "Attendance",
          description: "A pie chart showing the distribution of users' attendance in the forum, categorizing users based on their attendance levels.",
          type: "pie_chart",
          data: attendanceDistribution,
        },
        {
          title: "Attendance",
          description: "A stacked bar chart displaying the trend of users' attendance over time in the forum, highlighting patterns and changes.",
          type: "stacked_bar",
          data: attendanceTrendOverTime,
        },
        {
          title: "Pre Work",
          description: "A stacked bar chart illustrating the trend of users' prework completion over time in the forum, showing how consistently users completed prework tasks.",
          type: "stacked_bar",
          data: preWorkTrendOverTime,
        },
        {
          title: "Action Step",
          description: "A stacked bar chart representing the trend of users' completion of action steps over time in the forum, tracking user engagement with assigned tasks.",
          type: "stacked_bar",
          data: actionStepTrendOverTime,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getChartDataBasedOnCompany(
    companyUuid: string,
    from: string,
    to: string
  ) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const attendanceDistribution: any = await prisma.$queryRaw`SELECT 
        hmo.mcq_option_description AS name,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'attendance' 
        AND
            c.uuid = ${companyUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            hmo.mcq_option_description;`;

      const attendanceTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'attendance'
        AND
            c.uuid = ${companyUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      const preWorkTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'pre_work'
        AND
            c.uuid = ${companyUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      const actionStepTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = ANY(SELECT forum_id FROM user_forum_healths WHERE user_id = uf.user_id)
        JOIN "Company" AS c ON f.company_id = c.id
        WHERE 
            hfmc.keyword = 'action_steps'
        AND
            c.uuid = ${companyUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      return [
        {
          title: "Attendance",
          description: "A pie chart showing the distribution of users' attendance in the forum across the company, categorizing users based on their attendance levels.",
          type: "pie_chart",
          data: attendanceDistribution,
        },
        {
          title: "Attendance",
          description: "A stacked bar chart displaying the trend of users' attendance over time in the forum within the company, highlighting patterns and changes.",
          type: "stacked_bar",
          data: attendanceTrendOverTime,
        },
        {
          title: "Pre Work",
          description: "A stacked bar chart illustrating the trend of users' prework completion over time in the forum within the company, showing how consistently users completed prework tasks.",
          type: "stacked_bar",
          data: preWorkTrendOverTime,
        },
        {
          title: "Action Step",
          description: "A stacked bar chart representing the trend of users' completion of action steps over time in the forum within the company, tracking user engagement with assigned tasks.",
          type: "stacked_bar",
          data: actionStepTrendOverTime,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }

  async getChartDataBasedOnForum(
    forumUuid: string,
    from: string,
    to: string,
    mobileView?: boolean
  ) {
    try {
      let toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const attendanceDistribution: any = await prisma.$queryRaw`SELECT 
        hmo.mcq_option_description AS name,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'attendance' 
        AND
            f.uuid = ${forumUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            hmo.mcq_option_description;`;

      if (mobileView) {
        return [
          {
            title: "Attendance",
            description: "",
            type: "pie_chart",
            data: attendanceDistribution,
          },
        ];
      }

      const attendanceTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'attendance'
        AND
            f.uuid = ${forumUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      const preWorkTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'pre_work'
        AND
            f.uuid = ${forumUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      const actionStepTrendOverTime: any = await prisma.$queryRaw`SELECT 
        DATE(date) AS date,
        hmo.mcq_option_description AS attendance_status,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM 
            user_forum_healths uf
        JOIN 
            health_mcq_options hmo ON uf.health_mcq_option_id = hmo.id
        JOIN 
            forum_health_mcqs hfmc ON hmo.forum_health_mcq_id = hfmc.id
        JOIN 
            "Forum" AS f ON f.id = uf.forum_id
        WHERE 
            hfmc.keyword = 'action_steps'
        AND
            f.uuid = ${forumUuid}::uuid
        AND 
            uf.date BETWEEN ${new Date(from)} AND ${new Date(toDate)}
        GROUP BY 
            DATE(date), hmo.mcq_option_description
        ORDER BY 
            DATE(date);`;

      return [
        {
          title: "Attendance",
          description: "A pie chart showing the distribution of users' attendance in the forum, categorizing users based on their attendance levels.",
          type: "pie_chart",
          data: attendanceDistribution,
        },
        {
          title: "Attendance",
          description: "A stacked bar chart displaying the trend of users' attendance over time in the forum, highlighting participation patterns and changes.",
          type: "stacked_bar",
          data: attendanceTrendOverTime,
        },
        {
          title: "Pre Work",
          description: "A stacked bar chart illustrating the trend of users' prework completion over time in the forum, showing how consistently users completed their prework tasks.",
          type: "stacked_bar",
          data: preWorkTrendOverTime,
        },
        {
          title: "Action Step",
          description: "A stacked bar chart representing the trend of users' completion of action steps over time in the forum, tracking their engagement with assigned tasks.",
          type: "stacked_bar",
          data: actionStepTrendOverTime,
        },
      ];
    } catch (err: any) {
      throw err;
    }
  }
}
