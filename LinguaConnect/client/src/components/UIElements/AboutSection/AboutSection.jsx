import React from "react";
import { Typography, Paper } from "@mui/material";

const AboutSection = () => {
  return (
    <Paper
      elevation={0}
      style={{
        width: "100%",
        padding: "20px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        About Me
      </Typography>
      <Typography variant="body1" paragraph>
        Hi, I'm Antonios, the creator of LinguaConnect. My journey as an
        immigrant has been instrumental in shaping this platform. I've
        experienced the challenges of language barriers and the joy of cultural
        exchanges, inspiring me to develop LinguaConnect – a platform dedicated
        to turning language learning into a community-building experience.
      </Typography>

      <Typography variant="h4" gutterBottom>
        My Mission
      </Typography>
      <Typography variant="body1" paragraph>
        My mission with LinguaConnect is to redefine the experience of language
        learning. I aim to provide an engaging and user-friendly platform where
        language practice and cultural exchange can flourish. The vision is to
        create a space where every language learner can form meaningful
        connections, making their learning journey as enriching as the knowledge
        itself.
      </Typography>

      <Typography variant="h4" gutterBottom>
        Inspired by Diversity
      </Typography>
      <Typography variant="body1" paragraph>
        The vibrant diversity of New York City is the heartbeat behind
        LinguaConnect. This melting pot of languages and cultures has been a
        significant inspiration in shaping the vision of LinguaConnect. In this
        city of endless possibilities, my goal is to turn every interaction into
        a learning opportunity and a chance for connection.
      </Typography>
    </Paper>
  );
};

export default AboutSection;
