import React, { useEffect, useRef } from "react";
import "./MapAutocompleteSearchBox.css";

const MapAutocompleteSearchBox = ({ onPlaceSelected }) => {
  const autocompleteInputRef = useRef(null);
  const autocomplete = useRef(null);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    autocomplete.current = new window.google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      { types: ["geocode"] }
    );

    autocomplete.current.addListener("place_changed", () => {
      const place = autocomplete.current.getPlace();

      if (!place.geometry) {
        console.error("Autocomplete's returned place contains no geometry");
        return;
      }

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
      };

      onPlaceSelected(location);
    });
  }, [onPlaceSelected]);

  return (
    <input
      className="map-autocomplete-search-box"
      ref={autocompleteInputRef}
      type="text"
      placeholder="Search location"
    />
  );
};

export default MapAutocompleteSearchBox;
