import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Select from "react-select";
import DateSelect from "../DateSelect/DateSelect";
import TimeSelect from "../TimeSelect/TimeSelect";
import dayjs from "dayjs";
import { addAlert } from "../../../slices/alertSlice";
import "./EventForm.css";

const EventForm = ({ onClose, eventLocation }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs());
  const [time, setTime] = useState(dayjs());
  const [languages, setLanguages] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch("http://localhost:3000/api/v1/languages");
        const data = await response.json();
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        const languageOptions = sortedData.map((language) => ({
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
    formData.append("date", date.format("YYYY-MM-DD"));
    formData.append("time", time.format("HH:mm"));
    formData.append("description", description);
    languages.forEach((lang, index) => {
      formData.append(`languages[${index}]`, lang.value);
    });

    // formData.append(
    //   "location",
    //   JSON.stringify({
    //     type: "Point",
    //     coordinates: [eventLocation.lng, eventLocation.lat],
    //   })
    // );

    // Log the form data for debugging purposes
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/events",
        formData,
        { withCredentials: true }
      );
      if (response.status === 201) {
        console.log("Event created successfully");
        dispatch(
          addAlert({
            message: "Event created successfully",
            type: "success",
          })
        );
        resetForm();
      }
    } catch (error) {
      dispatch(
        addAlert({
          message: "Error creating event",
          type: "error",
        })
      );
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
      padding: "0.2rem",
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
          <DateSelect date={date} setDate={setDate} />
          <TimeSelect time={time} setTime={setTime} />
          <button type="submit" className="create-event-btn">
            Create Event
          </button>
        </form>
      </div>
    </>
  );
};

export default EventForm;
