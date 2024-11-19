import { configureStore } from '@reduxjs/toolkit';
import forumNameReducer from "@/redux/reducers/members/memberSlice";
import userReducer from '@/redux/reducers/users/userSlice';
import sidebarReducer from '@/redux/reducers/sidebarMenu/sidebarMenuSlice';
import editCourseReducer from '@/redux/reducers/editCourse/addLessonSlice';
import forumExperienceReducer from '@/redux/reducers/forumExperience/forumExperienceSlice';

export const store = configureStore({
   reducer: {
      forumName: forumNameReducer,
      users: userReducer,
      sidebar: sidebarReducer,
      editCourse: editCourseReducer,
      forumExperience: forumExperienceReducer,
   },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
