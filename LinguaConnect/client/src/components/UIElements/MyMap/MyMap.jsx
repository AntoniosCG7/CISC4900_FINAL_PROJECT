import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { GoogleMap, InfoWindowF } from "@react-google-maps/api";
import EventForm from "../../FormElements/EventForm/EventForm";
import MapAutocompleteSearchBox from "../../FormElements/MapAutocompleteSearchBox/MapAutocompleteSearchBox";
import { useLoading } from "../../../contexts/LoadingContext";
import axios from "axios";
// import mapStyles from "./mapStyles";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const MyMap = () => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const mapRef = useRef(null);
  const { setLoading } = useLoading();
  const [mapCenter, setMapCenter] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventLocation, setEventLocation] = useState(null);
  const options = useMemo(
    () => ({
      mapId: MAP_ID,
      disableDefaultUI: true,
      clickableIcons: false,
      zoomControl: true,
      // styles: mapStyles,
    }),
    []
  );
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Get current user's location from Redux store to set map center if user denies location access
  const userLocationFromDb = useSelector(
    (state) => state.auth.user.location.coordinates
  );

  // Update eventLocation state
  const updateEventLocation = (newLocation) => {
    setEventLocation(newLocation);
  };

  // This function uses the Google Maps Geocoding API to convert coordinates into an address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const address = response.data.results[0]?.formatted_address;
      return address;
    } catch (error) {
      console.error("Error fetching address:", error);
      return "";
    }
  };

  // This function is called when the user clicks on the map
  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const address = await reverseGeocode(lat, lng);

    setEventLocation({ lat, lng, address });
    setShowEventForm(true);
  };

  // This function is called when the user selects a place from the search box
  const handlePlaceSelection = (location) => {
    setEventLocation(location);
    setShowEventForm(true);
  };

  // Get current user's location and set map center
  useEffect(() => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setMapCenter({
          lat: userLocationFromDb[1],
          lng: userLocationFromDb[0],
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, [setLoading, userLocationFromDb]);

  return (
    <>
      <GoogleMap
        center={mapCenter}
        zoom={14}
        onClick={handleMapClick}
        mapContainerStyle={containerStyle}
        options={options}
        onLoad={onLoad}
      >
        <MapAutocompleteSearchBox onPlaceSelected={handlePlaceSelection} />
        {showEventForm && (
          <InfoWindowF
            position={eventLocation}
            onCloseClick={() => setShowEventForm(false)}
          >
            <EventForm
              eventLocation={eventLocation}
              updateEventLocation={updateEventLocation}
              onClose={() => setShowEventForm(false)}
            />
          </InfoWindowF>
        )}
      </GoogleMap>
    </>
  );
};

export default MyMap;
