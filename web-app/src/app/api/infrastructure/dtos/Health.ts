export type UpdateHealth = {
  new_answers: NewAnswer[];
  old_answers: OldAnswer[];
};

type OldAnswer = {
  mcq_option_uuid: string;
};

type NewAnswer = {
  mcq_option_uuid: string;
};
