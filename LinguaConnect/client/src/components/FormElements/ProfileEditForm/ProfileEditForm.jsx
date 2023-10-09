import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import axios from "axios";
import ProfileImageUpload from "../ProfileImageUpload/ProfileImageUpload";
import LocationsAutocomplete from "../LocationsAutocomplete/LocationsAutocomplete";
import { useNavigate } from "react-router-dom";
import { addAlert } from "../../../slices/alertSlice";
import { authError, updateUser } from "../../../slices/authSlice";
import PicturesWall from "../PicturesWall/PicturesWall";
import "./ProfileEditForm.css";

const ProfileEditForm = () => {
  const dateInputRef = React.useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [profilePicture, setProfilePicture] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const languageOptions = availableLanguages.map((lang) => ({
    value: lang,
    label: lang,
  }));

  // Fetch the user's data when the component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/me",
          { withCredentials: true }
        );
        const userData = response.data.data.user;

        // Set the states with fetched data
        setFirstName(userData.firstName);
        setLastName(userData.lastName);

        // Set the date of birth to the date part of the ISO string
        setDateOfBirth(userData.dateOfBirth.split("T")[0]);

        // Set the location state with the user's location data
        setLocation({
          lat: userData.location.coordinates[1],
          lng: userData.location.coordinates[0],
          fullAddress: userData.location.locationString,
        });

        // Set the language states with the user's language data
        setNativeLanguage(userData.languages.native.map((lang) => lang.name));
        setFluentLanguages(userData.languages.fluent.map((lang) => lang.name));
        setLearningLanguages(
          userData.languages.learning.map((lang) => lang.name)
        );

        setTalkAbout(userData.about.talkAbout);
        setPerfectPartner(userData.about.perfectPartner);
        setLearningGoals(userData.about.learningGoals);

        setProfilePicture(userData.profilePicture.url);

        // Set the existing photos state with the user's existing photos
        setExistingPhotos(userData.photos.map((photo) => photo.url));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }

    fetchUserData();
  }, []);

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
  }, []);

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

  // Add a class to the date input if it has a value
  const handleDateInputChange = () => {
    const input = dateInputRef.current;
    if (input && input.value) {
      input.classList.add("has-content");
    } else {
      input.classList.remove("has-content");
    }
  };

  // Handle image selection
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

    // Add each new photo to the formData
    newPhotos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });

    // Add each photo to delete to the formData
    photosToDelete.forEach((photoId, index) => {
      formData.append(`photosToDelete[${index}]`, photoId);
    });

    // Log the form data for debugging purposes
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const response = await axios.patch(
        "http://localhost:3000/api/v1/users/updateMe",
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
        // Update the user in the Redux store
        dispatch(updateUser(response.data.data.user));
        dispatch(
          addAlert({
            type: "success",
            message: `Profile updated successfully!`,
          })
        );
        navigate("/profile");
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
            : { message: "Error Updating Profile." }
        )
      );
      dispatch(
        addAlert({
          type: "error",
          message: "Error Updating Profile.",
        })
      );
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      border: "3px solid var(--primary-color)",
      boxShadow: "none",
      backgroundColor: "#e0e0e0",
      fontSize: "1.2rem",
      fontWeight: "bold",
      padding: "5px",
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
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--primary-color)",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "1.2rem",
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
    <div className="main-container">
      <h1 className="page-title">Edit Your Profile</h1>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <fieldset className="name-section">
            <legend>Name</legend>
            <label>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <label>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </fieldset>

          <fieldset className="date-of-birth-section">
            <legend>Date of Birth</legend>
            <input
              type="date"
              ref={dateInputRef}
              value={dateOfBirth}
              onInput={handleDateInputChange}
              onBlur={handleDateInputChange}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </fieldset>

          <fieldset className="location-section">
            <legend>Location</legend>
            <LocationsAutocomplete
              selectedLocation={location}
              onPlaceSelected={setLocation}
              required
            />
          </fieldset>

          <fieldset className="language-section">
            <legend>Languages</legend>
            <label>Native:</label>
            <Select
              options={nativeLanguageOptions}
              styles={customStyles}
              isMulti
              value={nativeLanguage.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              onChange={(selected) =>
                setNativeLanguage(selected.map((item) => item.value))
              }
              required
            />

            <label>Fluent:</label>
            <Select
              options={fluentLanguageOptions}
              styles={customStyles}
              isMulti
              value={fluentLanguages.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              onChange={(selected) =>
                setFluentLanguages(selected.map((item) => item.value))
              }
              required
            />

            <label>Learning:</label>
            <Select
              options={learningLanguageOptions}
              styles={customStyles}
              isMulti
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

          <fieldset className="about-section">
            <legend>About</legend>
            <label>What do you like to talk about?</label>
            <textarea
              value={talkAbout}
              onChange={(e) => setTalkAbout(e.target.value)}
              required
            />

            <label>What’s your perfect language-exchange partner like?</label>
            <textarea
              value={perfectPartner}
              onChange={(e) => setPerfectPartner(e.target.value)}
              required
            />

            <label>What are your language learning goals?</label>
            <textarea
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              required
            />
          </fieldset>

          <fieldset className="profile-picture-section">
            <legend>Profile Picture</legend>
            <ProfileImageUpload
              onImageSelected={handleImageSelected}
              initialImageUrl={profilePicture}
              required
            />
          </fieldset>

          <button type="submit" className="update-profile-button">
            Update Profile
          </button>
        </form>
      </div>

      <h1 className="page-title">Upload/Delete Photos</h1>

      <div className="pictures-wall-container">
        <form onSubmit={handleSubmit}>
          <fieldset className="photos-section">
            <div className="box-container">
              <PicturesWall
                existingPhotos={existingPhotos}
                onNewPhotosChange={(photos) => setNewPhotos(photos)}
                onPhotosToDeleteChange={(photos) => setPhotosToDelete(photos)}
              />
            </div>
          </fieldset>
          <button type="submit" className="upload-delete-photos-button">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;
