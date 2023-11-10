import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useLoading } from "../../../contexts/LoadingContext";

const GoogleMap = () => {
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const [mapCenter, setMapCenter] = useState();
  const { setLoading } = useLoading();

  // Get current user's location from Redux store to set map center if user denies location access
  const userLocationFromDb = useSelector(
    (state) => state.auth.user.location.coordinates
  );

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
  }, [setLoading]);

  if (!mapCenter) {
    return <div></div>;
  }

  return (
    <>
      <Map zoom={14} center={mapCenter} mapId={MAP_ID}></Map>
    </>
  );
};

export default GoogleMap;
