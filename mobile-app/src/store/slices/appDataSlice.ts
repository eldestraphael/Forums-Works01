import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../reduxStore'
import { StatusData } from '../../model/feed'
import { ForumInfo } from '../../model/forums';


interface ForumInfoData {
  uuid: string;
  forum_name: string;

}


interface InitialState {
  value: {
    forumInfo: ForumInfo | null
  }
}

// Define the initial state using that type
const initialState: InitialState = {
  value: {
    forumInfo: null
  }
}

export const appDataSlice = createSlice({
  name: 'appData',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setForumInfo: (state, {payload }: {payload: ForumInfo}) => {
      state.value.forumInfo = payload
    }
  },
})

export const { setForumInfo } = appDataSlice.actions

export default appDataSlice.reducer