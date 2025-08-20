import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  Divider,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import socket from "@/services/socket";
import { StormAPI } from "@/apis/storm.api";

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
`;
const stormEntrance = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-30deg);
    filter: blur(10px);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    filter: blur(0);
  }
`;

const StormTrigger: React.FC = () => {
  const [hasAlert, setHasAlert] = useState(false);
  const [alertData, setAlertData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const [stormForm, setStormForm] = useState({
    name: "",
    description: "",
    instruction: "",
    centerLocation: { lat: 18.35, lng: 105.9 },
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });

  useEffect(() => {
    const handleWeatherUpdate = (data: any) => {
      if (Array.isArray(data?.alerts) && data.alerts.length > 0) {
        const alert = data.alerts[0];
        setHasAlert(true);
        setAlertData(alert);
        setWeatherData(data.weather);

        setStormForm({
          name: alert.headline || "Cơn bão chưa đặt tên",
          description: alert.desc || "",
          instruction: alert.instruction || "",
          centerLocation: { lat: 18.35, lng: 105.9 },
          startDate: new Date(alert.effective).toISOString(),
          endDate: new Date(alert.expires).toISOString(),
        });
      } else {
        setHasAlert(false);
        setAlertData(null);
        setWeatherData(null);
      }
    };

    socket.on("weather:update", handleWeatherUpdate);
    return () => {
      socket.off("weather:update", handleWeatherUpdate);
    };
  }, []);

  const showToast = (message: string, severity: "success" | "error" | "warning") => {
    setToast({ open: true, message, severity });
  };

  const handleSubmitStorm = async () => {
    setLoading(true);
    try {
      const allStorms = await StormAPI.getAllStorms();
      const isDuplicate = allStorms.some(
        (storm: any) =>
          storm.name?.toLowerCase().trim() === stormForm.name.toLowerCase().trim()
      );

      if (isDuplicate) {
        showToast("⚠️ Một cơn bão với tên này đã tồn tại!", "warning");
        return;
      }

      await StormAPI.createStorm(stormForm);
      showToast("✅ Tạo bão thành công!", "success");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      showToast("❌ Tạo bão thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!hasAlert) return null;

  return (
    <>
      {/* Nút kích hoạt */}
      <Button
        onClick={() => setOpen(true)}
        sx={{
          animation: `${stormEntrance} 0.8s ease-out, ${shake} 2.5s infinite`,

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
      {/* Modal nhập thông tin bão */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            display: "flex",
            gap: 3,
            width: "90%",
            maxWidth: 1000,
          }}
        >
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              🌀 Cảnh Báo Bão: {alertData?.headline}
            </Typography>

            <Typography><strong>⏰ Hiệu lực:</strong> {alertData?.effective}</Typography>
            <Typography><strong>⏳ Hết hạn:</strong> {alertData?.expires}</Typography>
            <Typography><strong>📍 Khu vực:</strong> {alertData?.areas}</Typography>
            <Typography><strong>📢 Mô tả:</strong> {alertData?.desc}</Typography>
            <Typography><strong>📌 Hướng dẫn:</strong> {alertData?.instruction}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold">🌤️ Thời tiết hiện tại:</Typography>
            <Typography>🌡️ {weatherData?.temp_c}°C (cảm giác: {weatherData?.feelslike_c}°C)</Typography>
            <Typography>💨 Gió: {weatherData?.wind_kph} km/h ({weatherData?.windLevel})</Typography>
            <Typography>💧 Độ ẩm: {weatherData?.humidity}%</Typography>
            <Typography>📈 Áp suất: {weatherData?.pressure_mb} mb</Typography>
            <Typography>☀️ UV: {weatherData?.uv}</Typography>

            {!showForm && (
              <Button variant="contained" color="error" sx={{ mt: 3 }} onClick={() => setShowForm(true)}>
               💨 Tạo Cảnh báo cho cơn bão
              </Button>
            )}
          </Box>

          {showForm && (
            <Box flex={1} component="form" onSubmit={(e) => e.preventDefault()}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Thông tin cơn bão sắp tới
              </Typography>
              <TextField
                label="Tên bão"
                fullWidth
                margin="normal"
                value={stormForm.name}
                onChange={(e) => setStormForm({ ...stormForm, name: e.target.value })}
              />
              <TextField
                label="Mô tả"
                fullWidth
                margin="normal"
                multiline
                minRows={2}
                value={stormForm.description}
                onChange={(e) => setStormForm({ ...stormForm, description: e.target.value })}
              />
              <TextField
                label="Hướng dẫn"
                fullWidth
                margin="normal"
                multiline
                minRows={2}
                value={stormForm.instruction}
                onChange={(e) => setStormForm({ ...stormForm, instruction: e.target.value })}
              />
              <TextField
                label="Thời gian bắt đầu"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={stormForm.startDate?.slice(0, 16)}
                onChange={(e) =>
                  setStormForm({
                    ...stormForm,
                    startDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
              <TextField
                label="Thời gian kết thúc"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={stormForm.endDate?.slice(0, 16)}
                onChange={(e) =>
                  setStormForm({
                    ...stormForm,
                    endDate: new Date(e.target.value).toISOString(),
                  })
                }
              />

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmitStorm}
                disabled={loading}
              >
                Gửi lên hệ thống
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Backdrop Loading */}
      <Backdrop open={loading} sx={{ zIndex: 1300, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StormTrigger;