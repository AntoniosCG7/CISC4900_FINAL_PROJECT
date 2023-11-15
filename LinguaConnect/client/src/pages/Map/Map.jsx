import React, { useState } from "react";
import { useSelector } from "react-redux";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { MiniNavBar, MinimalSelect, EventList, MyMap } from "../../components";

const Map = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = useState("created");

  return (
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
        <EventList
          selectedCategory={selectedCategory}
          userId={currentUser._id}
        />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <MyMap />
      </Box>
    </Box>
  );
};

export default Map;
