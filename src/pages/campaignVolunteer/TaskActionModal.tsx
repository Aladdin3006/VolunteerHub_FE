import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Avatar,
  Badge,
  Stack,
} from "@mui/material";
import { CheckCircle, Star as StarIcon } from "@mui/icons-material";

interface TaskActionModalProps {
  open: boolean;
  onClose: () => void;
  mode: "complete" | "report" | "review";
  taskId: string | null;
  leaderId: string | null; // Check for leader
  onSubmit: (
    taskId: string,
    content: string,
    images: File[],
    revieweeId?: string
  ) => void;
  reviewProps?: {
    score: number;
    setScore: (score: number) => void;
    comment: string;
    setComment: (comment: string) => void;
    assignedUsers: {
      userId: { _id: string; fullName?: string; avatar?: string };
      userName: string;
      avatar?: string;
    }[];
    staffReview?: {
      finalScore: number;
      overallComment: string;
      evaluatedBy: string;
    };
    peerReviews?: {
      reviewer: string;
      reviewee: string;
      score: number;
      comment: string;
    }[];
  };
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({
  open,
  onClose,
  mode,
  taskId,
  leaderId,
  onSubmit,
  reviewProps,
}) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRevieweeId, setSelectedRevieweeId] = useState<string>("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (open) {
      setContent("");
      setTitle("");
      setImages([]);
      setSelectedRevieweeId("");
    }
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !taskId) {
      if (!taskId) alert("Không tìm thấy taskId");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "review" && reviewProps && selectedRevieweeId) {
        await onSubmit(
          taskId,
          `${reviewProps.score}\n${reviewProps.comment}`,
          [],
          selectedRevieweeId
        );
      } else {
        const finalContent =
          mode === "report" ? `${title}\n${content}` : content;
        await onSubmit(taskId, finalContent, images);
      }
      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi:", err);
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasReviewed = (revieweeId: string) => {
    if (!reviewProps?.peerReviews || !userId) {
      return false;
    }

    const result = reviewProps.peerReviews.some(
      (review) => review.reviewer === userId && review.reviewee === revieweeId
    );
    return result;
  };

  const getAvailableUsersForReview = () => {
    if (!reviewProps?.assignedUsers) return [];

    return reviewProps.assignedUsers
      .filter((user) => user.userId._id !== userId) // Filter out current user
      .sort((a, b) => {
        // Sort by leader first, then by name
        const isALeader = a.userId._id === leaderId;
        const isBLeader = b.userId._id === leaderId;
        if (isALeader && !isBLeader) return -1;
        if (!isALeader && isBLeader) return 1;
        return (a.userId.fullName || a.userName).localeCompare(
          b.userId.fullName || b.userName
        );
      });
  };

  const getUserById = (id: string) => {
    return reviewProps?.assignedUsers.find((u) => u.userId._id === id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "complete"
          ? "Hoàn thành nhiệm vụ"
          : mode === "report"
          ? "Báo cáo sự cố"
          : "Đánh giá đồng nghiệp"}
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        {mode === "review" && reviewProps ? (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Chọn đồng nghiệp để đánh giá
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="select-volunteer-label">
                Tình nguyện viên
              </InputLabel>
              <Select
                labelId="select-volunteer-label"
                value={selectedRevieweeId}
                onChange={(e) => setSelectedRevieweeId(e.target.value)}
                label="Tình nguyện viên"
                disabled={isSubmitting}
                renderValue={(selected) => {
                  const user = getUserById(selected);
                  if (!user)
                    return <Typography>Chọn tình nguyện viên</Typography>;

                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        src={user.avatar || user.userId.avatar}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography>
                        {user.userId.fullName || user.userName}
                        {leaderId === user.userId._id && (
                          <StarIcon
                            fontSize="small"
                            sx={{ ml: 0.5, color: "gold" }}
                          />
                        )}
                      </Typography>
                      {hasReviewed(selected) && (
                        <Chip
                          label="Đã đánh giá"
                          size="small"
                          color="success"
                          icon={<CheckCircle fontSize="small" />}
                        />
                      )}
                    </Stack>
                  );
                }}
              >
                {getAvailableUsersForReview().map((user) => {
                  const isLeader = leaderId === user.userId._id;
                  const isReviewed = hasReviewed(user.userId._id);
                  const avatarUrl = user.avatar || user.userId.avatar;

                  return (
                    <MenuItem
                      key={user.userId._id}
                      value={user.userId._id}
                      disabled={isReviewed}
                      sx={{
                        py: 1.5,
                        "&.Mui-disabled": {
                          opacity: 0.7,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        width="100%"
                      >
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          badgeContent={
                            isLeader ? (
                              <StarIcon
                                fontSize="small"
                                sx={{ color: "gold" }}
                              />
                            ) : null
                          }
                        >
                          <Avatar
                            src={avatarUrl || undefined}
                            alt={user.userName}
                            sx={{ width: 40, height: 40 }}
                          />
                        </Badge>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {user.userId.fullName || user.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {isLeader ? "Trưởng nhóm" : "Thành viên"}
                          </Typography>
                        </Box>

                        {isReviewed ? (
                          <Chip
                            label="Đã đánh giá"
                            size="small"
                            color="success"
                            icon={<CheckCircle fontSize="small" />}
                          />
                        ) : (
                          <Chip
                            label="Chưa đánh giá"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {selectedRevieweeId && !hasReviewed(selectedRevieweeId) && (
              <Box
                sx={{
                  p: 3,
                  border: "1px solid #eee",
                  borderRadius: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Đánh giá cho{" "}
                  <strong>
                    {getUserById(selectedRevieweeId)?.userId.fullName ||
                      getUserById(selectedRevieweeId)?.userName}
                  </strong>
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Điểm đánh giá:</Typography>
                  <Rating
                    value={reviewProps.score}
                    onChange={(e, value) => reviewProps.setScore(value || 0)}
                    max={5}
                    precision={0.5}
                    size="large"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#ff6d75",
                      },
                      "& .MuiRating-iconHover": {
                        color: "#ff3d47",
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    (1 sao - Rất không hài lòng, 5 sao - Rất hài lòng)
                  </Typography>
                </Box>

                <TextField
                  label="Nhận xét chi tiết"
                  placeholder="Mô tả cụ thể về đóng góp và hiệu quả công việc..."
                  multiline
                  rows={4}
                  value={reviewProps.comment}
                  onChange={(e) => reviewProps.setComment(e.target.value)}
                  fullWidth
                  margin="normal"
                  disabled={isSubmitting}
                  sx={{ mb: 1 }}
                />
              </Box>
            )}

            {reviewProps.staffReview && (
              <Box
                sx={{ mb: 2, p: 1, border: "1px solid #eee", borderRadius: 2 }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Đánh giá của VHHT
                </Typography>
                <Typography>
                  <strong>Người đánh giá:</strong>{" "}
                  {reviewProps.staffReview.evaluatedBy}
                </Typography>
                <Typography>
                  <strong>Điểm số:</strong> {reviewProps.staffReview.finalScore}
                </Typography>
                <Typography>
                  <strong>Bình luận:</strong>{" "}
                  {reviewProps.staffReview.overallComment}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <>
            {mode === "report" && (
              <TextField
                fullWidth
                label="Tiêu đề sự cố"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
                disabled={isSubmitting}
              />
            )}
            <TextField
              fullWidth
              label={
                mode === "complete" ? "Nội dung hoàn thành" : "Mô tả chi tiết"
              }
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
              disabled={isSubmitting}
            />
            {mode === "complete" && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Ảnh minh chứng (nếu có):
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  style={{ marginBottom: "8px" }}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={{ mr: 1 }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (mode === "review" && reviewProps
              ? !selectedRevieweeId ||
                hasReviewed(selectedRevieweeId) ||
                reviewProps.score === 0 ||
                !reviewProps.comment.trim()
              : !content.trim() || (mode === "report" && !title.trim()))
          }
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{ px: 2, py: 1 }}
        >
          {mode === "complete"
            ? "Gửi hoàn thành"
            : mode === "report"
            ? "Gửi báo cáo"
            : "Gửi đánh giá"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskActionModal;
