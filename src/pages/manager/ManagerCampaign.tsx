import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Tabs,
  Tab,
  Paper,
  Stack,
  Badge,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  LocationOn,
  DateRange,
  Category as CategoryIcon,
  CheckCircle,
  Cancel,
  PlayCircle,
  StopCircle,
  Image as ImageIcon,
  WarningAmber,
} from "@mui/icons-material";
import TaskIcon from "@mui/icons-material/Task";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { managerCampaignService } from "../../apis/manager";
import { Category } from "../../apis/campaign";
import CampaignModal from "../../components/manager/CampaignModal";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import usersService from "@/apis/admin";

// Map settings
const mapContainerStyle = {
  width: "100%",
  height: "200px",
};

interface Volunteer {
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  status: "pending" | "approved" | "rejected";
  evaluation?: string;
  feedback?: string;
}

interface Task {
  _id: string;
  assignedUsers: { userId: string }[];
  staffReview?: { finalScore: number };
  peerReviews: { reviewer: string; reviewee: string; score: number }[];
}

interface PhaseDay {
  tasks: Task[];
}

interface Phase {
  phaseDays: PhaseDay[];
}

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  createBy: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  startDate: Date | string;
  endDate: Date | string;
  gallery: string[];
  image: string;
  categories: Category[];
  status: "upcoming" | "in-progress" | "completed";
  acceptStatus: "pending" | "approved" | "rejected";
  volunteers?: Volunteer[];
  phases?: Phase[];
}

const ManagerCampaign: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "all"
    | "pending"
    | "approved"
    | "rejected"
    | "upcoming"
    | "in-progress"
    | "completed"
  >("all");
  const [activeLink, setActiveLink] = useState<"ongoing" | "finished">(
    "ongoing"
  );
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openStartDialog, setOpenStartDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openEvaluateDialog, setOpenEvaluateDialog] = useState(false);
  const [generateCertificate, setGenerateCertificate] = useState(true);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(
    null
  );
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });
  const [isStartingCampaign, setIsStartingCampaign] = useState(false);
  const [isEndingCampaign, setIsEndingCampaign] = useState(false);
  const [volunteerEvaluations, setVolunteerEvaluations] = useState<{
    [userId: string]: { evaluation: string; feedback: string };
  }>({});
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [volunteersWithCertificates, setVolunteersWithCertificates] = useState<
    Set<string>
  >(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await managerCampaignService.getListCampaigns();
        const processedData = data.map((campaign) => ({
          ...campaign,
          startDate: new Date(campaign.startDate),
          endDate: new Date(campaign.endDate),
        }));
        setAllCampaigns(processedData);
      } catch (err) {
        setError("Failed to load campaigns. Please try again later.");
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCampaigns();
  }, []);

  useEffect(() => {
    if (allCampaigns.length === 0) {
      setFilteredCampaigns([]);
      return;
    }

    let filtered: Campaign[] = [];

    switch (activeTab) {
      case "all":
        filtered = allCampaigns;
        break;
      case "pending":
        filtered = allCampaigns.filter(
          (campaign) => campaign.acceptStatus === "pending"
        );
        break;
      case "approved":
        filtered = allCampaigns.filter(
          (campaign) => campaign.acceptStatus === "approved"
        );
        break;
      case "rejected":
        filtered = allCampaigns.filter(
          (campaign) => campaign.acceptStatus === "rejected"
        );
        break;
      case "upcoming":
        filtered = allCampaigns.filter(
          (campaign) => campaign.status === "upcoming"
        );
        break;
      case "in-progress":
        filtered = allCampaigns.filter(
          (campaign) => campaign.status === "in-progress"
        );
        break;
      case "completed":
        filtered = allCampaigns.filter(
          (campaign) => campaign.status === "completed"
        );
        break;
      default:
        filtered = allCampaigns;
    }
    setFilteredCampaigns(filtered);
  }, [allCampaigns, activeTab]);

  const fetchAllCampaigns = async () => {
    try {
      const data = await managerCampaignService.getListCampaigns();
      setAllCampaigns(data);
    } catch (error) {
      console.error("Error refreshing campaigns:", error);
    }
  };

  const fetchCampaignDetails = async (campaignId: string) => {
    try {
      const data = await managerCampaignService.getCampaignById(campaignId);
      setSelectedCampaign({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
      return data;
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      setAlertMessage("Failed to load campaign details.");
      setTimeout(() => setAlertMessage(null), 5000);
      return null;
    }
  };

  const fetchCertificatesForCampaign = async (campaignId: string) => {
    try {
      const { data: certificates } = await usersService.getAllCertificates({
        searchCampaign: campaignId,
        limit: 1000, // Adjust based on expected number of volunteers
      });

      const volunteerIds = new Set(
        certificates.map((cert) => cert.volunteerId.id)
      );
      setVolunteersWithCertificates(volunteerIds);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleAction = async (
    action: Function,
    id: string,
    generateCert?: boolean
  ) => {
    try {
      if (action === managerCampaignService.startCampaign) {
        setIsStartingCampaign(true);
      } else if (action === managerCampaignService.endCampaign) {
        setIsEndingCampaign(true);
      }

      const response = await action(id, generateCert);
      await fetchAllCampaigns();
      setAlertMessage(response.message);
      setTimeout(() => setAlertMessage(null), 5000);
    } catch (error) {
      console.error("Action failed:", error);
      setAlertMessage("Action failed. Please try again.");
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setIsStartingCampaign(false);
      setIsEndingCampaign(false);
    }
  };

  const handleEvaluateVolunteer = async (
    campaignId: string,
    userId: string,
    evaluation: string,
    feedback: string
  ) => {
    try {
      const response = await managerCampaignService.evaluateVolunteer(
        campaignId,
        userId,
        evaluation,
        feedback
      );
      setHasEvaluated(true);
      setAlertMessage(response.message);
      setTimeout(() => setAlertMessage(null), 5000);
      await fetchCampaignDetails(campaignId);
    } catch (error) {
      console.error("Evaluation failed:", error);
      setAlertMessage("Evaluation failed. Please try again.");
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  const handleEndCampaign = async (campaignId: string) => {
    setCurrentCampaignId(campaignId);
    const campaign = await fetchCampaignDetails(campaignId);
    if (campaign) {
      await fetchCertificatesForCampaign(campaignId);
      setVolunteerEvaluations(
        campaign.volunteers?.reduce((acc, volunteer) => {
          if (volunteer.status === "approved") {
            acc[volunteer.user._id] = {
              evaluation: volunteer.evaluation || "average",
              feedback: volunteer.feedback || "",
            };
          }
          return acc;
        }, {} as { [userId: string]: { evaluation: string; feedback: string } }) ||
          {}
      );
      setHasEvaluated(campaign.volunteers?.some((v) => v.evaluation) || false);
      setOpenEvaluateDialog(true);
    }
  };

  const confirmEndCampaign = async () => {
    if (currentCampaignId) {
      await handleAction(
        (id: string, generateCert: boolean) =>
          managerCampaignService.endCampaign(id, {
            certificate: generateCert.toString(),
          }),
        currentCampaignId,
        generateCertificate
      );
    }
    setOpenConfirmDialog(false);
    setCurrentCampaignId(null);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "in-progress":
        return "success";
      case "completed":
        return "primary";
      default:
        return "default";
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue as any);
  };

  const openCampaignDetail = (campaign: Campaign) => {
    fetchCampaignDetails(campaign._id);
    setIsDialogOpen(true);
  };

  const truncateAddress = (address: string, maxLength = 25) => {
    return address.length > maxLength
      ? `${address.substring(0, maxLength)}...`
      : address;
  };

  const confirmStartCampaign = async () => {
    if (currentCampaignId) {
      await handleAction(
        managerCampaignService.startCampaign,
        currentCampaignId
      );
    }
    setOpenStartDialog(false);
    setCurrentCampaignId(null);
  };

  const calculateVolunteerStats = (volunteerId: string, campaign: Campaign) => {
    let taskCount = 0;
    let totalTaskScore = 0;
    let taskScoreCount = 0;
    let totalPeerScore = 0;
    let peerScoreCount = 0;

    campaign.phases?.forEach((phase) => {
      phase.phaseDays.forEach((phaseDay) => {
        phaseDay.tasks.forEach((task) => {
          // Count tasks participated
          if (task.assignedUsers.some((user) => user.userId === volunteerId)) {
            taskCount++;
            // Calculate average task score
            if (task.staffReview?.finalScore) {
              totalTaskScore += task.staffReview.finalScore;
              taskScoreCount++;
            }
            // Calculate average peer review score
            task.peerReviews.forEach((review) => {
              if (review.reviewee === volunteerId) {
                totalPeerScore += review.score;
                peerScoreCount++;
              }
            });
          }
        });
      });
    });

    return {
      taskCount,
      avgTaskScore:
        taskScoreCount > 0
          ? (totalTaskScore / taskScoreCount).toFixed(1)
          : "__",
      avgPeerScore:
        peerScoreCount > 0
          ? (totalPeerScore / peerScoreCount).toFixed(1)
          : "__",
    };
  };

  const renderActionButtons = (campaign: Campaign) => {
    if (campaign.acceptStatus === "pending") {
      return (
        <>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(
                managerCampaignService.approveCampaign,
                campaign._id
              );
            }}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(managerCampaignService.rejectCampaign, campaign._id);
            }}
          >
            Reject
          </Button>
        </>
      );
    }

    if (campaign.acceptStatus === "approved") {
      if (campaign.status === "upcoming") {
        return (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<PlayCircle />}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentCampaignId(campaign._id);
              setOpenStartDialog(true);
            }}
          >
            Start Campaign
          </Button>
        );
      }

      if (campaign.status === "in-progress") {
        return (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<StopCircle />}
            onClick={(e) => {
              e.stopPropagation();
              handleEndCampaign(campaign._id);
            }}
          >
            End Campaign
          </Button>
        );
      }
    }

    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          padding: "30px",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>Loading campaigns...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          padding: "30px",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const evaluationOptions = [
    { value: "excellent", label: "Xuất sắc" },
    { value: "good", label: "Tốt" },
    { value: "average", label: "Trung bình" },
    { value: "poor", label: "Kém" },
  ];

  const renderEvaluateDialog = () => (
    <Dialog
      open={openEvaluateDialog}
      onClose={() => setOpenEvaluateDialog(false)}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle fontWeight="bold">
        Đánh giá tình nguyện viên trong chiến dịch
      </DialogTitle>
      <DialogContent>
        {!hasEvaluated && (
          <Alert severity="warning" icon={<WarningAmber />} sx={{ mb: 2 }}>
            Bạn chưa đánh giá chiến dịch
          </Alert>
        )}
        {selectedCampaign?.volunteers?.filter((v) => v.status === "approved")
          .length === 0 ? (
          <Typography>
            Không có tình nguyện viên được phê duyệt trong chiến dịch này.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {selectedCampaign?.volunteers
              ?.filter((v) => v.status === "approved")
              .map((volunteer) => {
                const stats = calculateVolunteerStats(
                  volunteer.user._id,
                  selectedCampaign
                );
                return (
                  <Box
                    key={volunteer.user._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                      pb: 2,
                    }}
                  >
                    {/* Avatar - Fixed width */}
                    <Box sx={{ width: 60 }}>
                      <Avatar
                        src={volunteer.user.avatar || ""}
                        alt={volunteer.user.fullName}
                        sx={{ width: 40, height: 40 }}
                      />
                    </Box>

                    {/* Name - Fixed width */}
                    <Typography variant="subtitle1" sx={{ width: 150 }}>
                      {volunteer.user.fullName}
                    </Typography>

                    {/* Tasks count - Fixed width */}
                    <Box
                      sx={{ width: 300, display: "flex", alignItems: "center" }}
                    >
                      <TaskIcon sx={{ fontSize: "1rem", mr: 1 }} />
                      <span>Nhiệm vụ đã tham gia: {stats.taskCount}</span>
                    </Box>

                    {/* Average task score - Fixed width */}
                    <Box
                      sx={{ width: 300, display: "flex", alignItems: "center" }}
                    >
                      <span>Điểm nhiệm vụ TB: {stats.avgTaskScore}</span>
                      <Box component="span" sx={{ color: "yellow", ml: 0.5 }}>
                        ★
                      </Box>
                    </Box>

                    {/* Average peer score - Fixed width */}
                    <Box
                      sx={{ width: 300, display: "flex", alignItems: "center" }}
                    >
                      <span>Điểm đồng nghiệp TB: {stats.avgPeerScore}</span>
                      <Box component="span" sx={{ color: "yellow", ml: 0.5 }}>
                        ★
                      </Box>
                    </Box>

                    {/* Evaluation dropdown - Fixed width */}
                    <FormControl sx={{ width: 200, mr: 2 }}>
                      <InputLabel>Đánh giá</InputLabel>
                      <Select
                        value={
                          volunteerEvaluations[volunteer.user._id]
                            ?.evaluation || "average"
                        }
                        onChange={(e) => {
                          setVolunteerEvaluations({
                            ...volunteerEvaluations,
                            [volunteer.user._id]: {
                              ...volunteerEvaluations[volunteer.user._id],
                              evaluation: e.target.value,
                            },
                          });
                        }}
                      >
                        {evaluationOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Save button - Fixed width */}
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ width: 140 }}
                      onClick={() =>
                        handleEvaluateVolunteer(
                          selectedCampaign._id,
                          volunteer.user._id,
                          volunteerEvaluations[volunteer.user._id]
                            ?.evaluation || "average",
                          volunteerEvaluations[volunteer.user._id]?.feedback ||
                            ""
                        )
                      }
                    >
                      Lưu đánh giá
                    </Button>
                  </Box>
                );
              })}
          </Stack>
        )}
        {isEndingCampaign && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <CircularProgress size={30} thickness={5} color="primary" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setOpenEvaluateDialog(false)}
          disabled={isEndingCampaign}
        >
          Đóng
        </Button>
        <Button
          onClick={() => {
            setOpenEvaluateDialog(false);
            setOpenConfirmDialog(true);
          }}
          color="secondary"
          disabled={isEndingCampaign}
          startIcon={
            isEndingCampaign ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          Kết thúc chiến dịch
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderStartDialog = () => (
    <Dialog open={openStartDialog} onClose={() => setOpenStartDialog(false)}>
      <DialogTitle fontWeight="bold">Xác nhận bắt đầu chiến dịch</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn bắt đầu chiến dịch này không?
        </Typography>
        {isStartingCampaign && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <CircularProgress size={30} thickness={5} color="primary" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setOpenStartDialog(false)}
          disabled={isStartingCampaign}
        >
          Hủy
        </Button>
        <Button
          onClick={confirmStartCampaign}
          color="secondary"
          disabled={isStartingCampaign}
          startIcon={
            isStartingCampaign ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          {isStartingCampaign ? "Đang xử lý..." : "Bắt đầu chiến dịch"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderEndDialog = () => (
    <Dialog
      open={openConfirmDialog}
      onClose={() => setOpenConfirmDialog(false)}
    >
      <DialogTitle fontWeight="bold">Xác nhận kết thúc chiến dịch</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn tạo chứng chỉ tham gia chiến dịch cho các tình
          nguyện viên không?
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={generateCertificate}
              onChange={(e) => setGenerateCertificate(e.target.checked)}
              disabled={isEndingCampaign}
            />
          }
          label="Tạo chứng chỉ (Chỉ áp dụng cho chiến dịch đã kết thúc)"
        />
        {isEndingCampaign && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <CircularProgress size={30} thickness={5} color="primary" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setOpenConfirmDialog(false)}
          disabled={isEndingCampaign}
        >
          Hủy
        </Button>
        <Button
          onClick={confirmEndCampaign}
          color="secondary"
          disabled={isEndingCampaign}
          startIcon={
            isEndingCampaign ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          {isEndingCampaign ? "Đang xử lý..." : "Kết thúc chiến dịch"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box
      sx={{
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {alertMessage && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage}
        </Alert>
      )}
      <div className="tab-list-container">
        <ul className="tab-list">
          <li
            className={activeLink === "ongoing" ? "active" : ""}
            onClick={() => setActiveLink("ongoing")}
          >
            Quản lý Chiến dịch
          </li>
          <li
            className={activeLink === "ongoing" ? "active" : ""}
            onClick={() => {
              setActiveLink("ongoing");
              navigate("/manager/donations");
            }}
          >
            Quản lý Quyên Góp
          </li>
          <li
            className={activeLink === "finished" ? "active" : ""}
            onClick={() => {
              setActiveLink("finished");
              navigate("/manager/storms");
            }}
          >
            Quản lý bão
          </li>
        </ul>
      </div>
      <Paper
        sx={{
          mb: 3,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "1.4rem" }}>
          Chọn chiến dịch theo trạng thái:{" "}
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ maxWidth: "100%" }}
        >
          <Tab
            label={
              <Badge badgeContent={allCampaigns.length} color="default">
                <Typography>Tất cả</Typography>
              </Badge>
            }
            value="all"
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  allCampaigns.filter((c) => c.acceptStatus === "pending")
                    .length
                }
                color="warning"
              >
                <Typography>Pending</Typography>
              </Badge>
            }
            value="pending"
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  allCampaigns.filter((c) => c.acceptStatus === "approved")
                    .length
                }
                color="success"
              >
                <Typography>Approved</Typography>
              </Badge>
            }
            value="approved"
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  allCampaigns.filter((c) => c.acceptStatus === "rejected")
                    .length
                }
                color="error"
              >
                <Typography>Rejected</Typography>
              </Badge>
            }
            value="rejected"
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  allCampaigns.filter((c) => c.status === "upcoming").length
                }
                color="info"
              >
                <Typography>Upcoming</Typography>
              </Badge>
            }
            value="upcoming"
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  allCampaigns.filter((c) => c.status === "in-progress").length
                }
                color="info"
              >
                <Typography>In Progress</Typography>
              </Badge>
            }
            value="in-progress"
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  allCampaigns.filter((c) => c.status === "completed").length
                }
                color="primary"
              >
                <Typography>Completed</Typography>
              </Badge>
            }
            value="completed"
          />
        </Tabs>
      </Paper>

      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: "center",
          "& > .MuiGrid-item": {
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: {
              xs: "100%",
              sm: "calc(50% - 24px)",
              md: "calc(33.33% - 24px)",
              lg: "calc(20% - 24px)",
            },
            maxWidth: {
              xs: "100%",
              sm: "calc(50% - 24px)",
              md: "calc(33.33% - 24px)",
              lg: "calc(20% - 24px)",
            },
            padding: "12px !important",
          },
        }}
      >
        {filteredCampaigns.length === 0 ? (
          <Grid>
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No campaigns found for {activeTab} status
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Grid
              key={campaign._id}
              sx={{
                flexBasis: "20%",
                maxWidth: "20%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                  width: "100%",
                }}
                onClick={() => openCampaignDetail(campaign)}
              >
                <Chip
                  label={campaign.acceptStatus.toUpperCase()}
                  color={getStatusColor(campaign.acceptStatus) as any}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 1,
                    fontWeight: "bold",
                  }}
                />

                {campaign.image?.length > 0 ? (
                  <Box
                    sx={{
                      height: 160,
                      position: "relative",
                      overflow: "hidden",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      border: "1px solid #e0e0e0",
                      m: 1,
                      mt: 1.5,
                    }}
                  >
                    <img
                      src={campaign.image}
                      alt={campaign.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: "grey.200",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      m: 1,
                      mt: 1.5,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <ImageIcon fontSize="large" color="disabled" />
                  </Box>
                )}

                <CardContent
                  sx={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 1,
                    m: 1,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={campaign.status.toUpperCase()}
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                      sx={{ width: "100%" }}
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom noWrap>
                    {campaign.name}
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOn
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" noWrap>
                        {truncateAddress(campaign.location.address)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <DateRange
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {formatDate(campaign.startDate)} -{" "}
                        {formatDate(campaign.endDate)}
                      </Typography>
                    </Box>

                    {campaign.categories.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CategoryIcon
                            fontSize="small"
                            color="action"
                            sx={{ mr: 1 }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 1,
                          }}
                        >
                          {campaign.categories.map((category) => (
                            <Chip
                              key={category._id}
                              label={category.name}
                              size="small"
                              sx={{
                                backgroundColor: category.color,
                                color: "white",
                                "& .MuiChip-label": {
                                  fontSize: "0.7rem",
                                },
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              avatar={
                                <Avatar
                                  src={category.icon}
                                  alt={category.name}
                                  sx={{ width: 20, height: 20 }}
                                />
                              }
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      gap: 1,
                      mt: "auto",
                    }}
                  >
                    {renderActionButtons(campaign)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {renderStartDialog()}
      {renderEvaluateDialog()}
      {renderEndDialog()}

      <CampaignModal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        campaign={selectedCampaign}
        isLoaded={isLoaded}
        renderActionButtons={() =>
          selectedCampaign ? renderActionButtons(selectedCampaign) : null
        }
        formatDate={formatDate}
      />
    </Box>
  );
};

export default ManagerCampaign;
