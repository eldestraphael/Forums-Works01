export type CompanyInfoByCompanyUuidResponse = {
  message: string;
  data: {
    company_info: {
      id: number;
      uuid: string;
      company_name: string;
      createdAt: Date;
    };
  };
};
