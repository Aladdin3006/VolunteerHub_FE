import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "green", mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Cảm ơn bạn rất nhiều! 🎉
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Bạn đã ủng hộ chiến dịch thành công. Sự đóng góp của bạn sẽ tạo ra sự thay đổi tích cực!
        </Typography>
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
