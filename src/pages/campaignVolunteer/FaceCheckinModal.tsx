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
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CheckinFaceModal from "@/components/image/uploadFaceRecognize/CheckinFace";

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
  const R = 6371e3;
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
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [distanceToCheckpoint, setDistanceToCheckpoint] = useState<
    number | null
  >(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  useEffect(() => {
    if (!open || !checkinLocation?.coordinates) {
      setLoadingLocation(false);
      return;
    }

    const [targetLng, targetLat] = checkinLocation.coordinates;

    const fetchLocationAndCompare = () => {
      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setUserLocation([userLng, userLat]);

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
          console.error("❌ Lỗi định vị:", err);
          setLoadingLocation(false);
          alert("Không thể lấy vị trí. Hãy bật quyền định vị nhé 🧭");
        }
      );
    };

    fetchLocationAndCompare();
  }, [open, checkinLocation?.coordinates]);

  useEffect(() => {
    if (!open || !checkinLocation?.coordinates || !mapContainerRef.current)
      return;

    const [targetLat, targetLng] = checkinLocation.coordinates;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapRef.current = L.map(mapContainerRef.current, {
      center: [targetLat, targetLng],
      zoom: 15,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Marker cho điểm check-in
    L.marker([targetLat, targetLng])
      .addTo(mapRef.current)
      .bindPopup("Điểm check-in")
      .openPopup();

    // Vòng tròn 100m
    L.circle([targetLat, targetLng], {
      color: "green",
      fillColor: "#00ff00",
      fillOpacity: 0.3,
      radius: 100,
    }).addTo(mapRef.current);

    // Vị trí người dùng
    if (userLocation) {
      const [userLng, userLat] = userLocation;
      L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      })
        .addTo(mapRef.current)
        .bindPopup("Vị trí của bạn")
        .openPopup();

      // Fit map
      const bounds = L.latLngBounds([
        [targetLat, targetLng],
        [userLat, userLng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [open, checkinLocation?.coordinates, userLocation]);

  const handleOpenCheckinFace = () => {
    setShowCheckinModal(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>📍 Check-in khuôn mặt</DialogTitle>
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
                style={{
                  width: "100%",
                  height: "800px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Typography mt={0} mb={1}>
                📏 Khoảng cách:{" "}
                <strong>{distanceToCheckpoint?.toFixed(2)}m</strong>
              </Typography>
              {!isWithinRange && (
                <Typography color="error" fontStyle="italic" mb={2}>
                  ⚠️ Bạn đang ở quá xa điểm check-in. Di chuyển gần hơn (≤ 150m)
                </Typography>
              )}
              <Typography fontStyle="italic">
                Vòng tròn xanh là bán kính 100m từ điểm chiến dịch 💚
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            onClick={handleOpenCheckinFace}
            variant="contained"
            disabled={!isWithinRange || loadingLocation}
          >
            Check-in
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal check-in bằng webcam */}
      <CheckinFaceModal
        open={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        campaignId={campaignId}
        phaseId={phaseId}
        phaseDayId={phaseDayId}
        onSuccess={() => {
          setShowCheckinModal(false);
          onCheckinSuccess?.(phaseDayId);
          onClose();
        }}
      />
    </>
  );
};

export default FaceCheckinModal;
