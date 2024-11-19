import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../reduxStore'
import { StatusData } from '../../model/feed'



// Define the initial state using that type
const initialState = {
  value: {} as StatusData
}

export const statusDataSlice = createSlice({
  name: 'statusData',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setStatusData: (state, action) => {
      state.value = {
        ...action.payload
      }
    }
  },
})

export const { setStatusData } = statusDataSlice.actions

export default statusDataSlice.reducer