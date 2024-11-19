export type CompanyInfo = {
  id: number
  uuid: string;
  company_name: string;
  total_users: number;
  total_forums: number;
  forum_health: number;
  is_active: boolean;
  createdAt: string;
};

export type CompanyListItem = {
  company_info: CompanyInfo;
};

export type CompanyListResponse = {
  message: string;
  data: CompanyListItem[];
  page_meta: {
    current: number;
    total: number;
    data_per_page: number;
  };
};
