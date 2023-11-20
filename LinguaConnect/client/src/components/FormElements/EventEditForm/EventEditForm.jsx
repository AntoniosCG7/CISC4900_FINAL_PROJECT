import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import DateSelect from "../DateSelect/DateSelect";
import TimeSelect from "../TimeSelect/TimeSelect";
import dayjs from "dayjs";
import dayjsPluginUTC from "dayjs-plugin-utc";
import Select from "react-select";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { addAlert } from "../../../slices/alertSlice";
import { useLoading } from "../../../contexts/LoadingContext";
import "./EventEditForm.css";

dayjs.extend(dayjsPluginUTC);

const EventEditForm = ({ eventId, onClose, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs());
  const [time, setTime] = useState(dayjs());
  const [languages, setLanguages] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });
  const autocompleteInputRef = useRef(null);
  const autocomplete = useRef(null); // useRef for the autocomplete instance
  const { setLoading } = useLoading();

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

  // Fetch event details from API and populate form fields
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/v1/events/${eventId}`,
          {
            withCredentials: true,
          }
        );
        const eventData = response.data.data.event;
        const fetchedDateString = eventData.date.split("T")[0]; // Remove time from date string to avoid timezone issues with dayjs.
        setTitle(eventData.title);
        setDescription(eventData.description);
        setDate(dayjs(fetchedDateString));
        setTime(dayjs(eventData.time, "HH:mm"));
        setLanguages(
          eventData.languages.map((language) => ({
            value: language.name,
            label: language.name,
          }))
        );
        setLocation({
          lat: eventData.location.coordinates[1],
          lng: eventData.location.coordinates[0],
          address: eventData.location.address,
        });
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, setLoading]);

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

  // This function handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
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

    try {
      const response = await axios.put(
        `http://localhost:3000/api/v1/events/${eventId}`,
        formData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        const updatedEvent = response.data.data.event;
        onUpdate(updatedEvent);
        dispatch(
          addAlert({
            message: "Event updated successfully",
            type: "success",
          })
        );
      }
    } catch (error) {
      dispatch(
        addAlert({
          message: "Error updating event",
          type: "error",
        })
      );
      console.error("Error updating event:", error);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      fontFamily: "var(--secondary-font-family)",
      border: "3px solid var(--primary-color)",
      boxShadow: "none",
      padding: "0.2rem",
      backgroundColor: "#e0e0e0",
      fontSize: "1rem",
      fontWeight: "bold",
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
      fontWeight: "bold",
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
      fontFamily: "var(--secondary-font-family)",
      marginTop: "0",
    }),
    menuList: (base) => ({
      ...base,
      height: "283px",
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
      <div className="event-edit-form-close-btn" onClick={onClose}>
        <CloseIcon />
      </div>
      <div className="event-edit-form-header">
        <h2>Edit Event</h2>
      </div>
      <div className="event-edit-form-container">
        <form className="event-edit-form" onSubmit={handleSubmit}>
          <input
            className="event-edit-form-title"
            type="text"
            name="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="event-edit-form-description"
            name="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="event-edit-form-languages">
            <Select
              className="event-edit-form-languages-select"
              styles={customStyles}
              isMulti
              name="languages"
              placeholder="Languages"
              value={languages}
              options={availableLanguages}
              onChange={(selectedLanguages) => setLanguages(selectedLanguages)}
              required
            />
          </div>
          <div className="event-edit-form-date-time">
            <DateSelect date={date} setDate={setDate} />
            <TimeSelect time={time} setTime={setTime} />
          </div>
          <div className="event-edit-form-address">
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
          </div>
          <Button
            variant="contained"
            type="submit"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--secondary-color)",
              gap: "5px",
              width: "100%",
            }}
          >
            Update Event
          </Button>
        </form>
      </div>
    </>
  );
};

export default EventEditForm;
