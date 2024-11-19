export interface DashboardRes {
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
        data: { name: string; count: number }[];
    }[];
    momentum: number; //hardcode
    momentum_by_company: number; //hardcode
}