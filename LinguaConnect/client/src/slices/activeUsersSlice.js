import { createSlice } from "@reduxjs/toolkit";

export const activeUsersSlice = createSlice({
  name: "activeUsers",
  initialState: [],
  reducers: {
    setActiveUsers: (state, action) => {
      return action.payload;
    },
  },
});

export const { setActiveUsers } = activeUsersSlice.actions;
export const selectActiveUsers = (state) => state.activeUsers;
export default activeUsersSlice.reducer;
