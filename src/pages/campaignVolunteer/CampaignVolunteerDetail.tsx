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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  /* -------------------- state -------------------- */
  const [campaign, setCampaign] = useState<CampaignVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "8px",
  };

  const center = campaign?.location?.coordinates
    ? {
        lat: campaign.location.coordinates[0],
        lng: campaign.location.coordinates[1],
      }
    : { lat: 10.7769, lng: 106.7009 }; // Default to Ho Chi Minh City if no coordinates

  const mapEmbedUrl = campaign?.location?.coordinates
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${
        center.lng
      }!3d${
        center.lat
      }!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(
        `${center.lat},${center.lng}`
      )}!5e0!3m2!1sen!2sus!4v1634567890123`
    : "";

  /* -------------------- user -------------------- */
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id || user.id;
  const isLoggedIn = !!currentUserId;

  /* -------------------- fetch campaign -------------------- */
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

  /* -------------------- volunteer & status -------------------- */
  const myVolunteer = campaign?.volunteers?.find(
    (v) => v.user?._id === currentUserId
  );

  /* -------------------- join handler -------------------- */
  const handleJoin = async () => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
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

  /* -------------------- loading & not-found -------------------- */
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

  /* -------------------- dialog handlers -------------------- */
  const handleCloseLoginDialog = () => {
    setLoginDialogOpen(false);
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
    setLoginDialogOpen(false);
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
    setLoginDialogOpen(false);
  };

  /* ============================================================
     =========== 2. MÀN HÌNH CHI TIẾT CHIẾN DỊCH GỐC ============
     ============================================================ */
  const { name, description, startDate, endDate, image, location } = campaign;

  /* ------------ nhãn & disable button tham gia ------------ */
  let joinLabel = "Gửi yêu cầu tham gia";
  let joinDisabled = joinLoading;
  if (myVolunteer?.status === "pending") {
    joinLabel = "Đã gửi yêu cầu (chờ duyệt)";
    joinDisabled = true;
  } else if (myVolunteer?.status === "approved") {
    joinLabel = "Đã tham gia";
    joinDisabled = true;
  }

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

      {/* ---------- nội dung + sidebar ---------- */}
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
        {/* ----- nội dung bên trái ----- */}
        <Box flex={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <IconButton
              onClick={() => navigate("/campaigns")}
              sx={{ mr: 1, color: "inherit" }}
              aria-label="back to campaigns"
            >
              <ArrowBackIcon />
            </IconButton>
            {name}
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

          <Typography variant="subtitle1" color="text.secondary" mt={2}>
            📍 {location?.address || "Không rõ địa điểm"}
          </Typography>
          {campaign.location?.coordinates ? (
            <Box sx={mapContainerStyle}>
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Box>
          ) : (
            <Box className="no-data-container">
              <Typography variant="body1" color="text.secondary">
                No location coordinates available
              </Typography>
            </Box>
          )}
        </Box>

        {/* ----- sidebar bên phải ----- */}
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

            {/* Ẩn nút nếu đã approved */}
            {myVolunteer?.status !== "approved" && (
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
            )}
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

      {/* ---------- login dialog ---------- */}
      <Dialog open={loginDialogOpen} onClose={handleCloseLoginDialog}>
        <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn cần đăng nhập để tham gia chiến dịch này.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: "bold" }}>
            Bạn đã có tài khoản chưa?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleNavigateToRegister}
            color="primary"
            variant="outlined"
          >
            Chưa, tôi muốn đăng ký
          </Button>
          <Button
            onClick={handleNavigateToLogin}
            color="primary"
            variant="contained"
            autoFocus
          >
            Có, đăng nhập ngay
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- snackbar ---------- */}
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
