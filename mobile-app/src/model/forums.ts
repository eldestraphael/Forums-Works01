export interface ForumInfo {
    uuid: string;
    forum_name: string;
    total_users: number;
    is_active: boolean;
    createdAt: string;
    company_info: {
        uuid: string;
        company_name: string;
    };
    health: number;
}

export interface AllForums {
    forum_info: ForumInfo;
}