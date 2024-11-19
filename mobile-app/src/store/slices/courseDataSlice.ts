import { createSlice } from '@reduxjs/toolkit'
import { courseData } from '../../model/feed'



// Define the initial state using that type
const initialState = {
  value: null as courseData | null,
  isLoading: false,
  currIndex: 0
}

export const courseDataSlice = createSlice({
  name: 'courseData',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setCourseData: (state, action) => {
      state.value = {
        ...action.payload
      }
    },
    setCurrentIndex: (state, action) => {
      state.currIndex = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    }
  },
})

export const { setCourseData, setCurrentIndex, setLoading } = courseDataSlice.actions

export default courseDataSlice.reducer