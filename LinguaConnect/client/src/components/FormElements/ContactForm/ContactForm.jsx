import React, { useState } from "react";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addAlert } from "../../../slices/alertSlice";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      dispatch(
        addAlert({
          message: "Please fill out all the fields",
          type: "error",
        })
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/emails/contact",
        formData
      );

      if (response.status === 200) {
        dispatch(
          addAlert({
            message: "Message sent successfully",
            type: "success",
          })
        );
      } else {
        dispatch(
          addAlert({
            message: "There was a problem sending your message",
            type: "error",
          })
        );
      }
    } catch (error) {
      console.error("There was an error sending the message", error);
      dispatch(
        addAlert({
          message: "There was a problem sending your message",
          type: "error",
        })
      );
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        backgroundColor: "var(--tertiary-color)",
        border: "2px solid var(--secondary-color)",
        borderRadius: "5px",
        marginTop: "2rem",
        marginBottom: "2rem",
        padding: "2rem",
      }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: "center", marginBottom: "1rem" }}
      >
        Get in Touch
      </Typography>
      <Typography
        variant="body1"
        sx={{ textAlign: "center", marginBottom: "2rem" }}
      >
        Have questions or want to learn more about LinguaConnect? Send me a
        message!
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="name"
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={{
            color: "var(--secondary-color)",
            backgroundColor: "var(--tertiary-color)",
            "& label.Mui-focused": {
              color: "var(--secondary-color)",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "var(--secondary-color)",
              },
              "&:hover fieldset": {
                borderColor: "var(--secondary-color)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--secondary-color)",
              },
            },
          }}
          onChange={handleInputChange}
        />

        <TextField
          name="email"
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={{
            color: "var(--secondary-color)",
            backgroundColor: "var(--tertiary-color)",
            "& label.Mui-focused": {
              color: "var(--secondary-color)",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "var(--secondary-color)",
              },
              "&:hover fieldset": {
                borderColor: "var(--secondary-color)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--secondary-color)",
              },
            },
          }}
          onChange={handleInputChange}
        />
        <TextField
          name="message"
          label="Message"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          sx={{
            color: "var(--secondary-color)",
            backgroundColor: "var(--tertiary-color)",
            "& label.Mui-focused": {
              color: "var(--secondary-color)",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "var(--secondary-color)",
              },
              "&:hover fieldset": {
                borderColor: "var(--secondary-color)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--secondary-color)",
              },
            },
          }}
          onChange={handleInputChange}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              fontWeight: "bold",
              color: "var(--tertiary-color)",
              backgroundColor: "var(--secondary-color)",
              marginTop: "1rem",
              "&:hover": {
                color: "var(--secondary-color)",
                backgroundColor: "var(--primary-color)",
                boxShadow: "0 0 30px var(--primary-color)",
              },
            }}
            onClick={handleSubmit}
          >
            Send Message
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ContactForm;
