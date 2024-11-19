export type Chapter = {
  name: string;
  description?: string;
  course_uuid: string;
  is_active?: boolean;
};

export type UpdateChapter = {
  name?: string;
  description?: string;
  course_uuid: string;
  is_active?: boolean;
};
