import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Select from "react-select";
import { Button } from "@mui/material";
import DateSelect from "../DateSelect/DateSelect";
import TimeSelect from "../TimeSelect/TimeSelect";
import dayjs from "dayjs";
import { addEvent } from "../../../slices/eventSlice";
import { addAlert } from "../../../slices/alertSlice";
import "./EventForm.css";

const EventForm = ({ onClose, eventLocation, updateEventLocation }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs().add(1, "day"));
  const [time, setTime] = useState(dayjs());
  const [languages, setLanguages] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });
  const autocompleteInputRef = useRef(null);
  const autocomplete = useRef(null);
  const dispatch = useDispatch();

  // Fetch available languages from API
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

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (!autocomplete.current && window.google) {
      autocomplete.current = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current
      );

      autocomplete.current.addListener("place_changed", () => {
        const place = autocomplete.current.getPlace();

        if (!place.geometry) {
          console.error("Autocomplete's returned place contains no geometry");
          setLocation({ lat: null, lng: null, address: "" });
          return;
        }

        setLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
        });
      });
    }
  }, []);

  // Update address field when eventLocation changes
  useEffect(() => {
    if (eventLocation && eventLocation.address) {
      setLocation({ ...eventLocation });
    }
  }, [eventLocation]);

  // This function handles the "Update Location" button click
  const handleUpdateLocation = () => {
    if (location.lat && location.lng) {
      updateEventLocation({
        ...eventLocation,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      });
    } else {
      console.error(
        "Invalid location. Please select a location from the dropdown."
      );
    }
  };

  // This function handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("createdBy", currentUser.username);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date.format("YYYY-MM-DD"));
    formData.append("time", time.format("HH:mm"));
    languages.forEach((lang, index) => {
      formData.append(`languages[${index}]`, lang.value);
    });

    if (location.lat != null && location.lng != null && location.address) {
      formData.append(
        "location[coordinates]",
        `${location.lng},${location.lat}`
      );
      formData.append("location[address]", location.address);
    }

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
        const newEvent = {
          ...response.data.data.event,
          relationship: "created",
        };
        dispatch(addEvent({ event: newEvent, currentUserId: currentUser._id }));
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

  // This function resets the form fields and closes the form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLanguages([]);
    onClose();
  };

  // Custom styles for react-select
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
      height: "275px",
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
            className="event-form-description"
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
              return languages.length >= 8;
            }}
            placeholder="Select languages"
            required
          />
          <div className="event-form-date-time">
            <DateSelect date={date} setDate={setDate} />
            <TimeSelect time={time} setTime={setTime} />
          </div>
          <div className="event-form-address-container">
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                ref={autocompleteInputRef}
                className="event-form-address"
                type="text"
                name="address"
                value={location.address}
                onChange={(e) =>
                  setLocation({ ...location, address: e.target.value })
                }
                placeholder="Address"
              />
              <Button
                onClick={handleUpdateLocation}
                variant="contained"
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  height: "57px",
                  backgroundColor: "var(--primary-color)",
                  color: "var(--secondary-color)",
                  boxShadow: "none",
                  marginLeft: "5px",
                }}
              >
                Update Address
              </Button>
            </div>
          </div>
          <Button
            variant="contained"
            type="submit"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--secondary-color)",
              boxShadow: "none",
              gap: "5px",
              width: "100%",
            }}
          >
            Create Event
          </Button>
        </form>
      </div>
    </>
  );
};

export default EventForm;
