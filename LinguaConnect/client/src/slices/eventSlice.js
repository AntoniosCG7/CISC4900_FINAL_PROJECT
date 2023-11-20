import { createSlice } from "@reduxjs/toolkit";

export const eventSlice = createSlice({
  name: "events",
  initialState: {
    userEvents: [], // Events related to the current user
    allEvents: [], // All events fetched from the API
  },
  reducers: {
    // Sets all events related to the current user
    setUserEvents: (state, action) => {
      state.userEvents = action.payload;
    },

    // Sets all events fetched from the API
    setAllEvents: (state, action) => {
      state.allEvents = action.payload;
    },

    // Adds an event and updates userEvents and allEvents as needed
    addEvent: (state, action) => {
      const { event, currentUserId } = action.payload;
      const isCreatedByCurrentUser = event.createdBy._id === currentUserId;

      // Add to allEvents
      state.allEvents.unshift(event);

      // Also add to userEvents if created by the current user
      if (isCreatedByCurrentUser) {
        state.userEvents.unshift(event);
      }
    },

    // Updates an event in both userEvents and allEvents arrays
    updateEvent: (state, action) => {
      const updateUserEventIndex = state.userEvents.findIndex(
        (event) => event._id === action.payload._id
      );
      if (updateUserEventIndex !== -1) {
        state.userEvents[updateUserEventIndex] = {
          ...state.userEvents[updateUserEventIndex],
          ...action.payload,
        };
      }
      const updateAllEventIndex = state.allEvents.findIndex(
        (event) => event._id === action.payload._id
      );
      if (updateAllEventIndex !== -1) {
        state.allEvents[updateAllEventIndex] = {
          ...state.allEvents[updateAllEventIndex],
          ...action.payload,
        };
      }
    },

    // Deletes an event from both userEvents and allEvents arrays
    deleteEvent: (state, action) => {
      const eventId = action.payload;

      // Remove the event from userEvents
      state.userEvents = state.userEvents.filter(
        (event) => event._id !== eventId
      );

      // Remove the event from allEvents
      state.allEvents = state.allEvents.filter(
        (event) => event._id !== eventId
      );
    },
  },
});

export const {
  setUserEvents,
  setAllEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} = eventSlice.actions;

// Selector to get events related to the current user
export const selectUserEvents = (state) => state.events.userEvents;

// Selector to get all events
export const selectAllEvents = (state) => state.events.allEvents;

export default eventSlice.reducer;
