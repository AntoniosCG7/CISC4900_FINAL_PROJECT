"use client";
import React, { useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

const Map = () => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const position = { lat: 40.73061, lng: -73.935242 };
  const [open, setOpen] = useState(false);
  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ height: "100vh", width: "80%" }}>
        <GoogleMap zoom={13} center={position} mapId={MAP_ID}>
          <AdvancedMarker position={position} onClick={() => setOpen(true)}>
            <Pin
              background={"#ffb500"}
              borderColor={"red"}
              glyphColor={"red"}
            />
          </AdvancedMarker>

          {open && (
            <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
              <div style={{ padding: "5px" }}>Hello World!</div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </APIProvider>
  );
};

export default Map;
