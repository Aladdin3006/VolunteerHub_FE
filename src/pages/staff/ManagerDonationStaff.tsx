import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  FiberManualRecord as FiberManualRecordIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useNavigate } from "react-router-dom";
import { getCampaigns } from "../../apis/campaign";
import { NewDonationDialog, INewDonationDialogRef } from "../../components/staff/NewDonationDialog";
import { IDonationDataUpload } from "../../apis/donation";
import NavigationTabs from "./NavigationTabs";

interface Campaign {
  _id: string;
  title: string;
  description?: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
  thumbnail?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  tags?: { _id: string; name: string; color: string; icon: string }[];
  approvalStatus?: string;
}

interface CampaignDetailResponse extends Campaign {}

const ManagerDonationStaff: React.FC = () => {
  const [activeLink, setActiveLink] = useState<"ongoing" | "finished">("finished");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetailResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const dialogRef = useRef<INewDonationDialogRef>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (err) {
        setError("Không thể tải danh sách chiến dịch");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCardClick = (campaignId: string) => {
    navigate(`/staff/donation/${campaignId}`);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCampaign(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFilterStatus(["", "in-progress", "upcoming", "completed", "cancelled"][newValue]);
  };

  const [filterStatus, setFilterStatus] = useState<string>("");

  const mapStatus = (campaign: Campaign) => {
    if (campaign.approvalStatus === "rejected") return "cancelled";
    if (campaign.status === "completed") return "completed";
    return campaign.approvalStatus === "approved" ? "in-progress" : "upcoming";
  };

  const getStatusCount = (status: string) => {
    return campaigns.filter((campaign) => mapStatus(campaign) === status).length;
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    filterStatus ? mapStatus(campaign) === filterStatus : true
  );

  const handleAfterSubmit = async (data: IDonationDataUpload) => {
    try {
      setLoading(true);
      const data = await getCampaigns();
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError("Không thể làm mới danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: { xs: 2, sm: 3 },
        backgroundColor: "#f5f5f5",
        position: "relative",
        left: 0,
        top: 0,
      }}
    >
      {/* Navigation Tabs */}
      <NavigationTabs activeLink={activeLink} />

      {/* Header and Filter Tabs */}
      <Box
        sx={{
          mb: 4,
          marginTop: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý Quyên góp
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="donation status tabs"
          >
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <ListAltIcon sx={{ fontSize: "small", mr: 1 }} />
                  Tất cả ({campaigns.length})
                </Box>
              }
              value={0}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <FiberManualRecordIcon
                    sx={{ color: "green", fontSize: "small", mr: 1 }}
                  />
                  Đang diễn ra ({getStatusCount("in-progress")})
                </Box>
              }
              value={1}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <ScheduleIcon sx={{ fontSize: "small", mr: 1 }} />
                  Chưa diễn ra ({getStatusCount("upcoming")})
                </Box>
              }
              value={2}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ fontSize: "small", mr: 1 }} />
                  Đã kết thúc ({getStatusCount("completed")})
                </Box>
              }
              value={3}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ fontSize: "small", mr: 1 }} />
                  Đã Bị Hủy ({getStatusCount("cancelled")})
                </Box>
              }
              value={4}
            />
          </Tabs>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            dialogRef.current?.open();
          }}
        >
          Tạo Chiến dịch Quyên góp Mới
        </Button>
      </Box>

      {/* Campaign List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
        </Paper>
      ) : filteredCampaigns.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Không có chiến dịch quyên góp nào
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Bạn chưa được gán vào bất kỳ chiến dịch quyên góp nào.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} justifyContent="flex-start">
          {filteredCampaigns.map((campaign) => (
            <Grid item key={campaign._id} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  transition: "box-shadow 0.3s ease",
                  height: 350,
                  width: 300,
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  },
                }}
                onClick={() => handleCardClick(campaign._id)}
              >
                <CardContent
                  sx={{
                    p: 0,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ position: "relative", width: "100%", height: 150 }}>
                    <Box
                      component="img"
                      src={
                        campaign.thumbnail ||
                        "https://via.placeholder.com/300x150?text=No+Image"
                      }
                      alt={campaign.title}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        backgroundColor: campaign.thumbnail ? "transparent" : "#f5f5f5",
                      }}
                    />
                    {campaign.approvalStatus && (
                      <Chip
                        label={campaign.approvalStatus.toUpperCase()}
                        color={
                          campaign.approvalStatus === "approved"
                            ? "success"
                            : campaign.approvalStatus === "rejected"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          fontWeight: "bold",
                          color: "#fff",
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ p: 2, flex: 1 }}>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {campaign.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(campaign.createdAt).toLocaleDateString()} -{" "}
                      {new Date(campaign.endDate || "2025-12-31").toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Tiến độ quyên góp
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(campaign.currentAmount / campaign.goalAmount) * 100}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {campaign.currentAmount.toLocaleString()} /{" "}
                      {campaign.goalAmount.toLocaleString()} VNĐ
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Campaign Detail Dialog */}
      {selectedCampaign && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            Chi tiết chiến dịch: {selectedCampaign.title}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                component="img"
                src={
                  selectedCampaign.thumbnail ||
                  "https://via.placeholder.com/300x150?text=No+Image"
                }
                alt={selectedCampaign.title}
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
              <Typography variant="h6" fontWeight="bold">
                {selectedCampaign.title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Mô tả: {selectedCampaign.description || "Không có mô tả"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Thời gian: {new Date(selectedCampaign.createdAt).toLocaleDateString()} -{" "}
                {new Date(selectedCampaign.updatedAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tiến độ quyên góp: {selectedCampaign.currentAmount.toLocaleString()} /{" "}
                {selectedCampaign.goalAmount.toLocaleString()} VNĐ
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(selectedCampaign.currentAmount / selectedCampaign.goalAmount) * 100}
                sx={{ mb: 1 }}
              />
              {selectedCampaign.tags && selectedCampaign.tags.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedCampaign.tags.map((tag) => (
                    <Box
                      key={tag._id}
                      sx={{
                        backgroundColor: tag.color,
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      {tag.name}
                    </Box>
                  ))}
                </Box>
              )}
              <Typography variant="body2" color="textSecondary">
                Trạng thái phê duyệt: {selectedCampaign.approvalStatus || "Không xác định"}
              </Typography>
              {selectedCampaign.images && selectedCampaign.images.length > 0 && (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Hình ảnh bổ sung:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, overflowX: "auto", mt: 1 }}>
                    {selectedCampaign.images.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={image}
                        alt={`Hình ảnh ${index + 1}`}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>
      )}

      <NewDonationDialog
        ref={dialogRef}
        afterSubmit={handleAfterSubmit}
        closeAfterSubmit={true}
      />
    </Box>
  );
};

export default ManagerDonationStaff;