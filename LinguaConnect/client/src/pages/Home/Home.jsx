import React from "react";
import { Navbar } from "../../components";
import "./Home.css";
// import heroImage from "../../assets/5.jpg";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="main-container">
        {/* <img src={heroImage} alt="hero-image" className="hero-image" /> */}
      </div>
      <footer>
        <p>&copy; {new Date().getFullYear()} Your Company Name</p>
      </footer>
    </>
  );
};

export default Home;
