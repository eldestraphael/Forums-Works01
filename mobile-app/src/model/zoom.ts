export interface JoinMeetingRes {
  meeting_uuid: string; // Unique per meeting
  meeting_status_uuid: string; // Unique per check-in, a single user can have many check-ins
  token: string; // Will be retuened only if type is "zoom"
}


export interface ZoomConfig {
    token: string;
    sessionName: string;
    userName: string;
  }