import React, { useState } from "react";
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

const GoogleMap = () => {
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const position = { lat: 40.73061, lng: -73.935242 };
  const [open, setOpen] = useState(false);

  return (
    <>
      <Map zoom={13} center={position} mapId={MAP_ID}>
        <AdvancedMarker position={position} onClick={() => setOpen(true)}>
          <Pin
            background={"var(--primary-color)"}
            borderColor={"var(--secondary-color)"}
            glyphColor={"var(--secondary-color)"}
          />
        </AdvancedMarker>

        {open && (
          <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
            <div
              style={{
                padding: "5px",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              THIS IS AN EVENT!
            </div>
          </InfoWindow>
        )}
      </Map>
    </>
  );
};

export default GoogleMap;
