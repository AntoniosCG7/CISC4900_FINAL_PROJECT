import React, { createContext, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import { setActiveUsers } from "../slices/activeUsersSlice";
import { addChat } from "../slices/chatSlice";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const currentUserId = useSelector((state) => state.auth.user._id);
  const dispatch = useDispatch();

  useEffect(() => {
    const newSocket = io("http://localhost:3000", { withCredentials: true });
    setSocket(newSocket);

    // Emit user details after establishing the socket connection
    newSocket.emit("user-details", { userId: currentUserId });

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
      console.log("Received new chat:", chat);
      dispatch(addChat(chat));
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
