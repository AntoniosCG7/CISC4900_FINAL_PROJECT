import { createSlice } from "@reduxjs/toolkit";

export const eventSlice = createSlice({
  name: "events",
  initialState: {
    userEvents: [], // Events related to the current user
    allEvents: [], // All events fetched from the API
  },
  reducers: {
    // Sets all events related to the current user
    setAllEvents: (state, action) => {
      state.allEvents = action.payload.map((event) => ({
        ...event,
        goingCount: event.going?.length || 0,
        interestedCount: event.interested?.length || 0,
      }));
    },

    // Sets all events fetched from the API
    setUserEvents: (state, action) => {
      state.userEvents = action.payload.map((event) => ({
        ...event,
        goingCount: event.going?.length || 0,
        interestedCount: event.interested?.length || 0,
      }));
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

    // Adds an event with 'going' or 'interested' status to userEvents or updates its status
    updateEventStatus: (state, action) => {
      const { event, status, currentUserId } = action.payload;

      // Find if the event already exists in userEvents
      const eventIndex = state.userEvents.findIndex(
        (userEvent) => userEvent._id === event._id
      );

      if (eventIndex !== -1) {
        // Update the status of the existing event, only if it's not created by the current user
        if (state.userEvents[eventIndex].createdBy._id !== currentUserId) {
          state.userEvents[eventIndex].relationship = status;
        }
      } else {
        // Add the event with the specified status
        state.userEvents.push({ ...event, relationship: status });
      }

      // Update the counts for "going" and "interested" in allEvents
      const allEventsIndex = state.allEvents.findIndex(
        (e) => e._id === event._id
      );
      if (allEventsIndex !== -1) {
        state.allEvents[allEventsIndex] = {
          ...state.allEvents[allEventsIndex],
          goingCount: event.goingCount,
          interestedCount: event.interestedCount,
        };
      }
    },

    // Updates the "going" and "interested" counts for an event
    updateEventCounts: (state, action) => {
      const { eventId, goingCount, interestedCount } = action.payload;
      const eventIndex = state.allEvents.findIndex(
        (event) => event._id === eventId
      );
      if (eventIndex !== -1) {
        state.allEvents[eventIndex].goingCount = goingCount;
        state.allEvents[eventIndex].interestedCount = interestedCount;
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

    // Removes an event from the userEvents array
    removeEventFromUserList: (state, action) => {
      const eventId = action.payload;
      state.userEvents = state.userEvents.filter(
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
  updateEventStatus,
  updateEventCounts,
  removeEventFromUserList,
} = eventSlice.actions;

// Selector to get events related to the current user
export const selectUserEvents = (state) => state.events.userEvents;

// Selector to get all events
export const selectAllEvents = (state) => state.events.allEvents;

export default eventSlice.reducer;
