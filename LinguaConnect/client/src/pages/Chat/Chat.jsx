import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useNavigate, useLocation } from "react-router-dom";
import { setCurrentChat } from "./../../slices/chatSlice";
import axios from "axios";
import { fetchChatsForUser, clearCurrentChat } from "./../../slices/chatSlice";
import {
  addMessageToChat,
  setInitialMessages,
  selectMessagesByChatId,
} from "./../../slices/messageSlice";
import { useSocket } from "./../../contexts/SocketContext";
import "./Chat.css";

const Chat = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const otherUser = useSelector((state) => state.chat.otherUser);
  const currentChat = useSelector((state) => state.chat.currentChat);
  const [activeUsers, setActiveUsers] = useState([]);
  const selectChats = createSelector(
    (state) => state.chat.chats,
    (chats) => Object.values(chats)
  );
  const chats = useSelector(selectChats);
  const [message, setMessage] = useState("");
  const messages = useSelector((state) =>
    selectMessagesByChatId(state, currentChat?._id)
  );
  const [iconClicked, setIconClicked] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const messagesContainerRef = React.useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const socket = useSocket();

  // Check if the user is redirected from the profile page
  const fromInitiation = location.state?.fromInitiation;

  // Fetch the current user's chats
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchChatsForUser(currentUser._id));
    }
  }, [currentUser, dispatch]);

  // Fetch the active users on component mount
  useEffect(() => {
    fetchActiveUsers();
  }, []);

  // Listen for changes in the active users list
  useEffect(() => {
    if (socket) {
      // Listen for user status changes and fetch active users again.
      socket.on("user-status-change", fetchActiveUsers);

      // Clean up listener on component unmount.
      return () => {
        socket.off("user-status-change", fetchActiveUsers);
      };
    }
  }, [socket]);

  // Fetch the message history for the current chat
  useEffect(() => {
    if (currentChat && currentChat._id) {
      axios
        .get(`http://localhost:3000/api/v1/messages/${currentChat._id}`, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.status === 200) {
            const returnedMessages = response.data.messages;
            const sortedMessages = returnedMessages.sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
            dispatch(
              setInitialMessages({
                chatId: currentChat._id,
                messages: sortedMessages,
              })
            );
          } else {
            console.error("Failed to fetch messages. No success flag.");
          }
        })
        .catch((error) => {
          console.error(
            "Error fetching messages:",
            error.response?.data || error.message
          );
        });
    }
  }, [currentChat]);

  // Scroll to the bottom of the messages list on every render
  useEffect(() => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  // Cleanup function when the component is unmounted, but first check if the user is redirected from the profile page because in that case we don't want to clear the current chat
  useEffect(() => {
    return () => {
      if (!fromInitiation) {
        dispatch(clearCurrentChat());
      }
    };
  }, [dispatch, fromInitiation]);

  // Fetch the active users
  const fetchActiveUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/users/activeChatUsers",
        {
          withCredentials: true,
        }
      );

      setActiveUsers(response.data.data.users);
    } catch (error) {
      console.error("An error occurred while fetching active users:", error);
    }
  };

  // Set the chat as current in the Redux store when the user clicks on a chat
  const handleChatClick = async (chat) => {
    dispatch(
      setCurrentChat({
        currentChat: chat,
        currentUserId: currentUser._id,
      })
    );
  };

  // Send a message when the user clicks the send button
  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      const newMessage = {
        chat: currentChat._id,
        content: message,
        sender: currentUser._id,
      };

      // Send the message through the socket
      socket.emit("send-message", newMessage);

      // Send the message to the backend for persistence
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/messages",
          newMessage,
          {
            withCredentials: true,
          }
        );

        if (response.status === 201) {
          const savedMessage = response.data.data.message;

          dispatch(
            addMessageToChat({
              chat: { _id: currentChat._id },
              messages: savedMessage,
            })
          );
        } else {
          console.error("Failed to save the message to the backend.");
        }
      } catch (error) {
        console.error(
          "An error occurred while sending the message to the backend:",
          error
        );
      }

      // Clear the input field
      setMessage("");
    }
  };

  // Send a message when the user presses the Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && message.trim() !== "") {
      handleSendMessage();
      e.preventDefault();
    }
  };

  // Redirect to the user's profile page
  const redirectToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Toggle the sidebar visibility
  const handleToggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  // Toggle the search icon's clicked state
  const handleIconClick = () => {
    setIconClicked(!iconClicked);

    setTimeout(() => {
      setIconClicked(false);
    }, 300);
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <>
      <div className="chat-page">
        <div className="chat-sidebar">
          <div className="chat-settings">
            <img
              src={
                currentUser.profilePicture.url ||
                currentUser.profilePicture.default
              }
              alt="Profile"
              className="profile-photo"
              onClick={() => redirectToUserProfile(currentUser._id)}
            />
          </div>
          <div className="chat-search-wrapper">
            <input
              className="chat-search"
              type="text"
              placeholder="Search..."
            />
            <svg
              className={`chat-search-icon ${iconClicked ? "clicked" : ""}`}
              onClick={handleIconClick}
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 512 512"
            >
              <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
            </svg>
          </div>

          <div className="active-users">
            {activeUsers.length === 0 ? (
              <p></p>
            ) : (
              activeUsers.map((user) => (
                <div key={user._id} className="active-user">
                  <img
                    src={user.profilePicture.url}
                    alt={user.username}
                    className="active-user-avatar"
                  />
                  {user.currentlyActive && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="chat-list">
            {chats && chats.length > 0 ? (
              chats.map((chat) => {
                let chatOtherUser =
                  chat.user1._id === currentUser._id ? chat.user2 : chat.user1;

                return (
                  <div
                    key={chat._id}
                    className={`chat-item ${
                      currentChat && chat._id === currentChat._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleChatClick(chat)}
                  >
                    <img
                      src={chatOtherUser.profilePicture.url}
                      alt="profile picture"
                      className="chat-user-image"
                    />
                    <span className="chat-user-name">
                      {chatOtherUser.firstName} {chatOtherUser.lastName}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="no-chats">No chats yet</div>
            )}
          </div>
        </div>
        <div
          className="active-chat"
          style={{ width: isSidebarVisible ? "60%" : "80%" }}
        >
          {currentChat && otherUser ? (
            <>
              <div className="chat-header">
                <h1 onClick={() => redirectToUserProfile(otherUser._id)}>
                  {`${otherUser.firstName} ${otherUser.lastName}`}
                </h1>
                <svg
                  className="chat-header-ellipsis-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 448 512"
                  onClick={handleToggleSidebar}
                >
                  <path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z" />
                </svg>
              </div>
              <div className="messages" ref={messagesContainerRef}>
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    return (
                      <div
                        key={msg._id}
                        className={`message ${
                          msg.sender._id === currentUser._id
                            ? "sent"
                            : "received"
                        }`}
                      >
                        <span className="sender">
                          {msg.sender._id === currentUser._id
                            ? currentUser.firstName
                            : msg.sender.firstName}
                        </span>
                        : {msg.content}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-messages">No messages in this chat yet.</p>
                )}
              </div>

              <div className="shared-media"></div>
              <div className="chat-controls">
                <button>📎</button>
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message || ""}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <svg
                    className="emoji-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM96.8 314.1c-3.8-13.7 7.4-26.1 21.6-26.1H393.6c14.2 0 25.5 12.4 21.6 26.1C396.2 382 332.1 432 256 432s-140.2-50-159.2-117.9zM217.6 212.8l0 0 0 0-.2-.2c-.2-.2-.4-.5-.7-.9c-.6-.8-1.6-2-2.8-3.4c-2.5-2.8-6-6.6-10.2-10.3c-8.8-7.8-18.8-14-27.7-14s-18.9 6.2-27.7 14c-4.2 3.7-7.7 7.5-10.2 10.3c-1.2 1.4-2.2 2.6-2.8 3.4c-.3 .4-.6 .7-.7 .9l-.2 .2 0 0 0 0 0 0c-2.1 2.8-5.7 3.9-8.9 2.8s-5.5-4.1-5.5-7.6c0-17.9 6.7-35.6 16.6-48.8c9.8-13 23.9-23.2 39.4-23.2s29.6 10.2 39.4 23.2c9.9 13.2 16.6 30.9 16.6 48.8c0 3.4-2.2 6.5-5.5 7.6s-6.9 0-8.9-2.8l0 0 0 0zm160 0l0 0-.2-.2c-.2-.2-.4-.5-.7-.9c-.6-.8-1.6-2-2.8-3.4c-2.5-2.8-6-6.6-10.2-10.3c-8.8-7.8-18.8-14-27.7-14s-18.9 6.2-27.7 14c-4.2 3.7-7.7 7.5-10.2 10.3c-1.2 1.4-2.2 2.6-2.8 3.4c-.3 .4-.6 .7-.7 .9l-.2 .2 0 0 0 0 0 0c-2.1 2.8-5.7 3.9-8.9 2.8s-5.5-4.1-5.5-7.6c0-17.9 6.7-35.6 16.6-48.8c9.8-13 23.9-23.2 39.4-23.2s29.6 10.2 39.4 23.2c9.9 13.2 16.6 30.9 16.6 48.8c0 3.4-2.2 6.5-5.5 7.6s-6.9 0-8.9-2.8l0 0 0 0 0 0z" />
                  </svg>
                </div>
                <svg
                  className="send-icon"
                  onClick={handleSendMessage}
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 512 512"
                >
                  <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                </svg>
              </div>
            </>
          ) : (
            <>
              <div className="chat-header">
                <h1>Select a chat</h1>
                <svg
                  className="chat-header-ellipsis-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 448 512"
                  onClick={handleToggleSidebar}
                >
                  <path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z" />
                </svg>
              </div>
              <div className="messages" ref={messagesContainerRef}>
                <p></p>
              </div>
              <div className="shared-media"></div>
              <div className="chat-controls">
                <button>📎</button>
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message || ""}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <svg
                    className="emoji-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM96.8 314.1c-3.8-13.7 7.4-26.1 21.6-26.1H393.6c14.2 0 25.5 12.4 21.6 26.1C396.2 382 332.1 432 256 432s-140.2-50-159.2-117.9zM217.6 212.8l0 0 0 0-.2-.2c-.2-.2-.4-.5-.7-.9c-.6-.8-1.6-2-2.8-3.4c-2.5-2.8-6-6.6-10.2-10.3c-8.8-7.8-18.8-14-27.7-14s-18.9 6.2-27.7 14c-4.2 3.7-7.7 7.5-10.2 10.3c-1.2 1.4-2.2 2.6-2.8 3.4c-.3 .4-.6 .7-.7 .9l-.2 .2 0 0 0 0 0 0c-2.1 2.8-5.7 3.9-8.9 2.8s-5.5-4.1-5.5-7.6c0-17.9 6.7-35.6 16.6-48.8c9.8-13 23.9-23.2 39.4-23.2s29.6 10.2 39.4 23.2c9.9 13.2 16.6 30.9 16.6 48.8c0 3.4-2.2 6.5-5.5 7.6s-6.9 0-8.9-2.8l0 0 0 0zm160 0l0 0-.2-.2c-.2-.2-.4-.5-.7-.9c-.6-.8-1.6-2-2.8-3.4c-2.5-2.8-6-6.6-10.2-10.3c-8.8-7.8-18.8-14-27.7-14s-18.9 6.2-27.7 14c-4.2 3.7-7.7 7.5-10.2 10.3c-1.2 1.4-2.2 2.6-2.8 3.4c-.3 .4-.6 .7-.7 .9l-.2 .2 0 0 0 0 0 0c-2.1 2.8-5.7 3.9-8.9 2.8s-5.5-4.1-5.5-7.6c0-17.9 6.7-35.6 16.6-48.8c9.8-13 23.9-23.2 39.4-23.2s29.6 10.2 39.4 23.2c9.9 13.2 16.6 30.9 16.6 48.8c0 3.4-2.2 6.5-5.5 7.6s-6.9 0-8.9-2.8l0 0 0 0 0 0z" />
                  </svg>
                </div>
                <svg
                  className="send-icon"
                  onClick={handleSendMessage}
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 512 512"
                >
                  <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                </svg>
              </div>
            </>
          )}
        </div>

        <div
          className={`user-details-sidebar ${
            isSidebarVisible ? "visible" : ""
          }`}
        >
          {otherUser ? (
            <>
              <div className="details">
                <img
                  src={
                    otherUser?.profilePicture?.url ||
                    otherUser?.profilePicture?.default
                  }
                  alt={`${otherUser?.firstName || "Default"} Profile`}
                  className="user-detail-photo"
                />

                <h2 onClick={() => redirectToUserProfile(otherUser._id)}>
                  {`${otherUser.firstName} ${otherUser.lastName}`}
                </h2>

                <h3>Languages</h3>
                <div className="language-details">
                  <h4>Native:</h4>
                  <p className="details-language-list">
                    {otherUser.languages.native
                      .map((lang) => lang.name)
                      .join(", ")}
                  </p>

                  <h4>Fluent:</h4>
                  <p className="details-language-list">
                    {otherUser.languages.fluent
                      .map((lang) => lang.name)
                      .join(", ")}
                  </p>

                  <h4>Learning:</h4>
                  <p className="details-language-list">
                    {otherUser.languages.learning
                      .map((lang) => lang.name)
                      .join(", ")}
                  </p>
                </div>

                <p>
                  Shared Media
                  <svg
                    className="shared-media-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 448 512"
                  >
                    <path d="M384 480c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0zM224 352c-6.7 0-13-2.8-17.6-7.7l-104-112c-6.5-7-8.2-17.2-4.4-25.9s12.5-14.4 22-14.4l208 0c9.5 0 18.2 5.7 22 14.4s2.1 18.9-4.4 25.9l-104 112c-4.5 4.9-10.9 7.7-17.6 7.7z" />
                  </svg>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="details">
                <img
                  src="../../../public/assets/images/Default.png"
                  alt="Default Image"
                  className="user-detail-photo"
                />
                <h2>Select a chat</h2>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
