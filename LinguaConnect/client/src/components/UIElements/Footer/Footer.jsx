import React from "react";
import { Box, Container, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "var(--secondary-color)",
        color: "white",
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          color="inherit"
          align="center"
          sx={{ pt: 1, pb: 1 }}
        >
          © {new Date().getFullYear()} LinguaConnect
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
