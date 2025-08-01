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
} from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";

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
      console.log("Debug: No peer reviews or userId", {
        peerReviews: reviewProps?.peerReviews,
        userId,
        reviewProps: reviewProps,
      });
      return false;
    }

    const result = reviewProps.peerReviews.some(
      (review) => review.reviewer === userId && review.reviewee === revieweeId
    );
    return result;
  };

  const getAvailableUsersForReview = () => {
    if (!reviewProps?.assignedUsers) return [];

    return reviewProps.assignedUsers.filter((user) => {
      if (user.userId._id === userId) return false;
      return true;
    });
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Chọn tình nguyện viên</InputLabel>
              <Select
                value={selectedRevieweeId}
                onChange={(e) => setSelectedRevieweeId(e.target.value)}
                label="Chọn tình nguyện viên"
                disabled={isSubmitting}
                sx={{ minWidth: 200 }}
              >
                {getAvailableUsersForReview().map((user) => {
                  const isReviewed = hasReviewed(user.userId._id);
                  const isLeader = leaderId === user.userId._id;
                  const avatarUrl = user.avatar || user.userId.avatar; // Use top-level avatar or userId.avatar
                  return (
                    <MenuItem
                      key={user.userId._id}
                      value={user.userId._id}
                      disabled={isReviewed}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={avatarUrl || undefined}
                          alt={user.userName}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Typography
                          sx={{
                            color: isReviewed
                              ? "text.disabled"
                              : "text.primary",
                          }}
                        >
                          {user.userId.fullName ||
                            user.userName ||
                            `Tình nguyện viên ${user.userId._id}`}
                          {isLeader && (
                            <StarIcon
                              fontSize="small"
                              sx={{ ml: 0.5, color: "gold" }}
                            />
                          )}
                        </Typography>
                        <Chip
                          label={isReviewed ? "Đã đánh giá" : "Chưa đánh giá"}
                          color={isReviewed ? "success" : "default"}
                          size="small"
                        />
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {reviewProps.peerReviews && reviewProps.peerReviews.length > 0 && (
              <Box
                sx={{ mb: 2, p: 1, border: "1px solid #eee", borderRadius: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Đánh giá đồng nghiệp hiện có
                </Typography>
                {reviewProps.peerReviews.map((review, index) => {
                  const revieweeUser = reviewProps.assignedUsers.find(
                    (u) => u.userId._id === review.reviewee
                  );
                  const reviewerUser = reviewProps.assignedUsers.find(
                    (u) => u.userId._id === review.reviewer
                  );
                  const revieweeAvatar =
                    revieweeUser?.avatar || revieweeUser?.userId.avatar;
                  const reviewerAvatar =
                    reviewerUser?.avatar || reviewerUser?.userId.avatar;

                  return (
                    <Box
                      key={index}
                      sx={{ mb: 1, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <strong>Người đánh giá:</strong>&nbsp;
                        <Avatar
                          src={reviewerAvatar || undefined}
                          alt={reviewerUser?.userName || review.reviewer}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        {reviewerUser?.userId.fullName ||
                          reviewerUser?.userName ||
                          review.reviewer}
                        {leaderId === reviewerUser?.userId._id && (
                          <StarIcon
                            fontSize="small"
                            sx={{ ml: 0.5, mb: 0.5, color: "gold" }}
                          />
                        )}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <strong>Người được đánh giá:</strong>&nbsp;
                        <Avatar
                          src={revieweeAvatar || undefined}
                          alt={revieweeUser?.userName || review.reviewee}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        {revieweeUser?.userId.fullName ||
                          revieweeUser?.userName ||
                          review.reviewee}
                        {leaderId === revieweeUser?.userId._id && (
                          <StarIcon
                            fontSize="small"
                            sx={{ ml: 0.5, mb: 0.5, color: "gold" }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Điểm:</strong> {review.score}/5
                      </Typography>
                      <Typography variant="body2">
                        <strong>Bình luận:</strong> {review.comment}
                      </Typography>
                    </Box>
                  );
                })}
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

            {selectedRevieweeId && !hasReviewed(selectedRevieweeId) && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Đánh giá của bạn
                </Typography>
                <Rating
                  value={reviewProps.score}
                  onChange={(e, value) => reviewProps.setScore(value || 0)}
                  max={5}
                  precision={0.5}
                  disabled={isSubmitting}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Bình luận"
                  multiline
                  rows={3}
                  value={reviewProps.comment}
                  onChange={(e) => reviewProps.setComment(e.target.value)}
                  fullWidth
                  margin="normal"
                  disabled={isSubmitting}
                  sx={{ mb: 1 }}
                />
              </>
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
