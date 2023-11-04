import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { animated, update, useTransition } from "@react-spring/web";
import axios from "axios";
import {
  setCurrentChat,
  fetchChatsForUser,
  clearCurrentChat,
  moveChatToTop,
  updateRecentMessage,
} from "./../../slices/chatSlice";
import {
  addMessageToChat,
  setInitialMessages,
  selectMessagesByChatId,
} from "./../../slices/messageSlice";
import { useSocket } from "./../../contexts/SocketContext";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Carousel } from "antd";
import {
  faFileImage,
  faFaceLaughBeam,
  faPaperPlane,
  faEllipsis,
  faMagnifyingGlass,
  faSquareCaretDown,
} from "@fortawesome/free-solid-svg-icons";
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
  const messagesContainerRef = useRef(null);
  const [iconClicked, setIconClicked] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [isSharedMediaVisible, setSharedMediaVisible] = useState(false);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const carouselRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Fetch unread messages for the current chat and mark them as read
  useEffect(() => {
    // Check if there's a valid current chat
    if (!currentChat || !currentChat._id) return;

    const fetchUnreadMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/messages/${currentChat._id}/unread`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          const unreadMessages = response.data?.messages || [];

          if (unreadMessages.length > 0) {
            socket.emit("messages-read", {
              chat: currentChat,
              userId: currentUser._id,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    fetchUnreadMessages();
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

          // Add the message to the Redux store
          dispatch(
            addMessageToChat({
              chat: { _id: currentChat._id },
              messages: savedMessage,
            })
          );

          // Move the chat to the top of the list
          dispatch(moveChatToTop(currentChat._id));

          // Update the recent message in the chats list
          dispatch(
            updateRecentMessage({
              chatId: currentChat._id,
              message: savedMessage,
              currentUserId: currentUser._id,
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

  // Handle image message upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; // Get the selected file

    if (file) {
      // Ensure it's an image
      if (file.type.match("image.*")) {
        // Create a FormData object to prepare the file for upload
        const formData = new FormData();
        formData.append("image", file);
        formData.append("chat", currentChat._id);
        formData.append("sender", currentUser._id);

        try {
          const response = await axios.post(
            "http://localhost:3000/api/v1/messages/sendImage",
            formData,
            {
              withCredentials: true,
            }
          );

          if (response.data.status === "success") {
            const imageMessage = response.data.data.message;

            // Send the image message through the socket
            socket.emit("send-message", imageMessage);

            // Add the image message to the Redux store
            dispatch(
              addMessageToChat({
                chat: { _id: currentChat._id },
                messages: imageMessage,
              })
            );

            // Move the chat to the top of the list
            dispatch(moveChatToTop(currentChat._id));

            // Update the recent message in the chats list
            dispatch(
              updateRecentMessage({
                chatId: currentChat._id,
                message: imageMessage,
                currentUserId: currentUser._id,
              })
            );
          } else {
            console.error("Image upload failed:", response.data.error);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      } else {
        console.error("Selected file is not an image.");
      }
    }
  };

  // Scroll to the bottom of the messages list when the image is loaded
  const handleImageLoad = () => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  };

  // This function is called when the user clicks on the background of the modal
  const handleModalClick = (event) => {
    if (event.target.classList.contains("modal")) {
      setModalOpen(false);
      setModalImageUrl(null);
    }
  };

  // Format the timestamp to a readable format (e.g. December 20 2023 - 12:34 AM)
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const date = new Date(timestamp);
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      date
    );

    // Split date and time
    const [datePart, timePart] = formattedDate.split(", ");

    // Return the formatted timestamp
    return `${datePart} ${timePart}`;
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

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
  };

  // Toggle the shared media visibility
  const toggleSharedMedia = () => {
    setSharedMediaVisible((prevState) => !prevState);
  };

  // Get the image URLs from the image messages
  const getImageUrls = () => {
    return messages.filter((msg) => msg.imageUrl).map((msg) => msg.imageUrl);
  };

  // This function is called when the user clicks on a photo from the shared media
  const handleOpenModal = (index) => {
    setIsCarouselModalOpen(true);
    setTimeout(() => {
      carouselRef.current.goTo(index, false);
    }, 0);
  };

  // This function is called when the user clicks on the background of the modal (for the shared media)
  const handleCloseModal = () => {
    setIsCarouselModalOpen(false);
  };

  // Filter the chats based on the search term
  const filteredChats = chats.filter((chat) => {
    let chatOtherUser =
      chat.user1._id === currentUser._id ? chat.user2 : chat.user1;

    if (
      chatOtherUser.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      chatOtherUser.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return true;
    }

    return false;
  });

  // Animate the chat list using react-spring
  const chatTransitions = useTransition(filteredChats, {
    keys: (chat) => chat._id,
    from: { transform: "translate3d(0,-40px,0)", opacity: 0 },
    enter: { transform: "translate3d(0,0px,0)", opacity: 1 },
    leave: { transform: "translate3d(0,-40px,0)", opacity: 0 },
    update: { transform: "translate3d(0,0,0)" },
  });

  // Animate the active users list using react-spring
  const activeUserTransitions = useTransition(activeUsers, {
    keys: (user) => user._id,
    from: { transform: "translate3d(40px,0,0)", opacity: 0 },
    enter: { transform: "translate3d(0,0,0)", opacity: 1 },
    leave: { transform: "translate3d(40px,0,0)", opacity: 0 },
  });

  // Animate the shared media using react-spring
  const sharedMediaTransitions = useTransition(isSharedMediaVisible, {
    from: { opacity: 0, transform: "translateY(10%)" },
    enter: { opacity: 1, transform: "translateY(0%)" },
    leave: { opacity: 0, transform: "translateY(10%)" },
  });

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
            <ul className="nav-options">
              <li>
                <Link to="/discover">Discover</Link>
              </li>
              <li>
                <Link to="/chat">Chat</Link>
              </li>
              <li>
                <Link to="/map">Map</Link>
              </li>
            </ul>
          </div>
          <div className="chat-search-wrapper">
            <input
              className="chat-search"
              type="text"
              placeholder="Search for a chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={`chat-search-icon ${iconClicked ? "clicked" : ""}`}
              onClick={handleIconClick}
            />
          </div>

          <div className="active-users">
            {activeUsers.length > 0 ? (
              activeUserTransitions((styles, user) => (
                <animated.div style={styles} key={user._id}>
                  <div className="active-user">
                    <img
                      src={user.profilePicture.url}
                      alt={user.username}
                      className="active-user-avatar"
                    />
                    {user.currentlyActive && (
                      <div className="active-indicator"></div>
                    )}
                  </div>
                </animated.div>
              ))
            ) : (
              <div className="no-active-users">No active users currently.</div>
            )}
          </div>

          <div className="chat-list">
            {chatTransitions((styles, chat) => {
              let chatOtherUser =
                chat.user1._id === currentUser._id ? chat.user2 : chat.user1;

              let isActiveUser = activeUsers.some(
                (user) => user._id === chatOtherUser._id
              );

              return (
                <animated.div style={styles} key={chat._id}>
                  <div
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
                    {isActiveUser && (
                      <div className="chat-active-indicator"></div>
                    )}
                    <span className="chat-user-info">
                      <span className="chat-user-name">
                        {chatOtherUser.firstName} {chatOtherUser.lastName}
                      </span>
                      {chat.recentMessage && (
                        <span className="chat-recent-message">
                          {chat.recentMessage.sender === currentUser._id
                            ? "You: "
                            : ""}
                          {chat.recentMessage.imageUrl
                            ? "Sent a Photo."
                            : chat.recentMessage.content.length > 35
                            ? chat.recentMessage.content.substring(0, 32) +
                              "..."
                            : chat.recentMessage.content}
                        </span>
                      )}
                    </span>
                    {chat.unreadCount > 0 && (
                      <div className="unread-count">{chat.unreadCount}</div>
                    )}
                  </div>
                </animated.div>
              );
            })}

            {filteredChats.length === 0 && (
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
                <FontAwesomeIcon
                  icon={faEllipsis}
                  className="chat-header-ellipsis-icon"
                  onClick={handleToggleSidebar}
                />
              </div>
              <div className="messages" ref={messagesContainerRef}>
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isSent = msg.sender._id === currentUser._id;
                    return (
                      <div
                        key={msg._id}
                        className={`message-container ${
                          isSent ? "sent" : "received"
                        }`}
                      >
                        {!isSent && (
                          <img
                            src={
                              otherUser.profilePicture.url ||
                              otherUser.profilePicture.default
                            }
                            alt="Sender"
                            className="sender-avatar"
                          />
                        )}
                        {isSent && (
                          <span className="message-timestamp">
                            {msg.timestamp && formatTimestamp(msg.timestamp)}
                          </span>
                        )}
                        <div
                          className={`message ${isSent ? "sent" : "received"}`}
                        >
                          {/* Conditionally render the image or text message */}
                          {msg.imageUrl ? (
                            <img
                              src={msg.imageUrl}
                              alt="Sent Image"
                              className="chat-image"
                              onLoad={handleImageLoad}
                              onClick={() => {
                                setModalImageUrl(msg.imageUrl);
                                setModalOpen(true);
                              }}
                            />
                          ) : (
                            <>{msg.content}</>
                          )}
                        </div>

                        {isSent && (
                          <div className="message-status">
                            <i
                              className="fas fa-check-double"
                              title={msg.read ? "Read" : "Delivered"}
                              style={{
                                color: msg.read ? "rgb(43, 132, 215)" : "grey",
                              }}
                            ></i>
                          </div>
                        )}

                        {!isSent && (
                          <span className="message-timestamp">
                            {msg.timestamp && formatTimestamp(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-messages">No messages in this chat yet.</p>
                )}

                {isModalOpen && modalImageUrl && (
                  <div className="modal" onClick={handleModalClick}>
                    <button
                      className="modal-close-btn"
                      onClick={() => setModalOpen(false)}
                    >
                      &times;
                    </button>
                    <img src={modalImageUrl} className="modal-content" />
                  </div>
                )}
              </div>
              <div className="picker-wrapper">
                {showEmojiPicker && (
                  <Picker
                    onEmojiSelect={handleEmojiSelect}
                    onClickOutside={(e) => {
                      if (e.target !== emojiButtonRef.current) {
                        setShowEmojiPicker(!showEmojiPicker);
                      }
                    }}
                    title="Pick your emoji..."
                    previewEmoji="point_up"
                    data={data}
                    style={{
                      position: "absolute",
                      left: "0",
                      bottom: "100%",
                      zIndex: "1",
                    }}
                  />
                )}
              </div>

              <div className="chat-controls">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  <FontAwesomeIcon icon={faFileImage} className="file-image" />
                </label>
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message || ""}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    ref={emojiButtonRef}
                    className="emoji-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFaceLaughBeam}
                      className="emoji-icon"
                      height="1em"
                    />
                  </button>
                </div>
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="send-icon"
                  onClick={handleSendMessage}
                />
              </div>
            </>
          ) : (
            <>
              <div className="chat-header">
                <h1>Select a chat</h1>
                <FontAwesomeIcon
                  icon={faEllipsis}
                  className="chat-header-ellipsis-icon"
                  onClick={handleToggleSidebar}
                />
              </div>
              <div className="messages" ref={messagesContainerRef}>
                <p></p>
              </div>
              <div className="chat-controls">
                <label className="file-upload-label">
                  <FontAwesomeIcon icon={faFileImage} className="file-image" />
                </label>

                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message || ""}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <FontAwesomeIcon
                    icon={faFaceLaughBeam}
                    className="emoji-icon"
                    height="1em"
                  />
                </div>
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="send-icon"
                  onClick={handleSendMessage}
                />
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

                <div onClick={toggleSharedMedia}>
                  Shared Media
                  <FontAwesomeIcon
                    icon={faSquareCaretDown}
                    className="shared-media-icon"
                  />
                </div>

                {sharedMediaTransitions(
                  (style, item) =>
                    item && (
                      <animated.div
                        style={style}
                        className="shared-media-section"
                      >
                        {getImageUrls().map((url, index) => (
                          <div
                            key={index}
                            onClick={() => handleOpenModal(index)}
                          >
                            <img
                              src={url}
                              alt="Shared Media"
                              className="shared-media-image"
                            />
                          </div>
                        ))}
                        <Modal
                          wrapClassName="my-custom-modal"
                          open={isCarouselModalOpen}
                          onCancel={handleCloseModal}
                          footer={null}
                          width={850}
                          height={850}
                        >
                          <Carousel ref={carouselRef} dots={true}>
                            {getImageUrls().map((url, index) => (
                              <div key={index}>
                                <img
                                  src={url}
                                  alt="Shared Media"
                                  className="carousel-image"
                                />
                              </div>
                            ))}
                          </Carousel>
                        </Modal>
                      </animated.div>
                    )
                )}
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
