import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { StormAPI } from "@/apis/storm.api";
// For map
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
`;

const StormTrigger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [stormData, setStormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    lat: "18.333",  // Tọa độ mặc định cho Hà Tĩnh
    lng: "105.900", // Tọa độ mặc định cho Hà Tĩnh
    startDate: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStormData({ ...stormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      name: stormData.name,
      description: stormData.description,
      imageUrl: stormData.imageUrl,
      isActive: true,
      startDate: new Date(stormData.startDate).toISOString(), // Convert to ISO string for consistency
      centerLocation: {
        lat: parseFloat(stormData.lat),
        lng: parseFloat(stormData.lng),
      },
    };

    try {
      await StormAPI.createStorm(payload);
      alert("🌪️ Đã kích hoạt bão thành công!");
      handleClose();
    } catch (err) {
      console.error("❌ Lỗi khi kích hoạt bão:", err);
      alert("❌ Lỗi khi kích hoạt bão!");
    }
  };

  function LocationFinder() {
    useMapEvents({
      click(e) {
        setStormData({
          ...stormData,
          lat: e.latlng.lat.toString(),
          lng: e.latlng.lng.toString(),
        });
      },
    });
    return null;
  }

  const position: [number, number] = [
    parseFloat(stormData.lat) || 18.333,  // Fallback nếu rỗng
    parseFloat(stormData.lng) || 105.900, // Fallback nếu rỗng
  ];

  return (
    <>
      {/* ☄️ Nút trigger */}
      <Button
        onClick={handleOpen}
        sx={{
          textTransform: "none",
          borderRadius: "50px",
          px: 0.5,
          py: "6px",
          fontWeight: "bold",
          fontSize: 14,
          border: "2px solid #f44336",
          color: "#f44336",
          minWidth: "unset",
          width: "fit-content",
          overflow: "hidden",
          whiteSpace: "nowrap",
          transition: "all 0.4s ease",
          boxShadow: "0 0 6px rgba(244, 67, 54, 0.4)",
          animation: `${shake} 2.5s infinite`,
          bgcolor: "#fff",
          "&:hover": {
            backgroundColor: "#f44336",
            color: "#fff",
            pl: 2,
            pr: 2,
            boxShadow: "0 0 14px rgba(244, 67, 54, 0.8)",
          },
          "& span": {
            display: "inline-block",
            opacity: 0,
            marginLeft: 0,
            maxWidth: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            transition: "all 0.3s ease",
          },
          "&:hover span": {
            opacity: 1,
            marginLeft: "8px",
            maxWidth: "300px",
          },
        }}
      >
        🌀<span> Kích Hoạt Bão</span>
      </Button>

      {/* 🌩️ Modal tạo bão */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>🌀 Tạo cơn bão mới</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Tên cơn bão"
              name="name"
              value={stormData.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Mô tả"
              name="description"
              value={stormData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Vĩ độ tâm bão (lat)"
              name="lat"
              value={stormData.lat}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Kinh độ tâm bão (lng)"
              name="lng"
              value={stormData.lng}
              onChange={handleChange}
              fullWidth
            />
            {/* Bản đồ để chọn vị trí */}
            <MapContainer
              center={position}
              zoom={9}  // Zoom mặc định để bao quát tỉnh Hà Tĩnh
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={position}
                draggable={true}
                eventHandlers={{
                  dragend(e) {
                    const { lat, lng } = e.target.getLatLng();
                    setStormData({
                      ...stormData,
                      lat: lat.toString(),
                      lng: lng.toString(),
                    });
                  },
                }}
              />
              <LocationFinder />
            </MapContainer>
            <TextField
              label="Thời gian bắt đầu (ISO format)"
              name="startDate"
              type="datetime-local"
              value={stormData.startDate}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="error">
            🌪️ Kích Hoạt
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StormTrigger;