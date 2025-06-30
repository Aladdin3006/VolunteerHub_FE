import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import Webcam from "react-webcam";

import authService from "../../../services/Authentication.service";

const CheckinFace = () => {
  const webcamRef = useRef<Webcam>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status?: string; distance?: number; error?: string }>({});

  useEffect(() => {
    const user = authService.getUser();
    const id = user?._id || user?.id;
    if (id) setUserId(id);
    else setResult({ error: "Không tìm thấy user ID, vui lòng đăng nhập lại." });
  }, []);

  const captureAndCheckin = async () => {
    if (!userId || !webcamRef.current) {
      setResult({ error: "Không có user ID hoặc webcam không hoạt động." });
      return;
    }

    const video = webcamRef.current.video;
    if (!video) {
      setResult({ error: "Không tìm thấy video từ webcam." });
      return;
    }

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
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Check-in bằng khuôn mặt
      </Typography>

      <Box sx={{ position: "relative", width: "100%", aspectRatio: "4 / 3" }}>
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

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={captureAndCheckin}
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Chụp và Check-in"}
      </Button>

      {result.status && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {result.status} <br />
          📏 Khoảng cách: {result.distance?.toFixed(4)}
        </Alert>
      )}

      {result.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {result.error}
        </Alert>
      )}
    </Box>
  );
};

export default CheckinFace;