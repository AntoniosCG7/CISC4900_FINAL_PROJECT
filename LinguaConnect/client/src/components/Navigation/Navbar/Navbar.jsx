import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../../slices/authSlice";
import { addAlert } from "../../../slices/alertSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";
import logo from "/assets/images/logo-white.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userAvatarRef = useRef(null);
  const userMenuRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // This effect sets up the listener when the dropdown is open and cleans up when it closes
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
    dispatch(
      addAlert({
        message: `Goodbye, ${user.firstName}!`,
        type: "success",
      })
    );
  };

  return (
    <>
      <header className="header">
        <Link to="/home" className="logo">
          <img src={logo} alt="logo" className="rotate-vert-center" />
        </Link>

        <ul className={`navbar ${isMenuOpen ? "open" : ""}`}>
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/discover">Discover</Link>
              </li>
              <li>
                <Link to="/chat">Chat</Link>
              </li>
              <li>
                <Link to="/map">Map</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/home" className="active">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </>
          )}
        </ul>

        {isAuthenticated ? (
          <div className="navbar_buttons">
            <img
              src={
                user.profilePicture
                  ? user.profilePicture.url
                  : "client/public/assets/images/Default.png"
              }
              alt="User Profile"
              className="user-avatar"
              ref={userAvatarRef}
              onClick={toggleUserDropdown}
            />
            <div
              ref={userMenuRef}
              className={`user-menu ${isUserDropdownOpen ? "open" : ""}`}
            >
              <h3>
                {user.firstName} {user.lastName}
              </h3>
              <ul>
                <li>
                  <FontAwesomeIcon icon={faUser} className="icons" />
                  <Link to="/my-profile">My Profile</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faGear} className="icons" />
                  <Link to="/settings">Settings</Link>
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="icons"
                  />
                  <Link to="/login" onClick={handleLogout}>
                    Log Out
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="navbar_buttons">
            <Link to="/login">
              <button id="login-btn">LOG IN</button>
            </Link>
            <Link to="/register">
              <button id="register-btn">SIGN UP</button>
            </Link>
          </div>
        )}

        <div
          className={`bx bx-menu ${isMenuOpen ? "bx-x" : ""}`}
          id="menu-icon"
          onClick={toggleMenu}
        ></div>
      </header>
    </>
  );
};

export default Navbar;
