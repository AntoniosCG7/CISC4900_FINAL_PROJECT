import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./MiniNavBar.css";

const MiniNavBar = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const redirectToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <>
      <div className="mini-navbar">
        <img
          src={
            currentUser.profilePicture.url || currentUser.profilePicture.default
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
    </>
  );
};

export default MiniNavBar;
