import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { logoutUser } from "../../../slices/authSlice";
import { resetChatState } from "../../../slices/chatSlice";
import { addAlert } from "../../../slices/alertSlice";
import "./MiniNavBar.css";

const MiniNavBar = () => {
  const user = useSelector((state) => state.auth.user);
  const userMenuRef = useRef(null);
  const userAvatarRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  useEffect(() => {
    if (isUserDropdownOpen) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isUserDropdownOpen]);

  const handleOutsideClick = (event) => {
    if (
      userAvatarRef.current &&
      !userAvatarRef.current.contains(event.target) &&
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target)
    ) {
      setIsUserDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(resetChatState());
    dispatch(
      addAlert({
        message: `Goodbye, ${user.firstName}!`,
        type: "success",
      })
    );
  };

  return (
    <>
      <div className="mini-navbar">
        <IconButton onClick={toggleUserDropdown} sx={{ p: 0 }}>
          <Avatar
            alt={user.firstName}
            src={
              user.profilePicture
                ? user.profilePicture.url
                : "client/public/assets/images/Default.png"
            }
            sx={{ width: 60, height: 60, border: "3px solid #fff" }}
          />
        </IconButton>
        <div className="mini-nav-options-container">
          <ul className="mini-nav-options">
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
        <div
          ref={userMenuRef}
          className={`mini-navbar-user-menu ${
            isUserDropdownOpen ? "open" : ""
          }`}
        >
          <h3>
            {user.firstName} {user.lastName}
          </h3>
          <ul>
            <li>
              <FontAwesomeIcon icon={faUser} className="icons" />
              <Link to="/profile">My Profile</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faUserPen} className="icons" />
              <Link to="/edit-profile">Edit Profile</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faGear} className="icons" />
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faRightFromBracket} className="icons" />
              <Link to="/login" onClick={handleLogout}>
                Log Out
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MiniNavBar;
