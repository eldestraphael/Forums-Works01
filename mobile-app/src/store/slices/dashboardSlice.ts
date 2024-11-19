import { createSlice } from '@reduxjs/toolkit'
import { courseData } from '../../model/feed'
import { DashboardRes } from '../../model/dashboard'



// Define the initial state using that type
const initialState = {
    value: null as DashboardRes | null,
    isLoading: false,
}

export const dashboardDataSlice = createSlice({
    name: 'dashboardData',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        setDashboardData: (state, action) => {
            state.value = {
                ...action.payload
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        }
    },
})

export const { setDashboardData, setLoading } = dashboardDataSlice.actions

export default dashboardDataSlice.reducer