export type CompanyDashboardByCompanyuuidResponse = {
  message: string;
  data: {
    metrics: {
      title: string;
      description: string;
      value: number;
      unit: string;
    }[];
    charts: {
      title: string;
      description: string;
      type: string;
      data: {
        name?: string;
        date?: string;
        attendance_status?: string;
        count: number;
        health_score?: number;
        ranking?: number;
      }[];
    }[];
    pivots: {
      title: string;
      description: string;
      data: {
        ranking: number;
        date: string;
        health_score: number;
      }[];
    }[];
  };
};
