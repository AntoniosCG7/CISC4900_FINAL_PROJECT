import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { GoogleMap, Marker, InfoWindowF } from "@react-google-maps/api";
import EventForm from "../../FormElements/EventForm/EventForm";
import MapAutocompleteSearchBox from "../../FormElements/MapAutocompleteSearchBox/MapAutocompleteSearchBox";
import { useLoading } from "../../../contexts/LoadingContext";
import axios from "axios";
import EventDetails from "../EventDetails/EventDetails";
// import mapStyles from "./mapStyles";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const MyMap = ({ events }) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventLocation, setEventLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const { setLoading } = useLoading();
  const dispatch = useDispatch();

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

  // This function is called when the user clicks on a marker
  const handleMarkerClick = (event) => {
    setSelectedEvent(event);
    setSelectedMarkerId(event._id);
  };

  // This function is called when the user selects a place from the search box
  const handlePlaceSelection = (location) => {
    setEventLocation(location);
    setShowEventForm(true);
  };

  // Set map center to user's location
  const fetchUserLocation = () => {
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
  };

  // Set map center to user's location on page load
  useEffect(() => {
    fetchUserLocation();
  }, [setLoading, userLocationFromDb]);

  // Update markers when event location changes
  useEffect(() => {
    const newMarkers = {};

    events.forEach((event) => {
      newMarkers[event._id] = {
        id: event._id,
        position: {
          lat: event.location.coordinates[1],
          lng: event.location.coordinates[0],
        },
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        languages: event.languages,
        createdBy: event.createdBy,
      };
    });

    setMarkers(Object.values(newMarkers));
  }, [events]);

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

        {selectedEvent && (
          <InfoWindowF
            position={selectedEvent.position}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <EventDetails event={selectedEvent} />
          </InfoWindowF>
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => handleMarkerClick(marker)}
            animation={google.maps.Animation.DROP}
            icon={{
              url: "public/assets/images/marker.png",
              scaledSize: new google.maps.Size(60, 60),
            }}
          />
        ))}
      </GoogleMap>
    </>
  );
};

export default MyMap;
