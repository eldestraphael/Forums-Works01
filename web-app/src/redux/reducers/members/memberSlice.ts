import { createSlice } from "@reduxjs/toolkit";

export const memberSlice = createSlice({
   name: "fourmNameDisplay",
   initialState: {
      forumNameValue: "",
      FirstName: "",
      LastName: ""

   },
   reducers: {
      setForumName: (state: any, action) => {
         state.forumNameValue = action.payload;
      },
      setFirstName: (state: any, action) => {
         state.FirstName = action.payload;
      },
      setLastName: (state: any, action) => {
         state.LastName = action.payload;
      },
   }

})

export const { setForumName, setFirstName, setLastName } = memberSlice.actions;

export default memberSlice.reducer;