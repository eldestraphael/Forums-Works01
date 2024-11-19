export type ModeratorGuide = {
  section_uuid?: string,
  section_type: SectionType;
  type: Type;
  title?: string;
  description?: string;
  order: number;
  duration?: number;
  duration_per_person?: number;
  link?: string;
  is_deleted?: boolean
};

export enum SectionType {
  header = "header",
  body = "body",
  footer = "footer",
}

export enum Type {
  logical = "logical",
  repeatable = "repeatable",
  once = "once",
}
