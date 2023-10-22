import React, { createContext, useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const currentUserId = useSelector((state) => state.auth.user._id);

  useEffect(() => {
    const newSocket = io("http://localhost:3000", { withCredentials: true });
    setSocket(newSocket);

    // Emit user details after establishing the socket connection
    newSocket.emit("user-details", { userId: currentUserId });

    newSocket.on("disconnect", () => {
      // Emit a custom event to notify the server of a manual disconnect
      newSocket.emit("manual-disconnect", { userId: currentUserId });
    });

    return () => {
      if (newSocket) {
        // Close the socket connection when the component unmounts
        newSocket.close();
      }
    };
  }, [currentUserId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
