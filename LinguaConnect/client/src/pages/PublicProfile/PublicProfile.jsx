import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/index";
import { setCurrentChat, fetchUserDetails } from "./../../slices/chatSlice";
import { addAlert } from "./../../slices/alertSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Modal, Carousel } from "antd";
import { useLoading } from "../../contexts/LoadingContext";
import "./PublicProfile.css";

const PublicProfile = () => {
  const [otherUser, setOtherUser] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);
  const { loading, setLoading } = useLoading();
  const { userId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Create a new chat between the current user and the user whose profile is being viewed
  const initiateChat = async (receiverId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/chats/",
        {
          senderId: currentUser._id,
          receiverId: receiverId,
        },
        { withCredentials: true }
      );

      // Navigate the user to the new chat page. The chat page will fetch the chat data from the server and render it.
      if (response.status === 201) {
        dispatch(
          addAlert({
            type: "success",
            message: `Chat initiated with ${otherUser.firstName}!`,
          })
        );
        // set the current chat in the redux store
        dispatch(
          setCurrentChat({
            currentChat: response.data.data.chat,
            currentUserId: currentUser._id,
          })
        );
        dispatch(fetchUserDetails(otherUser._id));

        setTimeout(() => {
          navigate("/chat", { state: { fromInitiation: true } });
        }, 500);
      }
    } catch (error) {
      dispatch(
        addAlert({ type: "error", message: error.response.data.message })
      );
      console.error("Failed to initiate chat:", error);
    }
  };

  // This function is called when the user clicks on a photo in the photos
  const handleOpenModal = (index) => {
    setInitialSlide(index);
    setIsCarouselModalOpen(true);
  };

  // This function is called when the user clicks on the background of the modal (for the photos)
  const handleCloseModal = () => {
    setIsCarouselModalOpen(false);
  };

  // This function is called when the user clicks on the background of the modal (for the profile picture)
  const handleModalClick = (event) => {
    if (event.target.classList.contains("modal")) {
      setModalOpen(false);
    }
  };

  // Fetch the data of the user whose profile is being viewed
  useEffect(() => {
    async function fetchOtherUser() {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/users/${userId}`,
          {
            withCredentials: true,
          }
        );

        setOtherUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to fetch personal data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOtherUser();
  }, [userId, setLoading]);

  if (!otherUser) return null;

  return (
    <>
      <Navbar />
      <div className="main-container">
        <img
          src={otherUser.profilePicture.url || otherUser.profilePicture.default}
          alt="Profile"
          className="profile-picture"
          onClick={() => setModalOpen(true)}
        />
        {isModalOpen && (
          <div className="modal" onClick={handleModalClick}>
            <img
              src={
                otherUser.profilePicture.url || otherUser.profilePicture.default
              }
              className="modal-content"
            />
          </div>
        )}
        <h1 className="user-name-age">
          {otherUser.firstName} {otherUser.lastName}, {otherUser.age}
        </h1>
        <h2 className="user-location">
          <FontAwesomeIcon id="location-icon" icon={faLocationDot} />{" "}
          {otherUser.location.locationString}
        </h2>
        {currentUser._id !== otherUser._id && (
          <div>
            <button
              id="chat-initiation-btn"
              onClick={() => initiateChat(otherUser._id)}
            >
              Chat with {otherUser.firstName}
            </button>
          </div>
        )}
        <div className="profile-details">
          <div className="profile-section">
            <h2 className="section-title">About {otherUser.firstName}</h2>
            <div>
              <p className="about-question">What do you like to talk about?</p>
              <p className="about-answer">{otherUser.about.talkAbout}</p>
            </div>
            <div>
              <p className="about-question">
                What’s your perfect language-exchange partner like?
              </p>
              <p className="about-answer">{otherUser.about.perfectPartner}</p>
            </div>
            <div>
              <p className="about-question">
                What are your language learning goals?
              </p>
              <p className="about-answer">{otherUser.about.learningGoals}</p>
            </div>
          </div>
          <div className="profile-section" id="languages">
            <h2 className="section-title">Languages</h2>
            <div>
              <p className="language-category">Native:</p>
              <p className="language-answer">
                {otherUser.languages.native.map((lang) => lang.name).join(", ")}
              </p>
            </div>
            <div>
              <p className="language-category">Fluent:</p>
              <p className="language-answer">
                {otherUser.languages.fluent.map((lang) => lang.name).join(", ")}
              </p>
            </div>
            <div>
              <p className="language-category">Learning:</p>
              <p className="language-answer">
                {otherUser.languages.learning
                  .map((lang) => lang.name)
                  .join(", ")}
              </p>
            </div>
          </div>
          {/* If the user has photos, render the photos section. If not, don't
          render anything. */}
          {otherUser.photos && otherUser.photos.length > 0 && (
            <div className="profile-section" id="photos">
              <h2 className="section-title">Photos</h2>
              <div className="photos-container">
                {otherUser.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url}
                    alt={`User photo ${index + 1}`}
                    className="user-photo"
                    onClick={() => handleOpenModal(index)}
                  />
                ))}
              </div>
            </div>
          )}

          <Modal
            wrapClassName="my-custom-modal"
            open={isCarouselModalOpen}
            onCancel={handleCloseModal}
            footer={null}
            width={800}
            height={800}
          >
            <Carousel key={initialSlide} initialSlide={initialSlide}>
              {otherUser.photos.map((photo, index) => (
                <div key={index}>
                  <img
                    src={photo.url}
                    alt={`User photo ${index + 1}`}
                    style={{ width: "100%" }}
                  />
                </div>
              ))}
            </Carousel>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
