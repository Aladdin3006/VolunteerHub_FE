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
  Snackbar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
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
  joinCampaign,
} from "../../apis/campaign";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const CampaignVolunteerDetail: React.FC = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<CampaignVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id || user.id;
  const isLoggedIn = !!currentUserId;

  // Tìm bản ghi volunteer hiện tại (nếu có)
  const myVolunteer = campaign?.volunteers?.find(
    (v) => v.user?._id === currentUserId
  );

  // Đặt label và disable theo trạng thái
  let joinLabel = "Gửi yêu cầu tham gia";
  let joinDisabled = joinLoading;

  if (myVolunteer?.status === "pending") {
    joinLabel = "Đã gửi yêu cầu (chờ duyệt)";
    joinDisabled = true;
  } else if (myVolunteer?.status === "approved") {
    joinLabel = "Đã tham gia";
    joinDisabled = true;
  }

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

  const handleJoin = async () => {
    if (!isLoggedIn) {
      setJoinMessage("Bạn cần đăng nhập để tham gia chiến dịch!");
      return;
    }

    try {
      setJoinLoading(true);
      const msg = await joinCampaign(campaignId!);
      setJoinMessage(msg);

      setCampaign((prev) =>
        prev
          ? {
            ...prev,
            volunteers: [
              ...(prev.volunteers || []),
              { user: { _id: currentUserId }, status: "pending" } as any,
            ],
          }
          : prev
      );
    } catch (err) {
      setJoinMessage((err as Error).message);
    } finally {
      setJoinLoading(false);
    }
  };


  if (loading) {
    return (
      <Box sx={{ pt: 15, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box sx={{ pt: 15, textAlign: "center" }}>
        <Typography color="error">Không tìm thấy chiến dịch.</Typography>
      </Box>
    );
  }

  const { name, description, startDate, endDate, image, location } = campaign;

  return (
    <Box sx={{ bgcolor: "#f9f9f9", pb: 10 }}>
      <Header />

      <Card sx={{ borderRadius: 0 }}>
        <CardMedia
          component="img"
          image={
            image ||
            "https://via.placeholder.com/1200x400?text=Chiến+dịch+thiện+nguyện"
          }
          height="400"
          alt={name}
        />
      </Card>

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

        <Box
          sx={{
            flexShrink: 0,
            width: { xs: "100%", md: 340 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }}>ĐC</Avatar>
              <Box>
                <Typography fontWeight={700}>Người đăng</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ẩn danh
                </Typography>
              </Box>
            </Stack>

            <Button
              disabled={joinDisabled}
              onClick={handleJoin}
              fullWidth
              variant="contained"
              color="success"
              sx={{ mt: 3, textTransform: "none", borderRadius: 2 }}
            >
              {joinLoading ? "Đang gửi..." : joinLabel}
            </Button>
          </Paper>

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

      <Snackbar
        open={!!joinMessage}
        autoHideDuration={4000}
        onClose={() => setJoinMessage(null)}
        message={joinMessage}
      />

      <Footer />
    </Box>
  );
};

export default CampaignVolunteerDetail;
