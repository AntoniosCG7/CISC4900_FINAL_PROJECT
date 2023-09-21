import { useState } from "react";
import "./Navbar.css";
import logo from "/../public/assets/logo-white.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="header">
        <a href="Home" className="logo">
          <img src={logo} alt="logo" className="rotate-vert-center" />
        </a>

        <ul className={`navbar ${isMenuOpen ? "open" : ""}`}>
          <li>
            <a href="Home" className="active">
              Home
            </a>
          </li>
          <li>
            <a href="About">About Us</a>
          </li>
          <li>
            <a href="Contact">Contact</a>
          </li>
        </ul>

        <div className="navbar_buttons">
          <a href="Login">
            <button id="login-btn">LOG IN</button>
          </a>
          <a href="Register">
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
