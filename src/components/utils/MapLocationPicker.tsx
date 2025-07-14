import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Box, BoxProps } from "@mui/material";

export interface ICoordinates {
  lat: number;
  lng: number;
}

interface IProps extends BoxProps {
  defaultLocation?: ICoordinates;
  onPick?: (location: ICoordinates) => void;
  mapHeight?: string;
  mapWidth?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY || "";

const DEFAULT_CENTER: ICoordinates = {
  lat: 21.028511,
  lng: 105.804817,
};

const MapLocationPicker = React.forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const {
      defaultLocation,
      onPick,
      mapHeight = "400px",
      mapWidth = "100%",
      ...rest
    } = props;
    const mapRef = useRef<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<ICoordinates>(
      defaultLocation || DEFAULT_CENTER
    );

    const { isLoaded } = useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: API_KEY,
    });

    const onMapLoad = useCallback((map: google.maps.Map) => {
      mapRef.current = map;
    }, []);

    useEffect(() => {
      const map = mapRef.current;
      if (defaultLocation && map) {
        setMarker(defaultLocation);
        map.panTo(defaultLocation);
      }
    }, [defaultLocation]);

    const handleMapClick = useCallback(
      (event: google.maps.MapMouseEvent) => {
        const map = mapRef.current;
        if (!event.latLng) return;
        if (!onPick || !map) return;

        const newLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };

        setMarker(newLocation);
        map.panTo(newLocation);
        onPick(newLocation);
      },
      [onPick]
    );

    if (!isLoaded) return <Box>Loading map...</Box>;

    return (
      <Box
        ref={ref}
        {...rest}
        sx={{ height: mapHeight, width: mapWidth, ...rest.sx }}
      >
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%",
          }}
          center={marker}
          zoom={14}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          <Marker position={marker} />
        </GoogleMap>
      </Box>
    );
  }
);

export default MapLocationPicker;
