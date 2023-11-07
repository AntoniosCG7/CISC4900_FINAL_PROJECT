"use client";
import React, { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  MiniNavBar,
  MinimalSelect,
  EventList,
  GoogleMap,
} from "../../components";

const Map = () => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [selectedCategory, setSelectedCategory] = useState("createdByMe");

  return (
    <APIProvider apiKey={API_KEY}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Drawer
          sx={{
            width: "20%",
            height: "auto",
            maxHeight: "100vh",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "20%",
              backgroundColor: "var(--primary-color)",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <MiniNavBar />
          <Typography
            variant="h6"
            component="div"
            sx={{
              paddingTop: 2,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Events
          </Typography>
          <MinimalSelect
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <Divider />
          <EventList selectedCategory={selectedCategory} />
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <GoogleMap />
        </Box>
      </Box>
    </APIProvider>
  );
};

export default Map;
