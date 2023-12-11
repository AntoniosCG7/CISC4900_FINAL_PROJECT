import React from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "react-material-ui-carousel";
import { Paper, Button, Typography } from "@mui/material";

const FeaturePreviews = () => {
  const features = [
    {
      title: "Discover Language Partners",
      description:
        "Explore the community and discover potential language partners.",
      imagePath: "public/assets/images/discover.png",
    },
    {
      title: "User Profile",
      description:
        "Customize your profile to showcase your language skills and interests.",
      imagePath: "public/assets/images/profiles.png",
    },
    {
      title: "Real-Time Chat",
      description:
        "Connect and communicate with language learners globally in real-time.",
      imagePath: "public/assets/images/chat.png",
    },
    {
      title: "Interactive Map",
      description:
        "Find and join language events in your neighborhood or host your own.",
      imagePath: "public/assets/images/map.png",
    },
  ];

  const navigate = useNavigate();
  const handleJoinClick = () => {
    navigate("/register");
  };

  return (
    <>
      <Carousel sx={{ width: "100%" }}>
        {features.map((feature, index) => (
          <Paper
            key={index}
            style={{
              textAlign: "center",
              border: "2px solid var(--secondary-color)",
              borderRadius: "20px",
            }}
          >
            <img
              src={feature.imagePath}
              alt={feature.title}
              style={{
                width: "100%",
                height: "auto",
                marginBottom: "20px",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
              }}
            />
            <Typography variant="h4">{feature.title}</Typography>
            <Typography variant="body1" style={{ marginBottom: "20px" }}>
              {feature.description}
            </Typography>
            <Button
              className="CheckButton"
              sx={{
                fontWeight: "bold",
                color: "var(--tertiary-color)",
                backgroundColor: "var(--secondary-color)",
                width: "15%",
                padding: "10px 0",
                marginBottom: "20px",
                "&:hover": {
                  color: "var(--secondary-color)",
                  backgroundColor: "var(--primary-color)",
                  boxShadow: "0 0 30px var(--primary-color)",
                },
              }}
              onClick={handleJoinClick}
            >
              Check it out!
            </Button>
          </Paper>
        ))}
      </Carousel>
    </>
  );
};

export default FeaturePreviews;
