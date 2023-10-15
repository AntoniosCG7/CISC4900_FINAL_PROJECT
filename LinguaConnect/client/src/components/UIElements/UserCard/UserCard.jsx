import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const redirectToProfile = () => {
    navigate(`/profile/${user._id}`);
  };

  // Display languages in a comma-separated list, with a "+" if there are more than 1
  const displayLanguages = (languages) => {
    const languageNames = languages.map((lang) => lang.name);

    if (languageNames.length <= 1) {
      return languageNames.join(", ");
    }
    const additionalLanguagesCount = languageNames.length - 1;
    return `${languageNames[0]}, +${additionalLanguagesCount}`;
  };

  // Truncate location string if it's too long
  const truncateLocation = (locationString, maxLength = 28) => {
    if (locationString.length <= maxLength) {
      return locationString;
    }
    return locationString.slice(0, maxLength - 3) + "...";
  };

  return (
    <div className="user-card" onClick={redirectToProfile}>
      <div className="user-card-image-container">
        <img
          src={user.profilePicture.url || user.profilePicture.default}
          alt="User profile"
          className="user-card-img"
        />
      </div>

      <h3 className="user-name-and-age">
        {user.firstName}, {user.age}
      </h3>

      <div className="location">
        <i className="fas fa-map-marker-alt"></i>{" "}
        {truncateLocation(user.location.locationString)}
      </div>

      <div className="user-details">
        <div className="language-list-details">
          <h3 className="label">Teaching:</h3>
          <p>
            {displayLanguages([
              ...user.languages.native,
              ...user.languages.fluent,
            ])}
          </p>
        </div>
        <div className="language-list-details">
          <h3 className="label">Learning:</h3>
          <p>{displayLanguages(user.languages.learning)}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
