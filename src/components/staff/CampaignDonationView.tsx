import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import getCampaignDetail, { CampaignDetailResponse } from "../../apis/campaign";
import {
  UpdateDonationDialog,
  IUpdateDonationDialogRef,
} from "../../components/staff/UpdateDonationDialog";
import {
  ExpenseDialog,
  IExpenseDialogRef,
} from "../../components/staff/ExpenseDialog";
import {
  ExpenseListDialog,
  IExpenseListDialogRef,
} from "@/components/staff/ExpenseListDialog";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Snackbar,
} from "@mui/material";
import {
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

const CampaignDonationView: React.FC = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaignDetail, setCampaignDetail] =
    useState<CampaignDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const updateDialogRef = useRef<IUpdateDonationDialogRef | null>(null);
  const expenseDialogRef = useRef<IExpenseDialogRef | null>(null);
  const expenseListDialogRef = useRef<IExpenseListDialogRef | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getCampaignDetail(campaignId!);
        setCampaignDetail(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [campaignId]);

  const handleCreateExpenseClick = () => {
    if (campaignDetail?.campaign?.status !== "completed") {
      setSnackbarOpen(true);
      return;
    }
    expenseDialogRef.current?.open(campaignDetail.campaign._id);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!campaignDetail) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          Campaign not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/staff/donations")}
        >
          Back
        </Button>
      </Box>
    );
  }

  const campaign = campaignDetail.campaign;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fa",
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          px: 3,
          py: 1.5,
          borderRadius: "16px",
          mb: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {campaign.title}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/staff/donations")}
          startIcon={<ArrowBackIcon />}
          sx={{
            background: "rgba(255,255,255,0.2)",
            color: "white",
            "&:hover": { background: "rgba(255,255,255,0.3)" },
          }}
        >
          Back
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        className="campaign-grid"
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Column */}
        <Box
          className="campaign-column left-column"
          sx={{ flex: 1, minWidth: 280 }}
        >
          <Box
            className="campaign-card"
            sx={{ background: "#fff", p: 3, borderRadius: 2, mb: 3 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <InfoIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                Mô tả
              </Typography>
            </Box>
            <Typography sx={{ lineHeight: 1.7, color: "#555" }}>
              {campaign.description || "Không có mô tả"}
            </Typography>
          </Box>

          <Box
            className="campaign-card"
            sx={{ background: "#fff", p: 3, borderRadius: 2 }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Thông tin chi tiết
            </Typography>
            <List dense>
              <ListItem>
                <CalendarTodayIcon sx={{ mr: 2, color: "primary.main" }} />
                <ListItemText
                  primary="Thời gian"
                  secondary={`${new Date(campaign.createdAt).toLocaleDateString()} - ${campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : "12/31/2025"
                    }`}
                />

              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <LocationOnIcon sx={{ mr: 2, color: "primary.main" }} />
                <ListItemText
                  primary="Tiến độ quyên góp"
                  secondary={`${campaign.currentAmount.toLocaleString()} / ${campaign.goalAmount.toLocaleString()} VNĐ`}
                />
              </ListItem>
              <Box sx={{ px: 2, py: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(campaign.currentAmount / campaign.goalAmount) * 100}
                />
              </Box>
            </List>
          </Box>
        </Box>

        {/* Middle Column - Recent Donations */}
        <Box
          className="campaign-column middle-column"
          sx={{ flex: 2, minWidth: 320 }}
        >
          <Box
            className="campaign-card"
            sx={{ background: "#fff", p: 3, borderRadius: 2 }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Gần đây quyên góp
            </Typography>
            {campaignDetail.transactions.length === 0 ? (
              <Typography>Chưa có quyên góp nào.</Typography>
            ) : (
              campaignDetail.transactions.map((tx) => (
                <Box key={tx._id} sx={{ mb: 2 }}>
                  <Typography>
                    <strong>{tx.anonymous ? "Ẩn danh" : tx.donorName}</strong>{" "}
                    quyên góp {tx.amount.toLocaleString()} VNĐ
                  </Typography>
                  {tx.message && (
                    <Typography variant="caption">"{tx.message}"</Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    {new Date(tx.createdAt).toLocaleString()}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Right Column */}
        <Box
          className="campaign-column right-column"
          sx={{ flex: 1, minWidth: 280 }}
        >
          {/* Hành động */}
          <Box
            className="campaign-card"
            sx={{ background: "#fff", p: 3, borderRadius: 2, mb: 3 }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Hành động
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  updateDialogRef.current?.open(campaign._id);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                }}
              >
                Cập nhật chiến dịch
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateExpenseClick}
                disabled={campaign.status !== "completed"}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  backgroundColor:
                    campaign.status === "completed" ? "#6c63ff" : undefined,
                  "&:hover": {
                    backgroundColor:
                      campaign.status === "completed" ? "#574fd6" : undefined,
                  },
                }}
              >
                Tạo chi tiêu
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  expenseListDialogRef.current?.open(campaign._id);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  backgroundColor: "#6c63ff",
                  "&:hover": { backgroundColor: "#574fd6" },
                }}
              >
                Quản lý chi tiêu
              </Button>
            </Box>
          </Box>

          {/* Thumbnail */}
          <Box
            className="campaign-card"
            sx={{ background: "#fff", p: 3, borderRadius: 2 }}
          >
            <img
              src={campaign.thumbnail || "https://via.placeholder.com/600x400"}
              alt="Thumbnail"
              style={{ width: "100%", borderRadius: 8, objectFit: "cover" }}
            />
          </Box>
        </Box>
      </Box>

      <UpdateDonationDialog
        ref={updateDialogRef}
        afterSubmit={() => {
          if (campaignId) {
            setLoading(true);
            getCampaignDetail(campaignId)
              .then(setCampaignDetail)
              .finally(() => setLoading(false));
          }
        }}
      />

      <ExpenseDialog
        ref={expenseDialogRef}
        afterSubmit={() => {
          if (campaignId) {
            setLoading(true);
            getCampaignDetail(campaignId)
              .then(setCampaignDetail)
              .finally(() => setLoading(false));
          }
        }}
      />
      <ExpenseListDialog ref={expenseListDialogRef} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Chiến dịch chưa hoàn thành, không thể tạo chi tiêu"
      />
    </Box>
  );
};

export default CampaignDonationView;
