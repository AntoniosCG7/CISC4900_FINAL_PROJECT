import React from "react";
import {
  Navbar,
  HeroSection,
  AboutFeatures,
  FeaturePreviews,
  AboutSection,
  ContactForm,
  Footer,
} from "../../components";
import "./Home.css";

const Home = () => {
  return (
    <>
      <Navbar />
      <div id="home-section">
        <HeroSection />
      </div>
      <div className="theme">
        <div className="about-features-container">
          <AboutFeatures />
        </div>
        <div className="feature-previews-container">
          <FeaturePreviews />
        </div>
        <div className="about-section-container" id="about-section">
          <AboutSection />
        </div>
        <div className="contact-container" id="contact-section">
          <ContactForm />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Home;
