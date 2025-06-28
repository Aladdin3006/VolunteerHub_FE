import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
  Avatar,
  Stack,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import {
  CampaignVolunteer,
  getCampaignVolunteerDetail,
} from "../../apis/campaign";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const CampaignVolunteerDetail: React.FC = () => {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState<CampaignVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    (async () => {
      try {
        const data = await getCampaignVolunteerDetail(campaignId);
        setCampaign(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId]);

  if (loading)
    return (
      <Box sx={{ pt: 15, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (!campaign)
    return (
      <Box sx={{ pt: 15, textAlign: "center" }}>
        <Typography color="error">Không tìm thấy chiến dịch.</Typography>
      </Box>
    );

  const { name, description, startDate, endDate, image, location } = campaign;

  return (
    <Box sx={{ bgcolor: "#f9f9f9", pb: 10 }}>
      <Header />

      {/* Ảnh cover */}
      <Card sx={{ borderRadius: 0 }}>
        <CardMedia
          component="img"
          image={image || "https://via.placeholder.com/1200x500"}
          height="400"
          alt={name}
        />
      </Card>

      {/* wrapper flex 2-cột */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: 2,
          mt: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        {/* Cột trái – thông tin chi tiết */}
        <Box flex={1}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {name}
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            📍 {location?.address || "Không rõ địa điểm"}
          </Typography>

          <Typography
            variant="body1"
            sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}
          >
            {description || "Không có mô tả chi tiết."}
          </Typography>

          {startDate && (
            <Typography variant="body2" sx={{ mt: 3 }} color="text.secondary">
              🕓 Từ: {dayjs(startDate).format("DD/MM/YYYY")} đến{" "}
              {endDate ? dayjs(endDate).format("DD/MM/YYYY") : "?"}
            </Typography>
          )}
        </Box>

        {/* Cột phải – sidebar */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: "100%", md: 340 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Người đăng + nút tham gia */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }}>ĐC</Avatar>
              <Box>
                <Typography fontWeight={700}>Người đăng</Typography>
                <Typography variant="body2" color="text.secondary">
                  {/* {(campaign.createdBy as any)?.fullName || "Ẩn danh"} */}
                  Ẩn Danh
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={{ mt: 3, textTransform: "none", borderRadius: 2 }}
            >
              Gửi yêu cầu tham gia
            </Button>
          </Paper>

          {/* Lịch hoạt động */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <CalendarMonthIcon color="primary" />
              <Typography fontWeight={700}>Lịch hoạt động</Typography>
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                defaultValue={dayjs(startDate)}
                readOnly
                views={["day"]}
              />
            </LocalizationProvider>
          </Paper>

          {/* Hành động */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              onClick={() => setIsFavorited(!isFavorited)}
              sx={{ bgcolor: "white", boxShadow: 1 }}
            >
              {isFavorited ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <IconButton sx={{ bgcolor: "white", boxShadow: 1 }}>
              <ShareIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default CampaignVolunteerDetail;
