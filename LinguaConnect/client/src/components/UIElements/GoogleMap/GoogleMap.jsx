import React, { useEffect, useState } from "react";
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

  // Dummy user location data (I will actually get this from the database later)
  const userLocationFromDb = {
    coordinates: [-74.0059728, 40.7127753], // New York, NY, USA
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
          lat: userLocationFromDb.coordinates[1],
          lng: userLocationFromDb.coordinates[0],
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
