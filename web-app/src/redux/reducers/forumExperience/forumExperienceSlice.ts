import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setCookie } from "cookies-next";

// Define the async thunk for fetching user data
export const fetchMeUpcomingForumUUID = createAsyncThunk('forumExperience/fetchMeUpcomingForumUUID', async () => {
    try {
        const response = await fetch("/api/user/me", {
            method: 'GET',
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });
        const me_data = await response.json();
        if (response.status === 200) {
            setCookie("upcoming_forum_uuid", me_data?.data?.upcoming_forum?.uuid || null, {});
            return me_data?.data;
        } else {
            throw new Error(me_data.message);
        }
    } catch (error) {
        // console.log("Me API Error", error);
        throw error;
    }
});

// Define the async thunk for posting tracking data
export const trackingPostAPI = createAsyncThunk(
    'forumExperience/trackingPostAPI',
    async ({ forum_uuid, lesson_uuid, status, status_percent, is_current_lesson }: any, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/forumexperience/${forum_uuid}/prework`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lesson_uuid,
                    status,
                    status_percent,
                    is_current_lesson
                })
            });
            const trackingPostAPIData = await response.json();
            if (response.status === 200) {
                return trackingPostAPIData?.data;
            } else {
                throw new Error(trackingPostAPIData.message);
            }
        } catch (error: any) {
            // console.log("Tracking Post API Error", error);
            return rejectWithValue(error.message);
        }
    }
);

// Define the state type
interface ForumExperienceState {
    pdf_url: string;
    image_url: string;
    status: number;
    total_status: number;
    completed_percent: number;
    current_lession_uuid: string;
    me_api_data: any | null;
    loading: boolean;
    error: string | null;
    trackingData: any | null;
    trackingLoading: boolean;
    trackingError: any | null;
    is_current_lesson_status: boolean;
    current_forum_uuid: string;
    zoom_current_forum_name: string;
    zoom_current_chapter_uuid:string;
    zoom_current_meeting_time:string;
    zoom_Data: any;
}

const initialState: ForumExperienceState = {
    pdf_url: '',
    image_url: '',
    status: 0,
    total_status: 0,
    completed_percent: 0,
    current_lession_uuid: '',
    me_api_data: null,
    loading: false,
    error: null,
    trackingData: null,
    trackingLoading: false,
    trackingError: null,
    is_current_lesson_status: false,
    current_forum_uuid: '',
    zoom_current_forum_name: "",
    zoom_current_chapter_uuid:"",
    zoom_current_meeting_time:"",
    zoom_Data: null

};

export const forumExperienceSlice = createSlice({
    name: "forumExperience",
    initialState,
    reducers: {
        setPdfUrl: (state, action) => {
            state.pdf_url = action.payload;
        },
        setImageUrl: (state, action) => {
            state.image_url = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setTotalStatus: (state, action) => {
            state.total_status = action.payload;
        },
        setCompletedPercent: (state) => {
            state.completed_percent = (state.status / state.total_status) * 100;
        },
        setDirectCompletedPercentValue: (state, action) => {
            state.completed_percent = action.payload;
        },
        setCurrentLessionUUID: (state, action) => {
            state.current_lession_uuid = action.payload;
        },
        setCleanUpState: (state) => {
            state.status = 0;
            state.total_status = 0;
            state.completed_percent = 0;
        },
        setCurrentLesonStatus: (state, action) => {
            state.is_current_lesson_status = action.payload;
        },
        setCurrentForumUUID: (state, action) => {
            state.current_forum_uuid = action.payload;
        },
        setZoomCurrentForumName: (state, action) => {
            state.zoom_current_forum_name = action.payload;
        },
        setZoomCurrentChapterUUID: (state, action) => {
            state.zoom_current_chapter_uuid = action.payload;
        },
        setZoomMeetingTime: (state, action) => {
            state.zoom_current_meeting_time = action.payload;
        },
        setZoomDataFromRedux: (state, action) => {
            state.zoom_Data = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMeUpcomingForumUUID.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMeUpcomingForumUUID.fulfilled, (state, action) => {
                state.loading = false;
                state.me_api_data = action.payload;
            })
            .addCase(fetchMeUpcomingForumUUID.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Something went wrong';
            })
            .addCase(trackingPostAPI.pending, (state) => {
                state.trackingLoading = true;
                state.trackingError = null;
            })
            .addCase(trackingPostAPI.fulfilled, (state, action) => {
                state.trackingLoading = false;
                state.trackingData = action.payload;
            })
            .addCase(trackingPostAPI.rejected, (state, action) => {
                state.trackingLoading = false;
                state.trackingError = action.payload || 'Something went wrong';
            });
    },
});

export const {
    setPdfUrl,
    setImageUrl,
    setStatus,
    setTotalStatus,
    setCompletedPercent,
    setDirectCompletedPercentValue,
    setCurrentLessionUUID,
    setCleanUpState,
    setCurrentLesonStatus,
    setCurrentForumUUID,
    setZoomCurrentForumName,
    setZoomCurrentChapterUUID,
    setZoomMeetingTime,
    setZoomDataFromRedux
} = forumExperienceSlice.actions;

export default forumExperienceSlice.reducer;
