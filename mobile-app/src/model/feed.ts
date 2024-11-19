interface AssetInfo {
  uuid: string;
  name: string;
  url: string;
}

interface PreworkMetaData {
  lesson_uuid?: string;
  status?: number;
  status_percent?: number;
  is_current_lesson?: boolean;
  completion_count: number;
}

export interface Lesson {
  uuid: string;
  name: string;
  asset_type: string;
  is_preview: boolean;
  is_prerequisite: boolean;
  is_discussion_enabled: boolean;
  is_downloadable: boolean;
  is_active: boolean;
  is_current_lesson: boolean;
  asset_info: AssetInfo;
  prework_meta_data: PreworkMetaData;
}

interface CourseInfo {
  uuid: string;
  name: string;
  describe: string;
}

interface ChapterInfo {
  uuid: string;
  name: string;
  describe: string;
}

export interface courseData {
  course_info: CourseInfo;
  chapter_info: ChapterInfo;
  lessons: Lesson[];
}

export interface courseResponse {
  message: string;
  data: courseData;
}


export interface PreworkProps {
  total_tasks: number;
  completed_tasks: number;
  total_time: number;
  completed_time: number;
};

export interface StatusData {
  status: boolean;
  momentum: number;
  prework?: PreworkProps;
  action_step?: {
    completion_status: number[];
  };
  forum_meeting?: {
    next_meeting: string;
  };
}


export interface ActionStepMessage {
  action_step_message: {
    user_info: {
      uuid: string;
      first_name: string;
      last_name: string;
      email: string;
    },
    uuid: string;
    message: string;
    createdAt: string;
    updatedAt: string;
  }
}

export interface ActionStepData {
  message: ActionStepMessage[],
  action_step_info: {
    uuid: string;
    name: string;
    description: string;
  },
  other_user_first_names: string[]
}
