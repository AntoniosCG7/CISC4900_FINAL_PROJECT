import { createSlice } from "@reduxjs/toolkit";

export const eventSlice = createSlice({
  name: "events",
  initialState: {
    items: [],
  },
  reducers: {
    setEvents: (state, action) => {
      state.items = action.payload;
    },
    addEvent: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateEvent: (state, action) => {
      const index = state.items.findIndex(
        (event) => event._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const { setEvents, addEvent, updateEvent } = eventSlice.actions;

export const selectEvents = (state) => state.events.items;

export default eventSlice.reducer;
