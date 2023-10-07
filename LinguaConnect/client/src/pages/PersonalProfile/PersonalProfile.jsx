import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import "./PersonalProfile.css";

const PersonalProfile = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/me",
          {
            withCredentials: true,
          }
        );
        setUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to fetch personal data:", error);
      }
    }

    fetchCurrentUser();
  }, []);

  const handleModalClick = (event) => {
    if (event.target.classList.contains("modal")) {
      setModalOpen(false);
    }
  };

  function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  if (!user) return <div>Loading...</div>; // This is necessary because the useEffect hook asynchronously fetches user data from an API endpoint. When the component first renders, the user state is null because the data hasn't been fetched yet. This conditional prevents the component from trying to render the user data before it's available.

  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null;

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
          {user.firstName} {user.lastName}, {age}
        </h1>
        <h2 className="user-location">
          <FontAwesomeIcon icon={faLocationDot} />{" "}
          {user.location.locationString}
        </h2>
        <div className="profile-details">
          <div className="profile-section">
            <h2 className="section-title">About {user.firstName}</h2>
            <p>
              <p className="about-question">What do you like to talk about?</p>
              <p className="about-answer">{user.about.talkAbout}</p>
            </p>
            <p>
              <p className="about-question">
                What’s your perfect language-exchange partner like?
              </p>
              <p className="about-answer">{user.about.perfectPartner}</p>
            </p>
            <p>
              <p className="about-question">
                What are your language learning goals?
              </p>
              <p className="about-answer">{user.about.learningGoals}</p>
            </p>
          </div>

          <div className="profile-section" id="languages">
            <h2 className="section-title">Languages</h2>
            <p>
              <p className="language-category">Native:</p>
              <p className="language-answer">
                {user.languages.native.map((lang) => lang.name).join(", ")}
              </p>
            </p>
            <p>
              <p className="language-category">Fluent:</p>
              <p className="language-answer">
                {user.languages.fluent.map((lang) => lang.name).join(", ")}
              </p>
            </p>
            <p>
              <p className="language-category">Learning:</p>
              <p className="language-answer">
                {user.languages.learning.map((lang) => lang.name).join(", ")}
              </p>
            </p>
          </div>
          {/* <div className="profile-section" id="photos">
            <h2 className="section-title">Photos</h2>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default PersonalProfile;
