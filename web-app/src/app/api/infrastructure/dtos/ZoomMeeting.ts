export type JoinMeeting = {
  type: MeetingType;
  device_id?: string;
};

export type LeaveMeeting = {
  type: MeetingType;
  meeting_uuid: string;
  meeting_status_uuid: string;
};

export enum MeetingType {
  zoom = "zoom",
  bluetooth = "bluetooth"
}
