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
import { useLoading } from "../../../contexts/LoadingContext";
// import mapStyles from "./mapStyles";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const MyMap = () => {
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

  const handleMapClick = (event) => {
    setEventLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    setShowEventForm(true);
  };

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
        {showEventForm && (
          <InfoWindowF
            position={eventLocation}
            onCloseClick={() => setShowEventForm(false)}
          >
            <EventForm
              location={eventLocation}
              onClose={() => setShowEventForm(false)}
            />
          </InfoWindowF>
        )}
      </GoogleMap>
    </>
  );
};

export default MyMap;
