import { createSlice } from "@reduxjs/toolkit";

export const sidebarMenuSlice = createSlice({
   name: "sidebarMenu",
   initialState: {
      menu: []
   },

   reducers: {
      setSidebarMenu: (state: any, action) => {
         state.menu = action.payload;
      },
   }
})

export const { setSidebarMenu } = sidebarMenuSlice.actions;

export default sidebarMenuSlice.reducer;