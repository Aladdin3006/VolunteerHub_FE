import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params
  const query = new URLSearchParams(location.search);
  const amount = Number(query.get("amount") || 0);
  const status = query.get("status");
  const apptransid = query.get("apptransid");

  const isSuccess = status === "1";

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        {isSuccess ? (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "green", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Cảm ơn bạn rất nhiều! 🎉
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Bạn đã ủng hộ thành công với số tiền:
            </Typography>
            <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
              {amount.toLocaleString("vi-VN")}đ
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Mã giao dịch: <strong>{apptransid}</strong>
            </Typography>
          </>
        ) : (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: "red", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Giao dịch thất bại ❌
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại sau.
            </Typography>
          </>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleBackHome}
          sx={{ mt: 2 }}
        >
          Quay về trang chủ
        </Button>
      </Paper>
    </Container>
  );
};

export default ThankYou;