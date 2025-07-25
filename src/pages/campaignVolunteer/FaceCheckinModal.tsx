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
import { getCampaignVolunteerDetail } from "@/apis/campaign";

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  phaseId: string;
  phaseDayId: string;
  
}

// ✅ Hàm tính khoảng cách Haversine
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
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [distanceToCheckpoint, setDistanceToCheckpoint] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isWithinRange, setIsWithinRange] = useState(false);

  useEffect(() => {
    const fetchLocationAndCompare = async () => {
      setLoadingLocation(true);
      try {
        const campaign = await getCampaignVolunteerDetail(campaignId);
        const [lng, lat] = campaign.location.coordinates; // MongoDB trả về [lng, lat]

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;

            console.log("📍 Tọa độ người dùng:", userLat, userLng);
            console.log("🎯 Tọa độ điểm check-in:", lat, lng);

            // ✅ Sửa đúng thứ tự tham số truyền vào
            const distance = haversineDistance(userLat, userLng, lat, lng);

            setDistanceToCheckpoint(distance);
            setIsWithinRange(distance <= 100);
            setLoadingLocation(false);
          },
          (err) => {
            console.error("❌ Không lấy được vị trí:", err);
            setLoadingLocation(false);
          }
        );
      } catch (err) {
        console.error("❌ Lỗi lấy campaign:", err);
        setLoadingLocation(false);
      }
    };

    if (open) fetchLocationAndCompare();
  }, [open, campaignId]);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;

    if (!imageSrc || !userId) {
      alert("❌ Không thể lấy ảnh hoặc user");
      return;
    }

    const base64Image = imageSrc.split(",")[1];

    const payload = {
      image: base64Image,
      user_id: userId,
      campaignId,
      phaseId,
      phasedayId: phaseDayId,
      method: "face",
    };

    try {
      const res = await axios.post("http://localhost:8000/checkin", payload);
      alert(res.data.status || "✅ Check-in thành công!");
      onClose();
    } catch (err) {
      console.error("❌ Lỗi khi gửi check-in:", err);
      alert("❌ Lỗi khi check-in bằng khuôn mặt");
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
                ⚠️ Bạn đang ở quá xa điểm check-in. Vui lòng di chuyển gần hơn (≤
                100m).
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
          disabled={!isWithinRange || loadingLocation}
        >
          Check-in
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaceCheckinModal;
