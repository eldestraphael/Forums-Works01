export type AddMember = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  company_uuid: string;
  role_uuid: string;
  forums_info: [
    {
      uuid: string;
    }
  ];
};

export type UpdateMember = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  company_uuid?: string;
  company_id?: number;
  role_uuid: string;
  forums_info?: [
    {
      uuid: string;
    }
  ];
};
