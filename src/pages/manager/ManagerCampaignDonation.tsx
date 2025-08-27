import React, { useState, useEffect } from "react";
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
  Badge,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { getCampaigns } from "../../apis/campaign";
import DonationDetailDialog, {
  CampaignDetailResponse,
} from "../../components/manager/DonationDetailDialog";
import {
  approveDonationCampaign,
  rejectDonationCampaign,
  completeDonationCampaign,
} from "@/apis/donation";
import ManagerTabs from "./ManagerTabs";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

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
  endDate?: string;
}

const ManagerDonationStaff: React.FC = () => {
  const [activeLink, setActiveLink] = useState<"ongoing" | "finished">(
    "finished"
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignDetailResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [endDialogOpen, setEndDialogOpen] = useState<boolean>(false);
  const [campaignToEnd, setCampaignToEnd] = useState<Campaign | null>(null);

  const navigate = useNavigate();

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

  const handleApproveCampaign = async (id: string) => {
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";

      if (!token) {
        alert("Không tìm thấy token");
        return;
      }

      await approveDonationCampaign(id, token);

      alert("Chiến dịch đã được duyệt");

      const updated = campaigns.map((c) =>
        c._id === id ? { ...c, approvalStatus: "approved" } : c
      );
      setCampaigns(updated);
    } catch (err: any) {
      alert(err.message || "Lỗi khi duyệt chiến dịch");
    }
  };

  const handleRejectCampaign = async (id: string) => {
    try {
      const confirm = window.confirm(
        "Bạn có chắc chắn muốn từ chối chiến dịch này?"
      );
      if (!confirm) return;

      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";

      if (!token) {
        alert("Không tìm thấy token");
        return;
      }

      await rejectDonationCampaign(id);

      alert("Chiến dịch đã bị từ chối");

      const updated = campaigns.map((c) =>
        c._id === id ? { ...c, approvalStatus: "rejected" } : c
      );
      setCampaigns(updated);
    } catch (err: any) {
      alert(err.message || "Lỗi khi từ chối chiến dịch");
    }
  };

  const handleEndCampaign = async (id: string) => {
    const campaign = campaigns.find((c) => c._id === id);
    if (!campaign) return;

    const today = new Date();
    const endDate = campaign.endDate
      ? new Date(campaign.endDate)
      : new Date("2025-12-31");

    if (today < endDate) {
      setCampaignToEnd(campaign);
      setEndDialogOpen(true);
    } else {
      try {
        await completeDonationCampaign(id);
        alert("Chiến dịch đã được kết thúc");
        const updated = campaigns.map((c) =>
          c._id === id ? { ...c, status: "completed" } : c
        );
        setCampaigns(updated);
      } catch (err: any) {
        alert(err.message || "Lỗi khi kết thúc chiến dịch");
      }
    }
  };

  const handleConfirmEndCampaign = async () => {
    if (!campaignToEnd) return;

    try {
      await completeDonationCampaign(campaignToEnd._id);
      alert("Chiến dịch đã được kết thúc");
      const updated = campaigns.map((c) =>
        c._id === campaignToEnd._id ? { ...c, status: "completed" } : c
      );
      setCampaigns(updated);
    } catch (err: any) {
      alert(err.message || "Lỗi khi kết thúc chiến dịch");
    } finally {
      setEndDialogOpen(false);
      setCampaignToEnd(null);
    }
  };

  const handleCloseEndDialog = () => {
    setEndDialogOpen(false);
    setCampaignToEnd(null);
  };

  const handleCardClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCampaign(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFilterStatus(
      ["", "in-progress", "upcoming", "completed", "rejected"][newValue]
    );
  };

  const mapStatus = (campaign: Campaign) => {
    if (campaign.approvalStatus === "rejected") return "rejected";
    if (campaign.status === "completed") return "completed";
    return campaign.approvalStatus === "approved" ? "in-progress" : "upcoming";
  };

  const getStatusCount = (status: string) => {
    return campaigns.filter((campaign) => mapStatus(campaign) === status)
      .length;
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    filterStatus ? mapStatus(campaign) === filterStatus : true
  );

  return (
    <Box
      sx={{
        width: "100%",
        padding: { xs: 1, sm: 2 },
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <ManagerTabs
          activeTab={activeLink === "ongoing" ? "donations" : "storms"}
          onTabChange={(value) => {
            setActiveLink(value === "donations" ? "ongoing" : "finished");
          }}
        />
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper
          sx={{
            width: "100%",
            p: { xs: 2, sm: 3 },
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            backgroundColor: "#ffffff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
            }}
          >
            Chọn chiến dịch theo trạng thái:
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <Badge badgeContent={campaigns.length} color="default">
                  <Typography>Tất cả</Typography>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge
                  badgeContent={getStatusCount("in-progress")}
                  color="info"
                >
                  <Typography>Đang diễn ra</Typography>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge
                  badgeContent={getStatusCount("upcoming")}
                  color="warning"
                >
                  <Typography>Chưa diễn ra</Typography>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge
                  badgeContent={getStatusCount("completed")}
                  color="primary"
                >
                  <Typography>Đã hoàn thành</Typography>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={getStatusCount("rejected")} color="error">
                  <Typography>Đã bị Hủy</Typography>
                </Badge>
              }
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Campaign List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
          <Typography variant="h6" color="error">
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
        <Grid container spacing={3} sx={{ justifyContent: "center" }}>
          {filteredCampaigns.map((campaign) => (
            <Grid item key={campaign._id} xs={12} sm={6} md={4} lg={3}>
              <Card
                onClick={() => handleCardClick(campaign)}
                sx={{
                  width: 360,
                  height: 500,
                  borderRadius: 3,
                  boxShadow: 3,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {/* Thumbnail + Status Chip */}
                <Box
                  sx={{
                    position: "relative",
                    height: 180,
                    minHeight: 180,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={
                      campaign.thumbnail ||
                      "https://via.placeholder.com/360x200?text=No+Image"
                    }
                    alt={campaign.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  />
                  {campaign.approvalStatus === "approved" ? (
                    <Chip
                      label="APPROVED"
                      color="success"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    />
                  ) : campaign.approvalStatus === "rejected" ? (
                    <Chip
                      label="REJECTED"
                      color="error"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    />
                  ) : (
                    <Chip
                      label="PENDING"
                      color="warning"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    />
                  )}
                </Box>

                {/* Status Bar */}
                <Box
                  sx={{
                    backgroundColor:
                      campaign.approvalStatus === "rejected"
                        ? "#c03e3eff"
                        : campaign.status === "draft"
                        ? "#f57c00"
                        : campaign.status === "active"
                        ? "#2e7d32"
                        : campaign.status === "completed"
                        ? "#0288d1"
                        : "#2e7d32",
                    py: 0.5,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="caption" color="white" fontWeight="bold">
                    {campaign.approvalStatus === "rejected"
                      ? "REJECTED"
                      : campaign.status === "draft"
                      ? "WAITING"
                      : campaign.status === "active"
                      ? "IN-PROGRESS"
                      : campaign.status === "completed"
                      ? "COMPLETED"
                      : "IN-PROGRESS"}
                  </Typography>
                </Box>

                {/* Nội dung thẻ */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 2,
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: 48,
                      }}
                    >
                      {campaign.title.length > 25
                        ? `${campaign.title.slice(0, 25)}...`
                        : campaign.title}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        📅
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(campaign.createdAt).toLocaleDateString()} -{" "}
                        {new Date(
                          campaign.endDate || "2025-12-31"
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Tiến độ quyên góp
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (campaign.currentAmount / campaign.goalAmount) * 100
                        }
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {campaign.currentAmount.toLocaleString()} /{" "}
                        {campaign.goalAmount.toLocaleString()} VNĐ
                      </Typography>
                    </Box>

                    {/* Tags */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 1,
                      }}
                    >
                      {campaign.tags?.map((tag) => (
                        <Chip
                          key={tag._id}
                          label={tag.name}
                          size="small"
                          sx={{
                            backgroundColor: "#35c04cff",
                            color: "#fff",
                            "& .MuiChip-label": {
                              fontSize: "0.7rem",
                            },
                            fontWeight: "bold",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          avatar={
                            <Avatar
                              src={tag.icon}
                              alt={tag.name}
                              sx={{ width: 20, height: 20 }}
                            />
                          }
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Nút hành động */}
                  <Box
                    sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}
                  >
                    {campaign.approvalStatus !== "approved" &&
                      campaign.approvalStatus !== "rejected" && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveCampaign(campaign._id);
                            }}
                            sx={{ padding: "4px 8px", textTransform: "none" }}
                            startIcon={<CheckIcon />}
                          >
                            APPROVE
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectCampaign(campaign._id);
                            }}
                            sx={{ padding: "4px 8px", textTransform: "none" }}
                            startIcon={<CloseIcon />}
                          >
                            REJECT
                          </Button>
                        </>
                      )}
                    {campaign.approvalStatus === "approved" &&
                      campaign.status !== "completed" && (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEndCampaign(campaign._id);
                          }}
                          sx={{
                            padding: "4px 8px",
                            backgroundColor: "#9c27b0",
                            color: "#fff",
                            textTransform: "none",
                          }}
                        >
                          END CAMPAIGN
                        </Button>
                      )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Chi tiết chiến dịch */}
      <DonationDetailDialog
        open={dialogOpen}
        campaign={selectedCampaign}
        onClose={handleCloseDialog}
      />

      {/* End Campaign Confirmation Dialog */}
      <Dialog
        open={endDialogOpen}
        onClose={handleCloseEndDialog}
        aria-labelledby="end-campaign-dialog-title"
        aria-describedby="end-campaign-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 2,
            padding: 2,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle
          id="end-campaign-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: "bold",
            color: "#d32f2f",
          }}
        >
          <WarningAmberIcon sx={{ color: "#d32f2f" }} />
          Xác nhận kết thúc chiến dịch
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="end-campaign-dialog-description"
            sx={{ color: "#424242", lineHeight: 1.6 }}
          >
            Chiến dịch quyên góp{" "}
            <strong>{campaignToEnd?.title || "này"}</strong> chưa đến ngày kết
            thúc (
            {new Date(
              campaignToEnd?.endDate || "2025-12-31"
            ).toLocaleDateString()}
            ). Bạn có chắc chắn muốn kết thúc chiến dịch này ngay bây giờ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={handleCloseEndDialog}
            variant="outlined"
            color="primary"
            sx={{
              textTransform: "none",
              borderRadius: 1,
              minWidth: 100,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmEndCampaign}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              borderRadius: 1,
              minWidth: 100,
            }}
            autoFocus
          >
            Kết thúc
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerDonationStaff;
