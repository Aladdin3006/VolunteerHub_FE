import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  phaseId: string;
  phaseDayId: string;
  checkinLocation: {
    coordinates: [number, number];
    address: string;
  };
  onCheckinSuccess?: (phaseDayId: string) => void;
}

// Hàm tính khoảng cách Haversine
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371e3; // Bán kính Trái Đất (mét)
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const FaceCheckinModal: React.FC<Props> = ({
  open,
  onClose,
  campaignId,
  phaseId,
  phaseDayId,
  checkinLocation,
  onCheckinSuccess,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [distanceToCheckpoint, setDistanceToCheckpoint] = useState<
    number | null
  >(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (!open || !checkinLocation?.coordinates) {
      setLoadingLocation(false);
      return;
    }


    // In tọa độ gốc của checkinLocation.coordinates
    console.log("📍 Raw PhaseDay Coordinates:", checkinLocation.coordinates);
    // In thông tin địa chỉ và tọa độ của phaseDay
    console.log("📍 PhaseDay Location:", {
      address: checkinLocation.address,
      coordinates: { longitude: checkinLocation.coordinates[0], latitude: checkinLocation.coordinates[1] },
    });

    const [targetLng, targetLat] = checkinLocation.coordinates;

    


    const fetchLocationAndCompare = () => {
      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setUserLocation([userLng, userLat]);


          // In tọa độ GPS của người dùng
          console.log("📍 User GPS Coordinates:", { latitude: userLat, longitude: userLng });

          // Tính khoảng cách Haversine
          const distance = haversineDistance(userLat, userLng, targetLat, targetLng);

          console.log("📍 Calculated distance:", distance.toFixed(2), "meters");

          const distance = haversineDistance(
            userLat,
            userLng,
            targetLat,
            targetLng
          );

          setDistanceToCheckpoint(distance);
          setIsWithinRange(distance <= 150);
          setLoadingLocation(false);
        },
        (err) => {
          console.error("❌ Failed to get location:", err);
          setLoadingLocation(false);
          alert(
            "Không thể lấy vị trí, vui lòng kiểm tra quyền truy cập vị trí."
          );
        }
      );
    };

    fetchLocationAndCompare();
  }, [open, checkinLocation?.coordinates]);

  useEffect(() => {
    if (!open || !checkinLocation?.coordinates || !mapContainerRef.current) {
      return;
    }

    const [targetLat, targetLng] = checkinLocation.coordinates;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapRef.current = L.map(mapContainerRef.current, {
      center: [targetLat, targetLng],
      zoom: 15,
      scrollWheelZoom: true, // Enable ctrl+scroll zooming
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Add phase day location marker (blue)
    L.marker([targetLat, targetLng], {
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .addTo(mapRef.current)
      .bindPopup("Điểm check-in")
      .openPopup();

    // Add range circle (green, 100m radius)
    L.circle([targetLat, targetLng], {
      color: "green",
      fillColor: "#00ff00",
      fillOpacity: 0.3,
      radius: 100,
    }).addTo(mapRef.current);

    // Add user location marker (red) if available
    if (userLocation) {
      const [userLng, userLat] = userLocation;
      L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          iconRetinaUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .addTo(mapRef.current)
        .bindPopup("Vị trí của bạn")
        .openPopup();
    }

    // Adjust map bounds if user location exists
    if (userLocation) {
      const [userLng, userLat] = userLocation;
      const bounds = L.latLngBounds([
        [targetLat, targetLng],
        [userLat, userLng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [open, checkinLocation?.coordinates, userLocation]);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const userId = user?.id;
    const token = user?.token;

    if (!imageSrc || !userId || !token) {
      alert("❌ Thiếu ảnh, thông tin người dùng hoặc token");
      return;
    }

    const base64Image = imageSrc.split(",")[1];

    if (!base64Image || base64Image.length < 10000) {
      alert("❌ Ảnh chụp quá mờ hoặc không hợp lệ, vui lòng thử lại!");
      return;
    }

    const payload = {
      image: base64Image,
      user_id: userId,
      campaignId,
      phaseId,
      phasedayId: phaseDayId,
      method: "face",
    };

    setLoadingCheckin(true);

    try {
      console.log("🚀 Sending check-in data:", {
        ...payload,
        image: "[base64 data]",
      });
      const res = await axios.post("http://localhost:8000/checkin", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.status || "✅ Check-in thành công!");

      if (typeof onCheckinSuccess === "function") {
        onCheckinSuccess(phaseDayId);
      }
      onClose();
    } catch (err: any) {
      console.error("❌ Error during check-in:", err);
      const msg =
        err?.response?.data?.detail || "❌ Lỗi khi check-in bằng khuôn mặt";
      alert(msg);
    } finally {
      setLoadingCheckin(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>📸 Check-in khuôn mặt</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {loadingLocation ? (
          <CircularProgress />
        ) : (
          <>
            <div
              ref={mapContainerRef}
              id="map"
              style={{
                width: "100%",
                height: "800px", // Increased height to 800px
                marginBottom: "0", // Remove bottom margin
                border: "1px solid #ccc",
                borderRadius: "4px",
                position: "relative",
                zIndex: 1,
              }}
            />
            <Typography mt={0} mb={1}>
              📍 Khoảng cách đến điểm check-in:{" "}
              <strong>{distanceToCheckpoint?.toFixed(2)}m</strong>
            </Typography>
            {!isWithinRange && (
              <Typography color="error" fontStyle="italic" mb={2}>
                ⚠️ Bạn đang ở quá xa điểm check-in. Vui lòng di chuyển gần hơn
                (≤ 150m).
              </Typography>
            )}
            <Typography fontStyle="italic">
              Vòng tròn bán kính 100m xung quanh điểm chiến dịch.
            </Typography>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ width: 480, height: 360 }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleCapture}
          variant="contained"
          color="primary"
          disabled={!isWithinRange || loadingLocation || loadingCheckin}
          startIcon={loadingCheckin ? <CircularProgress size={20} /> : null}
        >
          Check-in
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaceCheckinModal;
