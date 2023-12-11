import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

const AboutFeatures = () => {
  return (
    <>
      <Grid
        container
        spacing={2}
        style={{ display: "flex", alignItems: "stretch" }}
      >
        {/* Intuitive User Profiles */}
        <Grid item xs={8} md={4} style={{ display: "flex" }}>
          <Card
            sx={{
              color: "var(--tertiary-color)",
              backgroundColor: "var(--secondary-color)",
              borderRadius: "20px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "var(--tertiary-color)",
                  fontFamily: "var(--secondary-font-family)",
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                Intuitive User Profiles
              </Typography>
              <Typography variant="body1" sx={{ padding: "0 1rem" }}>
                I designed the user profiles to help you discover language
                enthusiasts from around the world. They offer insights into
                language proficiency, interests, and cultural backgrounds,
                making it easy for you to find the perfect language exchange
                partner.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time Chat */}
        <Grid item xs={8} md={4} style={{ display: "flex" }}>
          <Card
            sx={{
              color: "var(--tertiary-color)",
              backgroundColor: "var(--secondary-color)",
              borderRadius: "20px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "var(--tertiary-color)",
                  fontFamily: "var(--secondary-font-family)",
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                Real-time Chat
              </Typography>
              <Typography variant="body1" sx={{ padding: "0 1rem" }}>
                My real-time chat feature allows you to engage in conversations
                with language partners globally. It's designed for a seamless
                experience, enabling you to practice your language skills and
                immerse yourself in diverse cultures.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Interactive Map */}
        <Grid item xs={8} md={4} style={{ display: "flex" }}>
          <Card
            sx={{
              color: "var(--tertiary-color)",
              backgroundColor: "var(--secondary-color)",
              borderRadius: "20px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "var(--tertiary-color)",
                  fontFamily: "var(--secondary-font-family)",
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                Interactive Map
              </Typography>
              <Typography variant="body1" sx={{ padding: "0 1rem" }}>
                The interactive map connects you with local language events and
                cultural exchanges in your neighborhood. It's a tool for
                fostering community ties and transforming language learning into
                a communal, enriching journey.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default AboutFeatures;
