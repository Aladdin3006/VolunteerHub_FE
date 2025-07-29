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

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  phaseId: string;
  phaseDayId: string;
  checkinLocation: {
    coordinates: [number, number]; // [lng, lat]
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
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
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
  const [distanceToCheckpoint, setDistanceToCheckpoint] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [loadingCheckin, setLoadingCheckin] = useState(false);

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

          // In tọa độ GPS của người dùng
          console.log("📍 User GPS Coordinates:", { latitude: userLat, longitude: userLng });

          // Tính khoảng cách Haversine
          const distance = haversineDistance(userLat, userLng, targetLat, targetLng);

          console.log("📍 Calculated distance:", distance.toFixed(2), "meters");
          setDistanceToCheckpoint(distance);
          setIsWithinRange(distance <= 150);
          setLoadingLocation(false);
        },
        (err) => {
          console.error("❌ Failed to get location:", err);
          setLoadingLocation(false);
          alert("Không thể lấy vị trí, vui lòng kiểm tra quyền truy cập vị trí.");
        }
      );
    };

    fetchLocationAndCompare();
  }, [open, checkinLocation?.coordinates]);

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
      console.log("🚀 Sending check-in data:", { ...payload, image: "[base64 data]" });
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
      const msg = err?.response?.data?.detail || "❌ Lỗi khi check-in bằng khuôn mặt";
      alert(msg);
    } finally {
      setLoadingCheckin(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>📸 Check-in khuôn mặt</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {loadingLocation ? (
          <CircularProgress />
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ width: 480, height: 360 }}
            />
            <Typography mt={2} mb={1}>
              📍 Khoảng cách đến điểm check-in:{" "}
              <strong>{distanceToCheckpoint?.toFixed(2)}m</strong>
            </Typography>
            {!isWithinRange && (
              <Typography color="error" fontStyle="italic" mb={2}>
                ⚠️ Bạn đang ở quá xa điểm check-in. Vui lòng di chuyển gần hơn (≤ 150m).
              </Typography>
            )}
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