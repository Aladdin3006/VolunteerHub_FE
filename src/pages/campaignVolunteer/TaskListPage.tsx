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
  TextField,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Chat as ChatIcon,
  Close as CloseIcon,
  CheckCircle,
  Schedule,
  Error,
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
import TaskActionModal from "./TaskActionModal";
import { getCampaignVolunteerDetail } from "../../apis/campaign";
import CampaignChatModal from "../../components/chat/CampaignChat";
import { reportIssueApi } from "../../apis/issue";
import FaceCheckinModal from "./FaceCheckinModal";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string; // Updated to match backend
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
  assignedUsers: {
    userId: string;
    submission?: {
      content: string;
      images: string[];
      submittedAt: string;
      submittedBy: string;
    };
    review?: {
      status: string;
      evaluation?: string;
      staffComment?: string;
      reviewedBy?: string;
      reviewedAt?: string;
    };
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
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedPhaseDay, setExpandedPhaseDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"complete" | "search" | "review">(
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
  } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "hoàn thành":
      case "approved":
        return "success";
      case "đang chờ":
      case "submitted":
        return "warning";
      case "bị từ chối":
      case "rejected":
        return "error";
      case "chưa nộp":
      case "pending":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "hoàn thành":
      case "approved":
        return <CheckCircle />;
      case "đang chờ":
      case "submitted":
        return <Schedule />;
      case "bị từ chối":
      case "rejected":
        return <Error />;
      case "chưa nộp":
      case "pending":
        return <Info />;
      default:
        return <Info />;
    }
  };

  const openModalWithTaskId = (
    taskId: string,
    mode: "complete" | "search" | "review",
    revieweeId?: string
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
    setSelectedCheckinLocation(checkinLocation);
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
    images: File[]
  ) => {
    console.log("Đã submit:", { taskId, content, images, mode: modalMode });
    const userString = localStorage.getItem("user");
    const token = userString ? JSON.parse(userString).token : null;

    if (!token || !taskId) {
      alert("Thiếu token hoặc taskId!");
      return;
    }

    try {
      if (modalMode === "complete") {
        await submitTaskApi(taskId, content, images, token);
        alert("Gửi hoàn thành nhiệm vụ thành công");
      } else if (modalMode === "search") {
        const [title, ...descParts] = content.trim().split("\n");
        const description = descParts.join("\n") || "Không có mô tả chi tiết";
        await reportIssueApi(
          title || "Không có tiêu đề",
          description,
          taskId,
          token
        );
        alert("Gửi báo cáo sự cố thành công");
      } else if (modalMode === "review" && selectedRevieweeId) {
        await reviewPeerTaskApi(
          taskId,
          selectedRevieweeId,
          reviewScore,
          reviewComment,
          token
        );
        alert("Gửi đánh giá đồng nghiệp thành công");
      }
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
        {/* Hero Section */}
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
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Danh sách nhiệm vụ chiến dịch
            </Typography>
          </Box>
        </Paper>

        {/* Loading and Error States */}
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

        {/* Phases List */}
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
                                ? "✅ Đã check-in"
                                : "Check-in"}
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
                                            icon={getStatusIcon(
                                              task.status || "pending"
                                            )}
                                            label={task.status || "Chưa nộp"}
                                            color={getStatusColor(
                                              task.status || "pending"
                                            )}
                                            variant="filled"
                                            sx={{
                                              fontWeight: 600,
                                              px: 2,
                                              py: 1,
                                            }}
                                          />

                                          <Stack direction="row" spacing={2}>
                                            <Button
                                              variant="contained"
                                              color="success"
                                              onClick={() =>
                                                openModalWithTaskId(
                                                  task._id,
                                                  "complete"
                                                )
                                              }
                                              sx={{
                                                borderRadius: 3,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                px: 3,
                                              }}
                                            >
                                              Hoàn thành
                                            </Button>
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              onClick={() =>
                                                openModalWithTaskId(
                                                  task._id,
                                                  "search"
                                                )
                                              }
                                              sx={{
                                                borderRadius: 3,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                px: 3,
                                              }}
                                            >
                                              Báo cáo
                                            </Button>
                                            <FormControl sx={{ minWidth: 120 }}>
                                              <InputLabel>
                                                Review Peer
                                              </InputLabel>
                                              <Select
                                                value=""
                                                onChange={(e) =>
                                                  openModalWithTaskId(
                                                    task._id,
                                                    "review",
                                                    e.target.value as string
                                                  )
                                                }
                                                label="Review Peer"
                                              >
                                                {task.assignedUsers
                                                  .filter(
                                                    (u) =>
                                                      u.userId !==
                                                      JSON.parse(
                                                        localStorage.getItem(
                                                          "user"
                                                        ) || "{}"
                                                      )?.userId
                                                  )
                                                  .map((user) => (
                                                    <MenuItem
                                                      key={user.userId}
                                                      value={user.userId}
                                                    >
                                                      User {user.userId}
                                                    </MenuItem>
                                                  ))}
                                              </Select>
                                            </FormControl>
                                          </Stack>
                                        </Box>
                                        {task.peerReviews &&
                                          task.peerReviews.length > 0 && (
                                            <Box>
                                              <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                              >
                                                Peer Reviews:
                                              </Typography>
                                              {task.peerReviews.map(
                                                (review, index) => (
                                                  <Box
                                                    key={index}
                                                    sx={{ mt: 1 }}
                                                  >
                                                    <Typography variant="body2">
                                                      Reviewer:{" "}
                                                      {review.reviewer},
                                                      Reviewee:{" "}
                                                      {review.reviewee}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                      Score: {review.score}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                      Comment: {review.comment}
                                                    </Typography>
                                                  </Box>
                                                )
                                              )}
                                            </Box>
                                          )}
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

        {/* Chat Feature */}
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
      </Container>

      {/* Modals */}
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
        onSubmit={handleSubmitTaskAction}
        reviewProps={
          modalMode === "review"
            ? {
                score: reviewScore,
                setScore: setReviewScore,
                comment: reviewComment,
                setComment: setReviewComment,
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
    </Box>
  );
};

export default TaskListPage;
