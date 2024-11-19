import { createSlice } from "@reduxjs/toolkit";

export const addLesson = createSlice({
   name: "addLesson",
   initialState: {
      saveBtnLoader: false,
      chapterId: '',
      courseInfo: [],
      selectedIndexToggle: false,
      discardBtnDisable: false,
      editCourseAction: [],
      publishLessonToggle: false,
      courseDetails: {
         CourseName: '',
         Description: ''
      },
      dragToggle: false,
      isPageLoading: false,
      yesBtnLoading: false,
      chapterActionInfo: {},
      headerSectionToggle:false,
   },
   reducers: {
      setSaveBtnLoader: (state: any, action) => {
         state.saveBtnLoader = action.payload;
      },
      setChapterId: (state: any, action) => {
         state.chapterId = action.payload;
      },
      setCourseInfo: (state: any, action) => {
         state.courseInfo = action.payload;
      },
      setSelectedIndexToggle: (state: any, action) => {
         state.selectedIndexToggle = action.payload;
      },
      setDiscardBtnDisable: (state: any, action) => {
         state.discardBtnDisable = action.payload;
      },
      setEditCourseAction: (state: any, action) => {
         state.editCourseAction = action.payload;
      },
      setPublishLessonToggle: (state: any, action) => {
         state.publishLessonToggle = action.payload;
      },
      setCouseDetails: (state: any, action) => {
         state.courseDetails = action.payload;
      },
      setDragToggle: (state: any, action) => {
         state.dragToggle = action.payload;
      },
      setIsPageLoading: (state: any, action) => {
         state.isPageLoading = action.payload;
      },
      setYesBtnLoading: (state: any, action) => {
         state.yesBtnLoading = action.payload;
      },
      setChapterActionInfo: (state: any, action) => {
         state.chapterActionInfo = action.payload;
      },
      setHeaderSectionToggle: (state: any, action) => {
         state.headerSectionToggle = action.payload;
      },

   }
})

export const {
   setSaveBtnLoader,
   setChapterId,
   setCourseInfo,
   setSelectedIndexToggle,
   setDiscardBtnDisable,
   setEditCourseAction,
   setPublishLessonToggle,
   setCouseDetails,
   setDragToggle,
   setIsPageLoading,
   setYesBtnLoading,
   setChapterActionInfo,
   setHeaderSectionToggle,
   } = addLesson.actions;

export default addLesson.reducer;