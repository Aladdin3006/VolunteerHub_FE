import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { TextField, List, ListItem, Paper } from "@mui/material";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapLocationPickerProps {
  defaultLocation: { lat: number; lng: number };
  mapHeight?: string;
  onPick: (coords: { lat: number; lng: number; address?: string }) => void;
  hideSearchInput?: boolean;
  center?: { lat: number; lng: number } | null;
}

function RecenterMap({ pos }: { pos: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([pos.lat, pos.lng], map.getZoom(), { animate: true });
  }, [pos, map]);
  return null;
}

export default function MapLocationPicker({
  defaultLocation,
  mapHeight = "300px",
  onPick,
  hideSearchInput = false,
  center = null,
}: MapLocationPickerProps) {
  const [position, setPosition] = useState(defaultLocation);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={position} icon={markerIcon} />;
  }

  // nhận tọa độ mới từ form cha
  useEffect(() => {
    if (center) setPosition(center);
  }, [center]);

  useEffect(() => {
    if (hideSearchInput) return;
    if (query.length < 3) return;
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => setSuggestions(data))
      .catch(() => {});
    return () => controller.abort();
  }, [query, hideSearchInput]);

  const handleSelect = (s: any) => {
    const newPos = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
    setPosition(newPos);
    onPick({ ...newPos, address: s.display_name });
    setQuery(s.display_name);
    setSuggestions([]);
  };

  return (
    <div>
      {!hideSearchInput && (
        <div style={{ position: "relative" }}>
          <TextField fullWidth label="Địa chỉ" value={query} onChange={(e) => setQuery(e.target.value)} />
          {suggestions.length > 0 && (
            <Paper style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 2000, maxHeight: 220, overflowY: "auto" }}>
              <List>
                {suggestions.map((s, i) => (
                  <ListItem button key={i} onClick={() => handleSelect(s)}>
                    {s.display_name}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </div>
      )}

      <MapContainer center={position} zoom={13} style={{ height: mapHeight, width: "100%", marginTop: hideSearchInput ? 0 : 10 }}>
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* 👇 đảm bảo map recenter khi position thay đổi */}
        <RecenterMap pos={position} />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
