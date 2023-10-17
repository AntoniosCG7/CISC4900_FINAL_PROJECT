import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Modal, Carousel } from "antd";
import "./PublicProfile.css";

const PublicProfile = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

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

  const { userId } = useParams();
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/users/${userId}`,
          {
            withCredentials: true,
          }
        );

        setUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to fetch personal data:", error);
      }
    }

    fetchUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="main-container">
        <img
          src={user.profilePicture.url || user.profilePicture.default}
          alt="Profile"
          className="profile-picture"
          onClick={() => setModalOpen(true)}
        />
        {isModalOpen && (
          <div className="modal" onClick={handleModalClick}>
            <img
              src={user.profilePicture.url || user.profilePicture.default}
              className="modal-content"
            />
          </div>
        )}
        <h1 className="user-name-age">
          {user.firstName} {user.lastName}, {user.age}
        </h1>
        <h2 className="user-location">
          <FontAwesomeIcon id="location-icon" icon={faLocationDot} />{" "}
          {user.location.locationString}
        </h2>
        <div>
          <button id="chat-initiation-btn">Chat with {user.firstName}</button>
        </div>
        <div className="profile-details">
          <div className="profile-section">
            <h2 className="section-title">About {user.firstName}</h2>
            <div>
              <p className="about-question">What do you like to talk about?</p>
              <p className="about-answer">{user.about.talkAbout}</p>
            </div>
            <div>
              <p className="about-question">
                What’s your perfect language-exchange partner like?
              </p>
              <p className="about-answer">{user.about.perfectPartner}</p>
            </div>
            <div>
              <p className="about-question">
                What are your language learning goals?
              </p>
              <p className="about-answer">{user.about.learningGoals}</p>
            </div>
          </div>
          <div className="profile-section" id="languages">
            <h2 className="section-title">Languages</h2>
            <div>
              <p className="language-category">Native:</p>
              <p className="language-answer">
                {user.languages.native.map((lang) => lang.name).join(", ")}
              </p>
            </div>
            <div>
              <p className="language-category">Fluent:</p>
              <p className="language-answer">
                {user.languages.fluent.map((lang) => lang.name).join(", ")}
              </p>
            </div>
            <div>
              <p className="language-category">Learning:</p>
              <p className="language-answer">
                {user.languages.learning.map((lang) => lang.name).join(", ")}
              </p>
            </div>
          </div>
          {/* If the user has photos, render the photos section. If not, don't
          render anything. */}
          {user.photos && user.photos.length > 0 && (
            <div className="profile-section" id="photos">
              <h2 className="section-title">Photos</h2>
              <div className="photos-container">
                {user.photos.map((photo, index) => (
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
              {user.photos.map((photo, index) => (
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
