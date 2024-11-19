import prisma from "@/lib/prisma";
import { addDays, subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { EmailController } from "../helpers/emailService";
import { StaticMessage } from "../constants/StaticMessages";

export async function getUserWeeklyReport() {
  try {
    // Get the current date
    const currentDate = new Date();

    // Get the next day
    const nextDay = addDays(currentDate, 1);
    const formattedNextDay = format(nextDay, "EEEE");

    let result: any = await prisma.$queryRaw`SELECT
        f.id as forum_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        f.forum_name,
        f.meeting_day,
        f.meeting_time,
        COALESCE(ROUND(AVG(upfhs.score), 2)*10, 0) as avg_score
    FROM
        "Forum" f
    LEFT JOIN user_forum uf ON f.id = uf.forum_id
    LEFT JOIN "User" u ON uf.user_id = u.id
    LEFT JOIN user_per_forum_health_score upfhs ON f.id = upfhs.forum_id
        AND u.id = upfhs.user_id
    WHERE
        f.is_active = TRUE
        AND f.meeting_day = ${formattedNextDay}
        AND u.is_active = TRUE
    GROUP BY f.id,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        f.forum_name,
        f.meeting_day,
        f.meeting_time
    ORDER BY f.id ASC, u.id ASC;`;

    if (result.length === 0) {
      return {
        message: StaticMessage.NoMeeting,
        data: null,
      };
    }

    await new EmailController().sendUserWeeklyReportEmail(result);

    return {
      message: StaticMessage.EmailSent,
      data: null,
    };
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export async function getCompanyMonthlyReport() {
  try {
    // Get the current date
    const currentDate = new Date();

    // Subtract one month to get the previous month
    const previousMonthDate = subMonths(currentDate, 1);

    // Get the first date of the previous month
    const firstDateOfPreviousMonth = startOfMonth(previousMonthDate);

    // Get the first date of the current month
    const firstDateOfCurrentMonth = startOfMonth(currentDate);

    let formattedFirstDate = format(firstDateOfPreviousMonth, "yyyy-MM-dd");
    let formattedLastDate = format(firstDateOfCurrentMonth, "yyyy-MM-dd");

    let result: any = await prisma.$queryRaw`WITH CompanyScores AS (
          SELECT
              c.id AS company_id,
              c.company_name AS company_name,
              COALESCE(ROUND(AVG(ufh.score), 2) * 10, 0) AS avg_score
          FROM
              user_per_forum_health_score ufh
          JOIN
              "Forum" AS f ON f.id = ufh.forum_id
          JOIN
              "Company" AS c ON f.company_id = c.id
          WHERE
              ufh.date BETWEEN ${new Date(formattedFirstDate)} AND ${new Date(
      formattedLastDate
    )}
          GROUP BY
              c.id, c.company_name
      ),
      RankedForums AS (
          SELECT
              f.id AS forum_id,
              f.forum_name AS forum_name,
              c.id AS company_id,
              c.company_name,
              AVG(ufh.score) AS total_score,
              ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY SUM(ufh.score) DESC) AS top_ranking,
              ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY SUM(ufh.score) ASC) AS bottom_ranking
          FROM
              user_per_forum_health_score ufh
          JOIN
              "Forum" AS f ON f.id = ufh.forum_id
          JOIN
              "Company" AS c ON f.company_id = c.id
          WHERE
              ufh.date BETWEEN ${new Date(formattedFirstDate)} AND ${new Date(
      formattedLastDate
    )}
          GROUP BY
              f.id, c.id, c.company_name, f.forum_name
      ),
      TopForums AS (
          SELECT
              forum_id,
              forum_name,
              company_id,
              total_score
          FROM
              RankedForums
          WHERE
              top_ranking <= 5
      ),
      BottomForums AS (
          SELECT
              forum_id,
              forum_name,
              company_id,
              total_score
          FROM
              RankedForums
          WHERE
              bottom_ranking <= 5
      ),
      ClientAdmins AS (
          SELECT
              c.id AS company_id,
              json_agg(u.email) AS admin_emails
          FROM
              "Company" AS c
          JOIN
              "User" AS u ON u.company_id = c.id
          JOIN
              roles AS r ON u.role_uuid = r.uuid
          WHERE
              r.name = 'Client Admin'
          GROUP BY
              c.id
      )
      SELECT
          cs.company_id,
          cs.company_name,
          cs.avg_score,
          (
              SELECT json_agg(top_forum)
              FROM (
                  SELECT
                      forum_name,
                      total_score
                  FROM
                      TopForums tf
                  WHERE
                      tf.company_id = cs.company_id
              ) top_forum
          ) AS top_forums,
          (
              SELECT json_agg(bottom_forum)
              FROM (
                  SELECT
                      forum_name,
                      total_score
                  FROM
                      BottomForums bf
                  WHERE
                      bf.company_id = cs.company_id
              ) bottom_forum
          ) AS bottom_forums,
          ca.admin_emails
      FROM
          CompanyScores cs
      LEFT JOIN
          ClientAdmins ca ON cs.company_id = ca.company_id
      ORDER BY
          cs.company_id;`;

    if (result.length === 0) {
      return {
        message: StaticMessage.NoReportFound,
        data: null,
      };
    }

    await new EmailController().sendCompanyMonthlyReportEmail(result);

    return {
      message: StaticMessage.EmailSent,
      data: null,
    };
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export async function weightedMomentumBasedOnForum(forumId: number) {
  try {
    let score: any =
      await prisma.$queryRaw`select AVG(momentum) AS consolidated_momentum from forum_momentum where forum_id = ${forumId};`;
    return parseFloat(
      parseFloat(score[0]?.consolidated_momentum || 0).toFixed(2)
    );
  } catch (err: any) {
    throw err;
  }
}

export async function weightedMomentumBasedOnUser(userId: number) {
  try {
    let score: any =
      await prisma.$queryRaw`select AVG(momentum) AS consolidated_momentum from forum_momentum where user_id = ${userId};`;
    return parseFloat(
      parseFloat(score[0]?.consolidated_momentum || 0).toFixed(2)
    );
  } catch (err: any) {
    throw err;
  }
}

export async function weightedMomentumBasedOnCompany(companyId: number) {
  try {
    let score: any =
      await prisma.$queryRaw`select AVG(momentum) AS consolidated_momentum from forum_momentum where company_id = ${companyId};`;
    return parseFloat(
      parseFloat(score[0]?.consolidated_momentum || 0).toFixed(2)
    );
  } catch (err: any) {
    throw err;
  }
}
