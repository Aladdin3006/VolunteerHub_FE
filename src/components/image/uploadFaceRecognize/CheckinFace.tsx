import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import Webcam from "react-webcam";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  phaseId: string;
  phaseDayId: string;
  onSuccess: () => void;
}

const CheckinFaceModal: React.FC<Props> = ({
  open,
  onClose,
  campaignId,
  phaseId,
  phaseDayId,
  onSuccess,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckin = async () => {
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
    const fastAPIurl = import.meta.env.VITE_FAST_API

    try {
      setLoading(true);
      const res = await axios.post(`${fastAPIurl}/checkin`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.status || "✅ Check-in thành công!");
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || "❌ Lỗi khi check-in bằng khuôn mặt";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>🧍‍♂️ Xác nhận khuôn mặt</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 480, height: 360 }}
            style={{ borderRadius: 8, marginTop: 8, transform: "scaleX(-1)" }}

          />
          <Typography variant="body2" mt={1} color="text.secondary">
            Đảm bảo mặt bạn rõ nét và không bị ngược sáng nhé 😎
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleCheckin}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckinFaceModal;
