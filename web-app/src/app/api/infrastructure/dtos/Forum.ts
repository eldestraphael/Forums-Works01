export type Forum = {
  forum_name: string;
  meeting_day: string;
  meeting_time: string;
  company_id: string;
};

export type AddForumAttendance = {
  member_uuid: string;
  mcqs: mscOption[];
};

export type UpdateForumAttendance = {
  member_uuid: string;
  mcqs: mscOption[];
};

export type mscOption = {
  mcq_option_uuid: string;
};

export type UpdateForum = {
  forum_name?: string;
  meeting_day?: string;
  meeting_time?: string;
  company_uuid?: string;
  company_id?: number;
  course_uuid?: string;
  chapter_uuid?: string;
  starting_date?: string;
  add_users: string[];
  remove_users: string[];
};
