import { useState } from "react";
import { Link } from "react-router-dom";
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
        <Link to="/home" className="logo">
          <img src={logo} alt="logo" className="rotate-vert-center" />
        </Link>

        <ul className={`navbar ${isMenuOpen ? "open" : ""}`}>
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
        </ul>

        <div className="navbar_buttons">
          <Link to="/login">
            <button id="login-btn">LOG IN</button>
          </Link>
          <Link to="/register">
            <button id="register-btn">SIGN UP</button>
          </Link>
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
