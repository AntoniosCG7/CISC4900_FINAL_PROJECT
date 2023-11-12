import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Select from "react-select";
import DateSelect from "../DateSelect/DateSelect";
import "./EventForm.css";

const EventForm = ({ onClose, eventLocation }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [languages, setLanguages] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch("http://localhost:3000/api/v1/languages");
        const data = await response.json();
        const languageOptions = data.map((language) => ({
          value: language.name,
          label: language.name,
        }));
        setAvailableLanguages(languageOptions);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    }
    fetchLanguages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("createdBy", currentUser.username);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("time", time);
    formData.append(
      "languages",
      JSON.stringify(languages.map((lang) => lang.value))
    );
    formData.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [eventLocation.lng, eventLocation.lat],
      })
    );

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/events",
        formData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("Event created successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLanguages([]);
    onClose();
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      border: "3px solid var(--primary-color)",
      boxShadow: "none",
      backgroundColor: "#e0e0e0",
      fontSize: "1rem",
      fontWeight: "400",
      "&:hover": {
        cursor: "pointer",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--primary-color)"
        : state.isFocused
        ? "var(--primary-color)"
        : null,
      fontSize: "0.8rem",
      fontWeight: "400",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--primary-color)",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "0.7rem",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "black",
      ":hover": {
        backgroundColor: "red",
        cursor: "pointer",
      },
    }),
    menu: (base) => ({
      ...base,
      marginTop: "0",
    }),
    menuList: (base) => ({
      ...base,
      height: "200px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--secondary-color)",
      ":hover": {
        cursor: "pointer",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--secondary-color)",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "red",
        cursor: "pointer",
      },
    }),
  };

  return (
    <>
      <div className="event-form-container">
        <form onSubmit={handleSubmit}>
          <input
            className="event-form-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
          ></textarea>
          <Select
            options={availableLanguages}
            styles={customStyles}
            isMulti
            value={languages}
            onChange={setLanguages}
            isOptionDisabled={() => {
              return languages.length >= 5;
            }}
            placeholder="Select languages"
            required
          />
          <DateSelect />
          <input
            className="event-form-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <button type="submit" className="create-event-btn">
            Create Event
          </button>
        </form>
      </div>
    </>
  );
};

export default EventForm;
