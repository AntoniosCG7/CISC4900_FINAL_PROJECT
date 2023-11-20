import React, { createContext, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import { setActiveUsers } from "../slices/activeUsersSlice";
import {
  addChat,
  moveChatToTop,
  updateRecentMessage,
  incrementUnreadCount,
} from "../slices/chatSlice";
import { addAlert } from "../slices/alertSlice";
import { addMessageToChat, markMessagesAsRead } from "../slices/messageSlice";
import { addEvent, updateEvent, deleteEvent } from "../slices/eventSlice";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const currentUserId = useSelector((state) => state.auth.user._id);
  const currentChat = useSelector((state) => state.chat?.currentChat);
  const dispatch = useDispatch();

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    setSocket(newSocket);

    // Emit user details after establishing the socket connection
    newSocket.emit("user-details", { userId: currentUserId });

    // Reconnect to the server if the connection is lost unexpectedly and refresh the list of active users.
    newSocket.on("connect", async () => {
      // Emit user details after establishing the socket connection
      newSocket.emit("user-details", { userId: currentUserId });

      // Directly fetch the list of active users to refresh the client's state
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/activeChatUsers",
          { withCredentials: true }
        );
        dispatch(setActiveUsers(response.data));
      } catch (error) {
        console.error("Failed to fetch active users on connect:", error);
      }
    });

    newSocket.on("disconnect", () => {
      // Emit a custom event to notify the server of a manual disconnect
      newSocket.emit("manual-disconnect", { userId: currentUserId });
    });

    // Listen for changes in the active users list
    newSocket.on("user-status-change", async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/activeChatUsers",
          { withCredentials: true }
        );
        dispatch(setActiveUsers(response.data));
      } catch (error) {
        console.error("Failed to fetch active users:", error);
      }
    });

    // Listen for new chats initiated by other users
    newSocket.on("newChatInitiated", (chat) => {
      dispatch(addChat(chat));
      dispatch(
        addAlert({
          type: "info",
          message: `A new chat has been initiated by ${chat.user1.firstName} ${chat.user1.lastName}.`,
        })
      );
    });

    // Listen for message-read-confirmation events
    newSocket.on("message-read-confirmation", (updatedMessages) => {
      dispatch(markMessagesAsRead({ messages: updatedMessages }));
    });

    // Error handling
    newSocket.on("error", (error) => {
      // Log the error
      console.error("Socket Error:", error);

      // Dispatch an alert with a user-friendly message
      const userFriendlyMessage =
        "There was a problem with the chat service. We're trying to reconnect...";
      dispatch(addAlert({ type: "error", message: userFriendlyMessage }));

      // Manually reconnect after a delay
      setTimeout(() => {
        newSocket.connect();
      }, 5000);
    });

    // listen for new events
    newSocket.on("new-event-created", (event) => {
      dispatch(addEvent({ event: event, currentUserId: currentUserId }));
    });

    // Listen for updated events
    newSocket.on("event-updated", (updatedEvent) => {
      dispatch(updateEvent(updatedEvent));
    });

    // Listen for deleted events
    newSocket.on("event-deleted", (eventId) => {
      dispatch(deleteEvent(eventId));
    });

    return () => {
      if (newSocket) {
        // Close the socket connection when the component unmounts
        newSocket.close();
      }
    };
  }, [currentUserId, dispatch]);

  // Keep socket initialization separate from the chat update logic. This way the socket won't be repeatedly initialized when currentChat changes.
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (message) => {
      // Update the state or store with the new message.
      dispatch(
        addMessageToChat({
          chat: { _id: message.chat._id },
          messages: message,
        })
      );

      // Move the chat to the top of the list if the message is from another user
      if (message.userId !== currentUserId) {
        dispatch(moveChatToTop(message.chat._id));
      }

      // Update the recent message in the chat list
      dispatch(
        updateRecentMessage({
          chatId: message.chat._id,
          message: message,
          currentUserId: currentUserId,
        })
      );

      // If the chat is currently open, emit a message-read event
      if (currentChat?._id === message.chat._id) {
        socket.emit("message-read", { message: message });
      } else {
        // Increment the unread message count for the chat if the chat is not currently open
        dispatch(incrementUnreadCount(message.chat._id));
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      if (socket) {
        // Remove the event listener when the component unmounts
        socket.off("new-message");
      }
    };
  }, [socket, currentChat, currentUserId, dispatch]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
