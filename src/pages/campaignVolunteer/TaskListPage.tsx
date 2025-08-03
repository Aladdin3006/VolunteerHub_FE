import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Container,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Paper,
  Stack,
  Avatar,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Chat as ChatIcon,
  Close as CloseIcon,
  CheckCircle,
  Schedule,
  Info,
  KeyboardArrowLeft,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import {
  fetchPhasesByCampaignId,
  submitTaskApi,
  reviewPeerTaskApi,
} from "../../apis/task";
import { ISSUE_API } from "../../apis/issue";
import TaskActionModal from "./TaskActionModal";
import { getCampaignVolunteerDetail } from "../../apis/campaign";
import CampaignChatModal from "../../components/chat/CampaignChat";
import FaceCheckinModal from "./FaceCheckinModal";
import { Star as StarIcon } from "@mui/icons-material";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  leaderId: string;
  submission?: {
    content: string;
    images: string[];
    submittedAt: string;
    submittedBy: string;
  };
  peerReviews?: {
    reviewer: string;
    reviewee: string;
    score: number;
    comment: string;
  }[];
  staffReview?: {
    evaluatedBy: string;
    overallComment: string;
    finalScore: number;
    reviewedAt: string;
  };
  assignedUsers: {
    userId: { _id: string; fullName?: string; avatar?: string };
    userName: string;
    avatar?: string;
  }[];
}

interface PhaseDay {
  _id: string;
  date: string;
  tasks: Task[];
  checkinLocation: {
    coordinates: [number, number];
    address: string;
  };
  checkinStatus?: {
    hasCheckedIn: boolean;
    checkinTime: string | null;
    method: string | null;
  };
}

interface Phase {
  _id: string;
  name: string;
  phaseDays: PhaseDay[];
}

const TaskListPage: React.FC = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();

  const [phases, setPhases] = useState<Phase[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedPhaseDay, setExpandedPhaseDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"complete" | "report" | "review">(
    "complete"
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedRevieweeId, setSelectedRevieweeId] = useState<string | null>(
    null
  );
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignImageUrl, setCampaignImageUrl] = useState<string | null>(null);
  const [checkedInPhaseDays, setCheckedInPhaseDays] = useState<string[]>([]);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [selectedPhaseDayId, setPhaseDayId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedCheckinLocation, setSelectedCheckinLocation] = useState<{
    coordinates: [number, number];
    address: string;
  } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || user?._id;

  useEffect(() => {
    const saved = localStorage.getItem("checkedInPhaseDays");
    if (saved) {
      try {
        setCheckedInPhaseDays(JSON.parse(saved));
      } catch (err) {
        console.error("Error parsing localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "checkedInPhaseDays",
      JSON.stringify(checkedInPhaseDays)
    );
  }, [checkedInPhaseDays]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in_progress":
        return "Chưa nộp";
      case "submitted":
        return "Đã nộp";
      case "completed":
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "submitted":
        return "warning";
      case "in_progress":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle />;
      case "submitted":
        return <Schedule />;
      case "in_progress":
        return <Info />;
      default:
        return <Info />;
    }
  };

  const openModalWithTaskId = (
    taskId: string,
    mode: "complete" | "report" | "review",
    revieweeId?: string,
    leaderId?: string
  ) => {
    setSelectedTaskId(taskId);
    setModalMode(mode);
    if (mode === "review" && revieweeId) {
      setSelectedRevieweeId(revieweeId);
    } else {
      setSelectedRevieweeId(null);
    }
    setReviewScore(0);
    setReviewComment("");
    setModalOpen(true);
  };

  const handleCheckIn = (
    phaseId: string,
    phaseDayId: string,
    checkinLocation: { coordinates: [number, number]; address: string }
  ) => {
    setSelectedPhaseId(phaseId);
    setPhaseDayId(phaseDayId);
    setSelectedCheckinLocation({
      coordinates: checkinLocation.coordinates,
      address: checkinLocation.address,
    });
    setCheckinModalOpen(true);
  };

  const handleCheckinSuccess = (phaseDayId: string) => {
    const idStr = String(phaseDayId);
    setCheckedInPhaseDays((prev) => {
      if (prev.includes(idStr)) {
        return prev;
      }
      const updated = [...prev, idStr];
      console.log("📝 Updated checkedInPhaseDays:", updated);
      return updated;
    });
    setCheckinModalOpen(false);
  };

  const handleSubmitTaskAction = async (
    taskId: string,
    content: string,
    images: File[],
    revieweeId?: string
  ) => {
    const userString = localStorage.getItem("user");
    const token = userString ? JSON.parse(userString).token : null;

    if (!token || !taskId) {
      alert("Thiếu token hoặc taskId!");
      return;
    }

    try {
      if (modalMode === "complete") {
        await submitTaskApi(taskId, content, images, token);
        alert("Nộp báo cáo thành công");
      } else if (modalMode === "report") {
        const [title, ...descParts] = content.trim().split("\n");
        const description = descParts.join("\n") || "Không có mô tả chi tiết";
        await ISSUE_API.createIssue({
          type: "task_issue",
          title: title || "Báo cáo sự cố nhiệm vụ",
          relatedEntity: {
            type: "Task",
            entityId: taskId,
          },
          description: description,
          status: "open",
        });
        alert("Gửi báo cáo sự cố thành công");
      } else if (modalMode === "review" && revieweeId) {
        const [score, ...commentParts] = content.split("\n");
        await reviewPeerTaskApi(
          taskId,
          revieweeId,
          parseFloat(score),
          commentParts.join("\n") || "Không có bình luận",
          token
        );
        alert("Gửi đánh giá đồng nghiệp thành công");
      }
      const phaseRes = await fetchPhasesByCampaignId(campaignId!, token);
      setPhases(phaseRes.data.phases);
    } catch (err: any) {
      alert(err.response?.data?.message || "Đã có lỗi xảy ra");
      console.error(err);
    } finally {
      setModalOpen(false);
      setSelectedRevieweeId(null);
      setReviewScore(0);
      setReviewComment("");
    }
  };

  const handleViewReviews = (task: Task) => {
    setSelectedTask(task);
    setViewReviewModalOpen(true);
    setTabValue(0);
  };

  useEffect(() => {
    const fetchAll = async () => {
      const userString = localStorage.getItem("user");
      const token = userString ? JSON.parse(userString).token : null;
      if (!token || !campaignId) {
        setError("Token không tồn tại hoặc campaignId không hợp lệ");
        return;
      }

      setLoading(true);
      try {
        const campaignDetail = await getCampaignVolunteerDetail(campaignId);
        setCampaignName(campaignDetail.name);
        setCampaignImageUrl(campaignDetail.image || null);
        setStartDate(campaignDetail.startDate || "");
        setEndDate(campaignDetail.endDate || "");
        const phaseRes = await fetchPhasesByCampaignId(campaignId, token);
        setPhases(phaseRes.data.phases);
        if (phaseRes.data.phases.length > 0)
          setExpandedPhase(phaseRes.data.phases[0]._id);
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [campaignId]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: campaignImageUrl
            ? `url(${campaignImageUrl})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(20px) brightness(0.3)",
          zIndex: -2,
        },
        "&::after": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(13, 71, 161, 0.8) 0%, rgba(25, 118, 210, 0.6) 100%)",
          zIndex: -1,
        },
      }}
    >
      <Header />

      <Container maxWidth="lg" sx={{ pt: 12, pb: 5 }}>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<KeyboardArrowLeft />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Quay lại
            </Button>
          </Stack>

          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                textAlign: "center",
                fontSize: { xs: "2.2rem", sm: "3.2rem", md: "3.8rem" },
                fontFamily:
                  '"Nunito Sans", "Roboto", "Helvetica Neue", sans-serif',
                background: "linear-gradient(45deg, #1976d2, #00b4d8)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 6px rgba(25, 118, 210, 0.25)",
                letterSpacing: "0.3px",
                lineHeight: 1.25,
              }}
            >
              {campaignName}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                mb: 2,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              {startDate && endDate
                ? `Thời gian diễn ra: ${formatDate(startDate)} - ${formatDate(
                    endDate
                  )}`
                : "Thời gian diễn ra: Đang cập nhật"}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Danh sách nhiệm vụ chiến dịch
            </Typography>
          </Box>
        </Paper>

        {loading && (
          <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="h6">Đang tải dữ liệu...</Typography>
          </Paper>
        )}

        {error && (
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "error.light",
            }}
          >
            <Typography color="error" variant="h6">
              {error}
            </Typography>
          </Paper>
        )}

        <Stack spacing={3}>
          {phases.map((phase) => (
            <Paper
              key={phase._id}
              elevation={8}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <ListItem
                button
                onClick={() =>
                  setExpandedPhase(
                    expandedPhase === phase._id ? null : phase._id
                  )
                }
                sx={{
                  p: 3,
                  background:
                    expandedPhase === phase._id
                      ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                      : "linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #e8f4fd 0%, #d1e7dd 100%)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    mr: 2,
                    width: 56,
                    height: 56,
                  }}
                >
                  {phase.name.charAt(0)}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {phase.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body1" color="text.secondary">
                      {phase.phaseDays.length} ngày hoạt động
                    </Typography>
                  }
                />
                {expandedPhase === phase._id ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              <Collapse
                in={expandedPhase === phase._id}
                timeout="auto"
                unmountOnExit
              >
                <Box sx={{ p: 2, bgcolor: "rgba(248, 250, 252, 0.8)" }}>
                  <Stack spacing={3}>
                    {phase.phaseDays.map((day) => (
                      <Paper
                        key={day._id}
                        elevation={4}
                        sx={{
                          borderRadius: 3,
                          overflow: "hidden",
                          background: "white",
                        }}
                      >
                        <ListItem
                          button
                          onClick={() =>
                            setExpandedPhaseDay(
                              String(day._id) === String(expandedPhaseDay)
                                ? null
                                : String(day._id)
                            )
                          }
                          sx={{
                            p: 3,
                            background:
                              "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              gutterBottom
                            >
                              {formatDate(day.date)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {day.tasks.length} nhiệm vụ
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Button
                              variant={
                                day.checkinStatus?.hasCheckedIn
                                  ? "contained"
                                  : "outlined"
                              }
                              color={
                                day.checkinStatus?.hasCheckedIn
                                  ? "success"
                                  : "primary"
                              }
                              disabled={day.checkinStatus?.hasCheckedIn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckIn(
                                  phase._id,
                                  day._id,
                                  day.checkinLocation
                                );
                              }}
                              sx={{
                                borderRadius: 3,
                                textTransform: "none",
                                fontWeight: 600,
                                px: 3,
                              }}
                            >
                              {day.checkinStatus?.hasCheckedIn
                                ? "✅ Đã điểm danh"
                                : "Điểm danh"}
                            </Button>
                            {expandedPhaseDay === day._id ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )}
                          </Stack>
                        </ListItem>

                        <Collapse
                          in={expandedPhaseDay === day._id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{ p: 3, bgcolor: "rgba(248, 250, 252, 0.5)" }}
                          >
                            {day.tasks.length === 0 ? (
                              <Typography
                                variant="body1"
                                textAlign="center"
                                color="text.secondary"
                              >
                                Không có nhiệm vụ nào.
                              </Typography>
                            ) : (
                              <Stack spacing={3}>
                                {day.tasks.map((task) => (
                                  <Card
                                    key={task._id}
                                    elevation={6}
                                    sx={{
                                      borderRadius: 3,
                                      background: "white",
                                      border: "1px solid rgba(0, 0, 0, 0.08)",
                                    }}
                                  >
                                    <CardContent sx={{ p: 3 }}>
                                      <Stack spacing={2}>
                                        <Box>
                                          <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            gutterBottom
                                            color="primary"
                                          >
                                            {task.title}
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ lineHeight: 1.6 }}
                                          >
                                            {task.description}
                                          </Typography>
                                        </Box>

                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: 2,
                                          }}
                                        >
                                          <Chip
                                            icon={getStatusIcon(task.status)}
                                            label={getStatusLabel(task.status)}
                                            color={getStatusColor(task.status)}
                                            variant="filled"
                                            sx={{
                                              fontWeight: 600,
                                              px: 2,
                                              py: 1,
                                            }}
                                          />

                                          <Stack direction="row" spacing={2}>
                                            {task.leaderId === userId && (
                                              <Button
                                                variant={
                                                  task.status === "in_progress"
                                                    ? "contained"
                                                    : "outlined"
                                                }
                                                color="success"
                                                onClick={() =>
                                                  openModalWithTaskId(
                                                    task._id,
                                                    "complete"
                                                  )
                                                }
                                                disabled={
                                                  task.status === "submitted" ||
                                                  task.status === "completed"
                                                }
                                                sx={{
                                                  borderRadius: 3,
                                                  textTransform: "none",
                                                  fontWeight: 600,
                                                  px: 3,
                                                }}
                                              >
                                                {task.status === "in_progress"
                                                  ? "Nộp báo cáo"
                                                  : "Đã nộp"}
                                              </Button>
                                            )}
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              onClick={() =>
                                                openModalWithTaskId(
                                                  task._id,
                                                  "report"
                                                )
                                              }
                                              sx={{
                                                borderRadius: 3,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                px: 3,
                                              }}
                                            >
                                              Sự cố
                                            </Button>
                                            <Button
                                              variant="outlined"
                                              color="primary"
                                              onClick={() =>
                                                openModalWithTaskId(
                                                  task._id,
                                                  "review"
                                                )
                                              }
                                              sx={{
                                                borderRadius: 3,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                px: 3,
                                              }}
                                            >
                                              Đánh giá đồng nghiệp
                                            </Button>
                                            <Button
                                              variant="outlined"
                                              color="info"
                                              onClick={() =>
                                                handleViewReviews(task)
                                              }
                                              sx={{
                                                borderRadius: 3,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                px: 3,
                                              }}
                                            >
                                              Xem đánh giá nhiệm vụ
                                            </Button>
                                          </Stack>
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Collapse>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Stack>

        <Fade in={!isChatOpen}>
          <IconButton
            onClick={() => setIsChatOpen(true)}
            sx={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: "0 8px 32px rgba(25, 118, 210, 0.4)",
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease",
              zIndex: 1300,
            }}
          >
            <ChatIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Fade>

        <Fade in={isChatOpen}>
          <Paper
            elevation={20}
            sx={{
              position: "fixed",
              bottom: 120,
              right: 24,
              width: 320,
              height: 500,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              zIndex: 1400,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Chat: {campaignName}
              </Typography>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setIsChatOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <CampaignChatModal campaignId={campaignId || ""} />
            </Box>
          </Paper>
        </Fade>

        <TaskActionModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedRevieweeId(null);
            setReviewScore(0);
            setReviewComment("");
          }}
          mode={modalMode}
          taskId={selectedTaskId}
          leaderId={
            selectedTaskId
              ? phases
                  .flatMap((p) => p.phaseDays)
                  .flatMap((pd) => pd.tasks)
                  .find((t) => t._id === selectedTaskId)?.leaderId
              : null
          }
          onSubmit={handleSubmitTaskAction}
          reviewProps={
            modalMode === "report"
              ? {
                  score: reviewScore,
                  setScore: setReviewScore,
                  comment: reviewComment,
                  setComment: setReviewComment,
                  assignedUsers: selectedTaskId
                    ? phases
                        .flatMap((p) => p.phaseDays)
                        .flatMap((pd) => pd.tasks)
                        .find((t) => t._id === selectedTaskId)?.assignedUsers ||
                      []
                    : [],
                  peerReviews: selectedTaskId
                    ? phases
                        .flatMap((p) => p.phaseDays)
                        .flatMap((pd) => pd.tasks)
                        .find((t) => t._id === selectedTaskId)?.peerReviews ||
                      []
                    : [],
                }
              : undefined
          }
        />

        {checkinModalOpen &&
          selectedPhaseId &&
          selectedPhaseDayId &&
          selectedCheckinLocation && (
            <FaceCheckinModal
              open={checkinModalOpen}
              onClose={() => setCheckinModalOpen(false)}
              campaignId={campaignId || ""}
              phaseId={selectedPhaseId}
              phaseDayId={selectedPhaseDayId}
              checkinLocation={selectedCheckinLocation}
              onCheckinSuccess={handleCheckinSuccess}
            />
          )}

        <Dialog
          open={viewReviewModalOpen}
          onClose={() => setViewReviewModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Xem đánh giá nhiệm vụ:{" "}
            <strong style={{ color: "#1976d2" }}>{selectedTask?.title}</strong>
          </DialogTitle>
          <DialogContent>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              centered
            >
              <Tab label="Đánh giá của VHHT" />
              <Tab label="Đánh giá của mọi người" />
              <Tab label="Báo cáo đã nộp" />
            </Tabs>
            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  {selectedTask?.staffReview ? (
                    <>
                      <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <strong>Điểm số:</strong>&nbsp;
                        {selectedTask.staffReview.finalScore}
                        <StarIcon
                          fontSize="small"
                          sx={{ color: "gold", ml: 0.5 }}
                        />
                      </Typography>
                      <Typography variant="body1">
                        <strong>Bình luận:</strong>{" "}
                        {selectedTask.staffReview.overallComment}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Thời gian:</strong>{" "}
                        {new Date(
                          selectedTask.staffReview.reviewedAt
                        ).toLocaleString("vi-VN")}
                      </Typography>
                    </>
                  ) : (
                    <Typography>Chưa có đánh giá từ staff.</Typography>
                  )}
                </Box>
              )}
              {tabValue === 1 && (
                <Box>
                  {selectedTask?.peerReviews &&
                  selectedTask.peerReviews.length > 0 ? (
                    selectedTask.peerReviews.map((review, index) => {
                      const reviewerUser = selectedTask.assignedUsers.find(
                        (u) => u.userId._id === review.reviewer
                      );
                      const revieweeUser = selectedTask.assignedUsers.find(
                        (u) => u.userId._id === review.reviewee
                      );
                      const reviewerAvatar =
                        reviewerUser?.avatar || reviewerUser?.userId.avatar;
                      const revieweeAvatar =
                        revieweeUser?.avatar || revieweeUser?.userId.avatar;

                      return (
                        <Box
                          key={index}
                          sx={{ mb: 2, borderBottom: "1px solid #eee", pb: 1 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <strong>Người đánh giá:</strong>&nbsp;
                            <Avatar
                              src={reviewerAvatar || undefined}
                              alt={reviewerUser?.userName || review.reviewer}
                              sx={{ width: 24, height: 24, mx: 1 }}
                            />
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {reviewerUser?.userId.fullName ||
                                reviewerUser?.userName ||
                                review.reviewer}
                              {selectedTask.leaderId ===
                                reviewerUser?.userId._id && (
                                <StarIcon
                                  fontSize="small"
                                  sx={{ color: "gold", ml: 0.5 }}
                                />
                              )}
                            </Box>
                          </Typography>

                          <Typography
                            variant="body1"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <strong>Người được đánh giá:</strong>&nbsp;
                            <Avatar
                              src={revieweeAvatar || undefined}
                              alt={revieweeUser?.userName || review.reviewee}
                              sx={{ width: 24, height: 24, mx: 1 }}
                            />
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {revieweeUser?.userId.fullName ||
                                revieweeUser?.userName ||
                                review.reviewee}
                              {selectedTask.leaderId ===
                                revieweeUser?.userId._id && (
                                <StarIcon
                                  fontSize="small"
                                  sx={{ color: "gold", ml: 0.5 }}
                                />
                              )}
                            </Box>
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <strong>Điểm số:</strong>&nbsp;
                            {review.score}
                            <StarIcon
                              fontSize="small"
                              sx={{ color: "gold", ml: 0.5 }}
                            />
                          </Typography>
                          <Typography variant="body1">
                            <strong>Bình luận:</strong> {review.comment}
                          </Typography>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography>Chưa có đánh giá từ đồng nghiệp.</Typography>
                  )}
                </Box>
              )}
              {tabValue === 2 && (
                <Box>
                  {selectedTask?.submission ? (
                    <>
                      <Typography variant="body1">
                        <strong>Nội dung:</strong>{" "}
                        {selectedTask.submission.content}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <strong>Người nộp:</strong>&nbsp;
                        <Avatar
                          src={
                            selectedTask.assignedUsers.find(
                              (u) =>
                                u.userId._id ===
                                selectedTask.submission?.submittedBy
                            )?.avatar ||
                            selectedTask.assignedUsers.find(
                              (u) =>
                                u.userId._id ===
                                selectedTask.submission?.submittedBy
                            )?.userId.avatar ||
                            undefined
                          }
                          alt={
                            selectedTask.assignedUsers.find(
                              (u) =>
                                u.userId._id ===
                                selectedTask.submission?.submittedBy
                            )?.userName || selectedTask.submission.submittedBy
                          }
                          sx={{ width: 24, height: 24, mx: 1 }}
                        />
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {selectedTask.assignedUsers.find(
                            (u) =>
                              u.userId._id ===
                              selectedTask.submission?.submittedBy
                          )?.userId.fullName ||
                            selectedTask.assignedUsers.find(
                              (u) =>
                                u.userId._id ===
                                selectedTask.submission?.submittedBy
                            )?.userName ||
                            selectedTask.submission.submittedBy}
                          <StarIcon
                            fontSize="small"
                            sx={{ color: "gold", ml: 0.5 }}
                          />
                        </Box>
                      </Typography>
                      <Typography variant="body1">
                        <strong>Thời gian nộp:</strong>{" "}
                        {new Date(
                          selectedTask.submission.submittedAt
                        ).toLocaleString("vi-VN")}
                      </Typography>
                      {selectedTask.submission.images.length > 0 && (
                        <Box>
                          <Typography variant="body1">
                            <strong>Hình ảnh:</strong>
                          </Typography>
                          {selectedTask.submission.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Submission ${index}`}
                              style={{
                                maxWidth: "200px",
                                margin: "10px",
                                maxHeight: "200px",
                                objectFit: "contain",
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography>Chưa có báo cáo được nộp.</Typography>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewReviewModalOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default TaskListPage;
