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

interface RegisterFaceModalProps {
  onSuccess?: () => void; // Add callback prop
}

const RegisterFaceModal: React.FC<RegisterFaceModalProps> = ({ onSuccess }) => {
  const webcamRef = useRef<Webcam>(null);

  const [currentUser, setCurrentUser] = useState(authService.getUser());

  const userId = currentUser?._id || currentUser?.id;
  const hasRegistered = currentUser?.faceDescriptor !== null;

  const [open, setOpen] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status?: string; error?: string }>(
    {}
  );
  const fastAPIurl = import.meta.env.VITE_FAST_API;

  const captureImage = async () => {
    if (!webcamRef.current) return;
    const video = webcamRef.current.video;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(video.videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => blob && resolve(blob), "image/jpeg")
    );
    const previewUrl = canvas.toDataURL("image/jpeg");

    setImageBlob(blob);
    setPreview(previewUrl);
  };

  const handleRegister = async () => {
    if (!imageBlob || !userId) {
      setResponse({ error: "Thiếu ảnh hoặc user ID" });
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", imageBlob, "face.jpg");

    try {
      setLoading(true);
      const res = await fetch(`${fastAPIurl}/register`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đăng ký thất bại");

      // ✅ Cập nhật user trong localStorage + local state
      const updatedUser = { ...currentUser, faceDescriptor: true };
      authService.setUser(updatedUser);
      setCurrentUser(updatedUser); // ⚡ để UI re-render ngay

      setResponse({ status: data.status });

      // ✅ Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageBlob(null);
    setPreview(null);
    setResponse({});
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      {hasRegistered ? (
        <Alert severity="success">✅ Bạn đã đăng ký khuôn mặt.</Alert>
      ) : (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Bạn chưa đăng ký khuôn mặt để check-in.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
          >
            Đăng ký khuôn mặt
          </Button>
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Đăng ký khuôn mặt</DialogTitle>
        <DialogContent>
          {!preview ? (
            <>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                width="100%"
                style={{
                  borderRadius: 8,
                  marginTop: 8,
                  transform: "scaleX(-1)",
                }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={captureImage}
                sx={{ mt: 2 }}
              >
                Chụp ảnh
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Ảnh vừa chụp:
              </Typography>
              <Box sx={{ mt: 1, textAlign: "center" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: "100%", borderRadius: 8 }}
                />
              </Box>
            </>
          )}

          {response.status && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {response.status}
            </Alert>
          )}

          {response.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {response.error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          {response.status ? (
            <Button onClick={handleClose} variant="contained" color="success">
              Đóng
            </Button>
          ) : preview ? (
            <>
              <Button onClick={reset}>Chụp lại</Button>
              <Button
                onClick={handleRegister}
                disabled={loading}
                variant="contained"
              >
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  "Dùng ảnh này để đăng ký"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Đóng</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisterFaceModal;
