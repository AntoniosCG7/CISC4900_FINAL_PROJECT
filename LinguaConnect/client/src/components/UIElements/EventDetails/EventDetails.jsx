import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import GroupsIcon from "@mui/icons-material/Groups";
import { addAlert } from "../../../slices/alertSlice";

const EventDetails = ({ event }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const updatedEvent = useSelector((state) =>
    state.events.allEvents.find((e) => e._id === event.id)
  );
  const goingCount = updatedEvent?.goingCount || event.goingCount || 0;
  const interestedCount =
    updatedEvent?.interestedCount || event.interestedCount || 0;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStatusChange = async (status) => {
    const eventId = event.id;
    const userId = currentUser._id;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/events/updateUserEventStatus",
        { eventId, userId, status },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        dispatch(
          addAlert({
            message: response.data.message,
            type: "success",
          })
        );
      } else if (response.data.status === "info") {
        dispatch(
          addAlert({
            message: response.data.message,
            type: "info",
          })
        );
      } else {
        dispatch(
          addAlert({
            message: response.data.message,
            type: "error",
          })
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An error occurred while updating the event status.";
      console.error("Error updating status:", error);
      dispatch(
        addAlert({
          message: message,
          type: "error",
        })
      );
    }
  };

  // Format Date
  function formatDate(dateString) {
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(Date.UTC(year, month - 1, day));
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    };

    return date.toLocaleDateString("en-US", options);
  }

  // Format Time to 12-hour format with AM/PM
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hoursIn12HourFormat = ((parseInt(hours) + 11) % 12) + 1;
    const amPm = hours >= 12 ? "PM" : "AM";
    return `${hoursIn12HourFormat}:${minutes} ${amPm}`;
  };

  return (
    <Box
      className="event-details-container"
      sx={{
        padding: "10px",
        width: "100%",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        animation: "scale-in-center 0.2s ease-in-out",
      }}
    >
      <Box className="event-details">
        {/* Details Section */}
        <Typography
          variant="h5"
          component="h3"
          sx={{ fontSize: "30px", fontWeight: "bold", mb: 1 }}
        >
          {event.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#666", fontSize: "18px", fontWeight: "400", mb: 1 }}
        >
          {event.description}
        </Typography>

        <Box>
          <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>
            Date: {formatDate(event.date)}
          </Typography>
          <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>
            Time: {formatTime(event.time)}
          </Typography>
          <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>
            Languages: {event.languages.map((lang) => lang.name).join(", ")}
          </Typography>
          <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>
            Location: {event.location.address}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography sx={{ mr: 1, fontWeight: "bold", fontSize: "24px" }}>
            Hosted by:
          </Typography>
          <Avatar
            alt="Creator's Profile Picture"
            src={event.createdBy.profilePicture.url}
            onClick={() => navigate(`/profile/${event.createdBy._id}`)}
            sx={{
              width: 36,
              height: 36,
              cursor: "pointer",
            }}
          />
        </Box>

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            my: 1,
          }}
        />

        {/* Counts section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 1,
          }}
        >
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" component="p" sx={{ fontWeight: "bold" }}>
              {goingCount} {/* Dynamic count for "going" */}
            </Typography>
            <Typography variant="subtitle2">GOING</Typography>
          </Box>

          <Box sx={{ flex: 1, textAlign: "center" }}>
            <GroupsIcon
              sx={{ fontSize: "50px", color: "var(--secondary-color)" }}
            />
          </Box>

          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" component="p" sx={{ fontWeight: "bold" }}>
              {interestedCount} {/* Dynamic count for "interested" */}
            </Typography>
            <Typography variant="subtitle2">INTERESTED</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            my: 1,
          }}
        />

        {/* Event options */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2,
            mb: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleStatusChange("going")}
            sx={{
              mr: 1,
              width: "50%",
              backgroundColor: "var(--primary-color)",
              "&:hover": {
                backgroundColor: "#d9a300",
              },
            }}
          >
            Going
          </Button>
          <Button
            variant="contained"
            onClick={() => handleStatusChange("interested")}
            sx={{ width: "50%" }}
          >
            Interested
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EventDetails;
