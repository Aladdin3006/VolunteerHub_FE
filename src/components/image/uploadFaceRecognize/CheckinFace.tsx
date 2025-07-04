import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import Webcam from "react-webcam";
import authService from "../../../services/Authentication.service";

const CheckinFaceModal = () => {
  const webcamRef = useRef<Webcam>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status?: string; distance?: number; error?: string }>({});

  const handleOpen = () => {
    setResult({});
    setOpen(true);
  };

  const handleClose = () => {
    setResult({});
    setOpen(false);
  };

  const captureAndCheckin = async () => {
    const user = authService.getUser();
    const userId = user?._id || user?.id;
    const hasDescriptor = user?.faceDescriptor !== null;

    if (!userId) {
      setResult({ error: "Không tìm thấy user ID, vui lòng đăng nhập lại." });
      return;
    }

    if (!hasDescriptor) {
      setResult({ error: "Bạn chưa đăng ký khuôn mặt. Vui lòng đăng ký trước khi check-in." });
      return;
    }

    if (!webcamRef.current || !webcamRef.current.video) {
      setResult({ error: "Webcam không hoạt động hoặc không có hình ảnh." });
      return;
    }

    const video = webcamRef.current.video;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(video.videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageBase64 = canvas.toDataURL("image/jpeg");

    const body = {
      user_id: userId,
      image: imageBase64,
    };

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Check-in thất bại");

      setResult({ status: data.status, distance: data.distance });
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Check-in bằng khuôn mặt
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Check-in bằng khuôn mặt</DialogTitle>
        <DialogContent>
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "4 / 3", mt: 1 }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 8,
                transform: "scaleX(-1)",
                objectFit: "cover",
              }}
            />
            <Box
              component="img"
              src="/image/overlay/sucucu.png"
              alt="face frame"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 220,
                height: 300,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                opacity: 0.9,
              }}
            />
          </Box>

          {result.status && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ {result.status} <br />
              📏 Khoảng cách: {result.distance?.toFixed(4)}
            </Alert>
          )}

          {result.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              ❌ {result.error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
          <Button
            variant="contained"
            onClick={captureAndCheckin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Chụp và Check-in"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckinFaceModal;
