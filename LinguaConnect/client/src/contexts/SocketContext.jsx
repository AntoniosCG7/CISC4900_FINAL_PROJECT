import React, { createContext, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import { setActiveUsers } from "../slices/activeUsersSlice";
import { addChat, moveChatToTop } from "../slices/chatSlice";
import { addAlert } from "../slices/alertSlice";
import { addMessageToChat } from "../slices/messageSlice";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const currentUserId = useSelector((state) => state.auth.user._id);
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
      console.log("New chat initiated:", chat);
      dispatch(addChat(chat));
      dispatch(
        addAlert({
          type: "info",
          message: `A new chat has been initiated by ${chat.user1.firstName} ${chat.user1.lastName}.`,
        })
      );
    });

    // Listen for new messages
    newSocket.on("new-message", (message) => {
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

    return () => {
      if (newSocket) {
        // Close the socket connection when the component unmounts
        newSocket.close();
      }
    };
  }, [currentUserId, dispatch]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
