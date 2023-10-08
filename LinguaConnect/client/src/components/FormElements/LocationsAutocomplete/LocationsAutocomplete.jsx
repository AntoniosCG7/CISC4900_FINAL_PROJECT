import React, { useEffect, useRef, useState } from "react";
import "./LocationsAutocomplete.css";

// Component for Google Places Autocomplete
const LocationsAutocomplete = ({ onPlaceSelected, selectedLocation }) => {
  const inputRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);

  useEffect(() => {
    // Initialize Google Places Autocomplete once the component is mounted
    if (window.google && window.google.maps && window.google.maps.places) {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["(cities)"],
        }
      );
      setAutocomplete(autocompleteInstance);

      // Add listener to capture the selected value
      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const fullAddress = place.formatted_address;
          if (onPlaceSelected) {
            onPlaceSelected({
              lat,
              lng,
              fullAddress,
            });
          }
        }
      });
    }
  }, []);

  // If there's a previously selected location, set it as the input value (for editing the profile)
  useEffect(() => {
    if (selectedLocation && inputRef.current) {
      inputRef.current.value = selectedLocation.fullAddress;
    }
  }, [selectedLocation]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter your location..."
      className="autofill-input"
      required
    />
  );
};

export default LocationsAutocomplete;
