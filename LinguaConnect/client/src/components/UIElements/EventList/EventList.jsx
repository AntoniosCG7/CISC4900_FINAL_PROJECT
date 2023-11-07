import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

export const EventList = ({ selectedCategory }) => {
  const events = [
    {
      title: "Event Title (createdByMe)",
      summary: "Event Summary",
      category: "createdByMe",
    },
    {
      title: "Event Title (createdByMe)",
      summary: "Event Summary",
      category: "createdByMe",
    },
    {
      title: "Event Title (Going)",
      summary: "Event Summary",
      category: "Going",
    },
    {
      title: "Event Title (Going)",
      summary: "Event Summary",
      category: "Going",
    },
    {
      title: "Event Title (Interested)",
      summary: "Event Summary",
      category: "Interested",
    },
  ];
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const filteredEvents = events.filter(
    (event) => event.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <>
      <List
        sx={{
          width: "100%",
          maxHeight: "calc(100vh - 227.5px)",
          overflowY: "auto",
        }}
      >
        {filteredEvents.map((event, index) => (
          <ListItem key={event.id} disablePadding>
            <CardActionArea
              onClick={() => {
                setSelectedEvent(event);
                setOpenModal(true);
              }}
            >
              <Card sx={{ margin: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.summary}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          </ListItem>
        ))}
      </List>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            maxHeight: 800,
            bgcolor: "background.paper",
            border: "2px solid #000",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {selectedEvent?.title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {selectedEvent?.summary}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default EventList;
