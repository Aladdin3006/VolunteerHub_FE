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
  joinCampaign,
} from "../../apis/campaign";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import VolunteerTaskList, { Task } from "./VolunteerTaskList"; 

const CampaignVolunteerDetail: React.FC = () => {
  const { campaignId } = useParams();

  /* -------------------- state -------------------- */
  const [campaign, setCampaign] = useState<CampaignVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

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
  const isVolunteerApproved = myVolunteer?.status === "approved";
  const isCampaignRunning = campaign?.status === "in-progress";
  const showTaskUI = isVolunteerApproved && isCampaignRunning;

  /* -------------------- mock tasks (sẽ thay = campaign.tasks) -------------------- */
  const [tasks] = useState<Task[]>([
    { _id: "1", name: "Chuẩn bị dụng cụ", status: "todo" },
    { _id: "2", name: "Phát quà khu A", status: "doing", description: "Khu A" },
  ]);

  /* -------------------- join handler -------------------- */
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

  /* ============================================================
     =========== 1. MÀN HÌNH NHIỆM VỤ (khi showTaskUI) ==========
     ============================================================ */
  if (showTaskUI) {
    return <VolunteerTaskList tasks={tasks} />;
  }

  /* ============================================================
     =========== 2. MÀN HÌNH CHI TIẾT CHIẾN DỊCH GỐC ============
     ============================================================ */
  const { name, description, startDate, endDate, image, location } = campaign;
  const phases = campaign.phases ?? [];

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

      {/* ---------- phases ---------- */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, mt: 6 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          🧭 Các giai đoạn chiến dịch
        </Typography>

        {phases.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Không có thông tin về các giai đoạn chiến dịch.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {phases.map((phase) => (
              <Paper
                key={phase._id}
                elevation={1}
                sx={{ p: 3, borderRadius: 2 }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {phase.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  🕓 Từ: {dayjs(phase.start).format("DD/MM/YYYY")} đến{" "}
                  {dayjs(phase.end).format("DD/MM/YYYY")}
                </Typography>
                {phase.description && (
                  <Typography
                    variant="body1"
                    sx={{ mt: 1, whiteSpace: "pre-line" }}
                  >
                    {phase.description}
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

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
