import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";

export const messageSlice = createSlice({
  name: "messages",
  initialState: {
    byChatId: {}, // Store messages by chat ID
  },
  reducers: {
    // Add a new message to a specific chat
    addMessageToChat: (state, action) => {
      const chatId = action.payload.chat._id;
      if (!chatId) {
        console.error("Chat ID is undefined in addMessageToChat");
        return;
      }
      // If this chat doesn't already have messages in the store, initialize it
      if (!state.byChatId[chatId]) {
        state.byChatId[chatId] = [];
      }

      // Add the new message to the chat
      state.byChatId[chatId].push(action.payload.messages);
    },

    // Remove all messages associated with a specific chat
    clearMessagesFromChat: (state, action) => {
      delete state.byChatId[action.payload.chatId];
    },

    // Initialize messages for a new chat when it's first opened
    setInitialMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.byChatId[chatId] = messages;
    },
  },
});

export const { addMessageToChat, clearMessagesFromChat, setInitialMessages } =
  messageSlice.actions;

const getMessagesByChatId = (state, chatId) => state.messages?.byChatId[chatId];

export const selectMessagesByChatId = createSelector(
  [getMessagesByChatId],
  (messages) => {
    return messages || [];
  }
);

export default messageSlice.reducer;
