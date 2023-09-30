import React, { useState, useEffect } from "react";
import ProfileImageUpload from "../ProfileImageUpload/ProfileImageUpload";
import LocationsAutocomplete from "../LocationsAutocomplete/LocationsAutocomplete";
import Select from "react-select";
import "./ProfileCreationForm.css";

function ProfileCreationForm() {
  const dateInputRef = React.useRef(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState([]);
  const [fluentLanguages, setFluentLanguages] = useState([]);
  const [learningLanguages, setLearningLanguages] = useState([]);
  const [talkAbout, setTalkAbout] = useState("");
  const [perfectPartner, setPerfectPartner] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [location, setLocation] = useState(null);
  const languageOptions = availableLanguages.map((lang) => ({
    value: lang,
    label: lang,
  }));

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
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a FormData object to send form data
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("nativeLanguage", nativeLanguage);
    formData.append("fluentLanguages", fluentLanguages);
    formData.append("learningLanguages", learningLanguages);
    formData.append("talkAbout", talkAbout);
    formData.append("perfectPartner", perfectPartner);
    formData.append("learningGoals", learningGoals);

    // Add location data to the formData object
    if (location) {
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);
      formData.append("fullAddress", location.fullAddress);
    }

    // formData.append("latitude", location.lat);
    // formData.append("longitude", location.lng);
    // formData.append("fullAddress", location.fullAddress);

    // Log the form data for debugging purposes
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Send formData to the server for processing (via a POST request)
    // fetch("http://localhost:3000/api/v1/createProfile", {
    //   method: "POST",
    //   body: formData,
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Success:", data);
    //     // Redirect to the profile page
    //     window.location.href = "/profile";
    //   })
    //   .catch((error) => {
    //     console.error("Error:", error);
    //   });

    // Maybe I should use libraries like Axios to make the HTTP request.
    // axios.post('/api/createProfile', formData).then(response => { ... });
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      border: "3px solid var(--primary-color)",
      boxShadow: "none",
      backgroundColor: "#e0e0e0",
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
              className="date-input"
              placeholder="mm/dd/yyyy"
              ref={dateInputRef}
              onInput={handleDateInputChange}
              onBlur={handleDateInputChange}
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
              options={languageOptions}
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
              options={languageOptions}
              classNamePrefix="select"
              value={fluentLanguages.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              onChange={(selected) =>
                setFluentLanguages(selected.map((item) => item.value))
              }
              required
            />

            <br />

            {/* Learning Languages */}
            <label htmlFor="learningLanguages">Learning:</label>
            <Select
              isMulti
              styles={customStyles}
              name="learningLanguages"
              options={languageOptions}
              classNamePrefix="select"
              value={learningLanguages.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              onChange={(selected) =>
                setLearningLanguages(selected.map((item) => item.value))
              }
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
              What’s your perfect LinguaConnect partner like?
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
            <ProfileImageUpload onImageSelected={handleImageSelected} />
          </fieldset>

          <button type="submit" className="profile-creation-button">
            Create Profile
          </button>
        </form>
      </div>
    </>
  );
}

export default ProfileCreationForm;
