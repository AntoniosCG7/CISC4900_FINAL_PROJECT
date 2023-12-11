import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button } from "@mui/material";
import "./HeroSection.css";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate("/register");
  };

  return (
    <div className="hero-section">
      <Container>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "var(--secondary-font-family)",
            marginTop: "120px",
            marginBottom: "20px",
            color: "var(--tertiary-color)",
            animation:
              "focus-in-expand-fwd 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
          }}
        >
          Welcome to LinguaConnect
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: "var(--secondary-font-family)",
            marginBottom: "20px",
            color: "var(--tertiary-color)",
          }}
        >
          Join a vibrant community bridging language learning with cultural
          exchange. Discover local and global connections, engage in real-time
          language practice, and explore cultures right from your neighborhood.
          With LinguaConnect, every conversation is an opportunity to learn,
          share, and grow in a world of languages.
        </Typography>
        <Button
          variant="contained"
          sx={{
            fontWeight: "bold",
            backgroundColor: "var(--secondary-color)",
            width: "25%",
            padding: "10px 0",
            "&:hover": {
              color: "var(--secondary-color)",
              backgroundColor: "var(--primary-color)",
              boxShadow: "0 0 30px var(--primary-color)",
            },
          }}
          onClick={handleJoinClick}
        >
          Join the Community
        </Button>
      </Container>
    </div>
  );
};

export default HeroSection;
