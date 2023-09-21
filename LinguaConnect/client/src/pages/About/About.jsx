import React from "react";
import { Navbar } from "../../components";

const About = () => {
  return (
    <>
      <div className="about">
        <Navbar />
        <div className="main-container">
          <h1>About Us</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
            euismod metus at semper.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
