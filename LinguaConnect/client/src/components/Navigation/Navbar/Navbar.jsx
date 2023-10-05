import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../../slices/authSlice";
import { addAlert } from "../../../slices/alertSlice";
import "./Navbar.css";
import logo from "/assets/images/logo-white.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
            />
            <Link to="/profile">
              <button id="profile-btn">Profile</button>
            </Link>
            <button id="logout-btn" onClick={handleLogout}>
              Logout
            </button>
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
