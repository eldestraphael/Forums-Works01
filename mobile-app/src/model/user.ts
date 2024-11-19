interface Forum {
  forum_name: string;
  id: number;
  meeting_day: string;
  meeting_time: string;
  uuid: string;
}

interface UserInfo {
  company_info: {
    company_name: string;
    id: number;
    uuid: string;
  };
  createdAt: string;
  email: string;
  first_name: string;
  id: number;
  job_title: string;
  last_name: string;
  phone: string;
  updatedAt: string;
  uuid: string;
}

export interface ForumuserData {
  data: {
    forums_info: Forum[][];
    upcoming_forum: {
      forum_name: string;
      uuid: string;
    };
    user_info: UserInfo;
  };
  message: string;
}
