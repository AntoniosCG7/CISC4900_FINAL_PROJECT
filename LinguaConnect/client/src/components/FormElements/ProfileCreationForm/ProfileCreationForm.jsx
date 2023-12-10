import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileImageUpload from "../ProfileImageUpload/ProfileImageUpload";
import LocationsAutocomplete from "../LocationsAutocomplete/LocationsAutocomplete";
import { addAlert } from "../../../slices/alertSlice";
import { authError, setUserOnAuthentication } from "../../../slices/authSlice";
import { useLoading } from "../../../contexts/LoadingContext";
import { Button } from "@mui/material";
import "./ProfileCreationForm.css";

function ProfileCreationForm() {
  const dateInputRef = React.useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [location, setLocation] = useState(null);
  const [nativeLanguage, setNativeLanguage] = useState([]);
  const [fluentLanguages, setFluentLanguages] = useState([]);
  const [learningLanguages, setLearningLanguages] = useState([]);
  const [talkAbout, setTalkAbout] = useState("");
  const [perfectPartner, setPerfectPartner] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const languageOptions = availableLanguages.map((lang) => ({
    value: lang,
    label: lang,
  }));
  const { loading, setLoading } = useLoading();

  // Using the useEffect hook to fetch languages when the component mounts
  useEffect(() => {
    fetch("http://localhost:3000/api/v1/languages")
      .then((response) => response.json())
      .then((data) => {
        const languageNames = data.map((language) => language.name);
        languageNames.sort();
        setAvailableLanguages(languageNames);
      })
      .catch((error) => {
        console.error("Error fetching languages:", error);
      });
  }, []); // The empty dependency array ensures this useEffect runs once when the component mounts

  // Return a filtered list of language options based on the provided exclusion list.
  const getFilteredOptions = (exclude = []) => {
    return availableLanguages
      .filter((lang) => !exclude.includes(lang))
      .map((lang) => ({ value: lang, label: lang }));
  };

  // Get options for the native language dropdown. Exclude any languages that are already selected in the fluent and learning categories.
  const nativeLanguageOptions = getFilteredOptions([
    ...fluentLanguages,
    ...learningLanguages,
  ]);

  // Get options for the fluent language dropdown. Exclude any languages that are already selected in the native and learning categories.
  const fluentLanguageOptions = getFilteredOptions([
    ...nativeLanguage,
    ...learningLanguages,
  ]);

  // Get options for the learning language dropdown. Exclude any languages that are already selected in the native and fluent categories.
  const learningLanguageOptions = getFilteredOptions([
    ...nativeLanguage,
    ...fluentLanguages,
  ]);

  const handleDateInputChange = () => {
    const input = dateInputRef.current;
    if (input && input.value) {
      input.classList.add("has-content");
    } else {
      input.classList.remove("has-content");
    }
  };

  const handleImageSelected = (selectedImageFile) => {
    setProfilePicture(selectedImageFile);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object to send form data
    const formData = new FormData();

    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("dateOfBirth", dateOfBirth);

    formData.append("nativeLanguage", nativeLanguage.join(","));
    formData.append("fluentLanguages", fluentLanguages.join(","));
    formData.append("learningLanguages", learningLanguages.join(","));

    formData.append("talkAbout", talkAbout);
    formData.append("perfectPartner", perfectPartner);
    formData.append("learningGoals", learningGoals);

    formData.append("profilePicture", profilePicture);

    // Add location data to the form data if it exists
    if (location) {
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);
      formData.append("fullAddress", location.fullAddress);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/v1/users/createProfile",
        formData,
        {
          withCredentials: true,
        }
      );
      if (
        response.status === 200 &&
        response.data &&
        response.data.status === "success"
      ) {
        const user = response.data.data.user;
        dispatch(setUserOnAuthentication(user));
        dispatch(
          addAlert({
            type: "success",
            message: `Profile complete! The world of languages awaits you, ${user.firstName}.`,
          })
        );
        navigate("/discover");
      } else {
        throw new Error("Server responded with an unsuccessful status");
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      dispatch(
        authError(
          error.response
            ? error.response.data
            : { message: "Error creating profile. Please try again." }
        )
      );
      dispatch(
        addAlert({
          type: "error",
          message: "Error creating profile. Please try again.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      border: "3px solid var(--primary-color)",
      boxShadow: "none",
      backgroundColor: "#e0e0e0",
      fontFamily: "var(--secondary-font-family)",
      fontSize: "20px",
      fontWeight: "bold",
      padding: "5px",
      "&:hover": {
        borderColor: "var(--primary-color)",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--primary-color)"
        : state.isFocused
        ? "var(--primary-color)"
        : null,
      fontFamily: "var(--secondary-font-family)",
      fontWeight: "bold",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--primary-color)",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "20px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "black",
      ":hover": {
        backgroundColor: "red",
        cursor: "pointer",
      },
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
      <h1 id="welcome-message">Welcome to LinguaConnect!</h1>
      <p id="page-title">Create Your Profile</p>

      <div className="profile-creation-container">
        <form onSubmit={handleSubmit} className="profile-creation-form">
          {/* Name Section */}
          <fieldset className="name-section">
            <legend>Full Name</legend>

            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter your first name..."
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              placeholder="Enter your last name..."
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </fieldset>

          {/* Date of Birth Section */}
          <fieldset className="date-of-birth-section">
            <legend>Date of Birth</legend>
            <input
              type="date"
              placeholder="mm/dd/yyyy"
              ref={dateInputRef}
              onInput={handleDateInputChange}
              onBlur={handleDateInputChange}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </fieldset>

          {/* Location Section */}
          <fieldset className="location-section">
            <legend>Location</legend>
            <LocationsAutocomplete onPlaceSelected={setLocation} />
          </fieldset>

          {/* Languages Section */}
          <fieldset className="language-section">
            <legend>Languages</legend>

            {/* Native Language */}
            <label htmlFor="nativeLanguages">Native:</label>
            <Select
              isMulti
              styles={customStyles}
              name="nativeLanguages"
              options={nativeLanguageOptions}
              classNamePrefix="select"
              value={nativeLanguage.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              onChange={(selected) =>
                setNativeLanguage(selected.map((item) => item.value))
              }
              required
            />

            <br />

            {/* Fluent Languages */}
            <label htmlFor="fluentLanguages">Fluent:</label>
            <Select
              isMulti
              styles={customStyles}
              name="fluentLanguages"
              options={fluentLanguageOptions}
              classNamePrefix="select"
              value={fluentLanguages.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              onChange={(selected) =>
                setFluentLanguages(selected.map((item) => item.value))
              }
            />

            <br />

            {/* Learning Languages */}
            <label htmlFor="learningLanguages">Learning:</label>
            <Select
              isMulti
              styles={customStyles}
              name="learningLanguages"
              options={learningLanguageOptions}
              classNamePrefix="select"
              value={learningLanguages.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              onChange={(selected) =>
                setLearningLanguages(selected.map((item) => item.value))
              }
              required
            />
          </fieldset>

          {/* About Section */}
          <fieldset className="about-section">
            <legend>About</legend>
            <label htmlFor="talkAbout">What do you like to talk about?</label>
            <textarea
              value={talkAbout}
              onChange={(e) => setTalkAbout(e.target.value)}
              maxLength="250"
              placeholder="E.g. Movies, music, travel, cultures, sports, books..."
              required
            ></textarea>
            <br />

            <label htmlFor="perfectPartner">
              What’s your perfect language-exchange partner like?
            </label>
            <textarea
              value={perfectPartner}
              onChange={(e) => setPerfectPartner(e.target.value)}
              maxLength="250"
              placeholder="E.g. Patient, friendly, shares my interests, proactive..."
              required
            ></textarea>
            <br />

            <label htmlFor="learningGoals">
              What are your language learning goals?
            </label>
            <textarea
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              maxLength="250"
              placeholder="E.g. Improve my pronunciation, learn everyday phrases, prepare for a language exam, be able to travel..."
              required
            ></textarea>
          </fieldset>

          {/* Profile Picture */}
          <fieldset className="profile-picture-section">
            <legend>Profile Picture</legend>
            <ProfileImageUpload
              onImageSelected={handleImageSelected}
              name="profilePicture"
            />
          </fieldset>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{
              fontWeight: "bold",
              backgroundColor: "var(--secondary-color)",
              width: "100%",
              padding: "10px 0",
              "&:hover": {
                color: "var(--secondary-color)",
                backgroundColor: "var(--primary-color)",
                boxShadow: "0 0 30px var(--primary-color)",
              },
            }}
          >
            Create Profile
          </Button>
        </form>
      </div>
    </>
  );
}

export default ProfileCreationForm;
