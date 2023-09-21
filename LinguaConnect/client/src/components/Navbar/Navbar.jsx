import { useState } from "react";
import "./Navbar.css";
import logo from "/assets/images/logo-white.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="header">
        <a href="home" className="logo">
          <img src={logo} alt="logo" className="rotate-vert-center" />
        </a>

        <ul className={`navbar ${isMenuOpen ? "open" : ""}`}>
          <li>
            <a href="home" className="active">
              Home
            </a>
          </li>
          <li>
            <a href="about">About Us</a>
          </li>
          <li>
            <a href="contact">Contact</a>
          </li>
        </ul>

        <div className="navbar_buttons">
          <a href="login">
            <button id="login-btn">LOG IN</button>
          </a>
          <a href="register">
            <button id="register-btn">SIGN UP</button>
          </a>
          <div
            className={`bx bx-menu ${isMenuOpen ? "bx-x" : ""}`}
            id="menu-icon"
            onClick={toggleMenu}
          ></div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
