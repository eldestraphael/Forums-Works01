export type ActionSteps = {
  chapter_uuid: string;
  name: string;
  description: string;
  times_per_year: number;
};

export type UpdateActionSteps = {
  chapter_uuid?: string;
  name?: string;
  description?: string;
  times_per_year?: number;
};