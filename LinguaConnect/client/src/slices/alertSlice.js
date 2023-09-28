// Desc: Redux slice for alert messages
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: "",
  type: "",
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    addAlert: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    clearAlert: (state) => {
      state.message = "";
      state.type = "";
    },
  },
});

export const { addAlert, clearAlert } = alertSlice.actions;
export default alertSlice.reducer;
