
export interface ModeratorDataContent {
    section_uuid: string;
    type: ModeratorDataType;
    title: string;
    description: string;
    order: number;
    duration: number | null;
    duration_per_person: number | null;
    link: string | null;
}

export interface ModeratorActionStep {
    uuid: string;
    name: string;
    description: string;
}

export interface ModeratorData {
    header: ModeratorDataContent[];
    body: ModeratorDataContent[];
    action_step: ModeratorActionStep;
    footer: ModeratorDataContent[]
}

export type ModeratorDataType = 'once' | 'logical'