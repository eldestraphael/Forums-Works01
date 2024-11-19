import { configureStore, combineReducers, AnyAction } from '@reduxjs/toolkit'
import statusDataReducer from './slices/statusDataSlice'
import courseDataReducer from './slices/courseDataSlice'
import appDataReducer from './slices/appDataSlice'
import dashboardDataReducer from './slices/dashboardSlice'

const combinedReducer = combineReducers({
  appData: appDataReducer,
  statusData: statusDataReducer,
  courseData: courseDataReducer,
  dashboardData: dashboardDataReducer
});

const rootReducer = (state: any, action: AnyAction) => {
  if (action.type === 'RESET') { //We are calling this RESET, but call what you like!
     state = {};
  }
  return combinedReducer(state, action);
 };

export const store = configureStore({
  reducer: rootReducer
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch