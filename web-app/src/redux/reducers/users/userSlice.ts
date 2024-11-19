import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
   name: "Users",
   initialState: {
      userFirstName: "",
      userLastName: ""

   },
   reducers: {
      setUserFirstName: (state: any, action) => {
         state.userFirstName = action.payload;
      },
      setUserLastName: (state: any, action) => {
         state.userLastName = action.payload;
      },
   }

})

export const { setUserFirstName, setUserLastName } = userSlice.actions;

export default userSlice.reducer;