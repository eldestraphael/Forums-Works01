export interface MemberStatus {
    user_info: {
        uuid: string;
        first_name: string;
        last_name: string;
    };
    meeting_uuid: string;
    meeting_status_uuid: string;
    meeting_type: string;
    status: boolean | null;
}

export interface ForumMembers {
    member_status: MemberStatus[]
}

export interface MeetingStatus {
    meeting_uuid: string;
    meeting_status_uuid: string;
    status: boolean | null;
    forum_uuid: string;
    user_uuid: string;
    meeting_time: string;
    forum_name: string;
    started_at: string;
    user_checkin_time: string;
}