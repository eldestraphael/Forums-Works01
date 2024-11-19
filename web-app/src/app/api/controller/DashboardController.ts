import prisma from "@/lib/prisma";
import {
  getConditionBasedOnScope,
  getScopeForFilter,
} from "../helpers/getUserScope";
import { StaticMessage } from "../constants/StaticMessages";
import { DashboardMetric } from "./DashboardMetric";
import { DashboardChart } from "./DashboardChart";
import { DashboardPivot } from "./DashboardPivot";
import { CompanyDashboardByCompanyuuidResponse } from "../infrastructure/dtos/CompanyDashboardByCompanyuuidResponse";
import { CalculateAverage } from "../helpers/calculateAverage";
import {
  weightedMomentumBasedOnCompany,
  weightedMomentumBasedOnForum,
} from "./HealthControllet";

export class DashboardController {
  async getDashboardDataBasedOnUserUuid(
    userUuid: string,
    from: string,
    to: string,
    forumQuery: string | null
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          uuid: userUuid,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw {
          message: StaticMessage.UserNotFound,
          statusCode: 404,
          data: null,
        };
      }

      const metricData = await new DashboardMetric().getMetricDataBasedOnUser(
        user.id,
        from,
        to,
        forumQuery
      );

      const chartData = await new DashboardChart().getChartDataBasedOnUser(
        user.id,
        from,
        to,
        forumQuery
      );

      const pivotData = await new DashboardPivot().getPivotDataBasedOnUser(
        user.id,
        from,
        to,
        forumQuery
      );

      return {
        message: StaticMessage.DashboardData,
        data: {
          metrics: metricData,
          charts: chartData,
          pivots: pivotData,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getDashboardData(
    from: string,
    to: string,
    forumQuery: string | null,
    companyQuery: string | null
  ) {
    try {
      const metricData = await new DashboardMetric().getMetricData(
        from,
        to,
        forumQuery,
        companyQuery
      );

      const chartData = await new DashboardChart().getChartData(
        from,
        to,
        forumQuery,
        companyQuery
      );

      const pivotData = await new DashboardPivot().getPivotData(
        from,
        to,
        forumQuery,
        companyQuery
      );

      return {
        message: StaticMessage.DashboardData,
        data: {
          metrics: metricData,
          charts: chartData,
          pivots: pivotData,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getDashboardDataBasedOnCompanyUuid(
    companyUuid: string,
    from: string,
    to: string
  ) {
    try {
      const company = await prisma.company.findFirst({
        where: {
          uuid: companyUuid,
        },
        select: {
          id: true,
          uuid: true,
        },
      });

      if (!company) {
        throw {
          message: StaticMessage.CompanyNotFound,
          statusCode: 404,
          data: null,
        };
      }

      const metricData =
        await new DashboardMetric().getMetricDataBasedOnCompany(
          company.uuid,
          from,
          to
        );

      const chartData = await new DashboardChart().getChartDataBasedOnCompany(
        company.uuid,
        from,
        to
      );

      const pivotData = await new DashboardPivot().getPivotDataBasedOnCompany(
        company.uuid,
        from,
        to
      );

      return {
        message: StaticMessage.DashboardData,
        data: {
          metrics: metricData,
          charts: chartData,
          pivots: pivotData,
        },
      } as CompanyDashboardByCompanyuuidResponse;
    } catch (err: any) {
      throw err;
    }
  }

  async getDashboardDataBasedOnForumUuid(
    forumUuid: string,
    from: string,
    to: string,
    userId?: number,
    companyId?: number,
    isMobileView?: boolean
  ) {
    try {
      const forum = await prisma.forum.findUnique({
        where: {
          uuid: forumUuid,
        },
        select: {
          id: true,
          uuid: true,
        },
      });

      if (!forum) {
        throw {
          message: StaticMessage.ForumNotFound,
          statusCode: 404,
          data: null,
        };
      }

      if (isMobileView) {
        const metricData =
          await new DashboardMetric().getMetricDataBasedOnForum(
            forum.uuid,
            from,
            to
          );

        const chartData = await new DashboardChart().getChartDataBasedOnForum(
          forum.uuid,
          from,
          to,
          isMobileView
        );

        const scores = await prisma.user_per_forum_health_score.findMany({
          where: {
            user: {
              id: userId,
            },
            forum: {
              uuid: forumUuid,
            },
            date: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
          select: {
            score: true,
          },
        });

        return {
          message: StaticMessage.DashboardData,
          data: {
            metrics: metricData,
            charts: chartData,
            momentum: (await weightedMomentumBasedOnForum(forum.id)) * 10,
            momentum_by_company:
              (await weightedMomentumBasedOnCompany(companyId!)) * 10,
          },
        };
      }

      const metricData = await new DashboardMetric().getMetricDataBasedOnForum(
        forum.uuid,
        from,
        to
      );

      const chartData = await new DashboardChart().getChartDataBasedOnForum(
        forum.uuid,
        from,
        to
      );

      const pivotData = await new DashboardPivot().getPivotDataBasedOnForum(
        forum.uuid,
        from,
        to
      );

      return {
        message: StaticMessage.DashboardData,
        data: {
          metrics: metricData,
          charts: chartData,
          pivots: pivotData,
        },
      };
    } catch (err: any) {
      throw err;
    }
  }
}
