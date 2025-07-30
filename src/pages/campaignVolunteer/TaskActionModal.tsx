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
} from "@mui/material";

interface TaskActionModalProps {
  open: boolean;
  onClose: () => void;
  mode: "complete" | "report" | "review";
  taskId: string | null;
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
    assignedUsers: { userId: string; fullName?: string }[];
    staffReview?: {
      finalScore: number;
      overallComment: string;
      evaluatedBy: string;
    };
  };
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({
  open,
  onClose,
  mode,
  taskId,
  onSubmit,
  reviewProps,
}) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRevieweeId, setSelectedRevieweeId] = useState<string>("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.userId;

  // Only reset non-review fields when modal opens
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
                {reviewProps.assignedUsers
                  .filter((user) => user.userId !== userId)
                  .map((user) => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.fullName || `Tình nguyện viên ${user.userId}`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {reviewProps.staffReview && (
              <Box
                sx={{ mb: 2, p: 1, border: "1px solid #eee", borderRadius: 2 }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Đánh giá của Staff
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
            <Typography variant="subtitle1" gutterBottom>
              Đánh giá của bạn
            </Typography>
            <Rating
              value={reviewProps.score}
              onChange={(e, value) => reviewProps.setScore(value || 0)}
              max={5}
              precision={0.5}
              disabled={isSubmitting || !selectedRevieweeId}
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
              disabled={isSubmitting || !selectedRevieweeId}
              sx={{ mb: 1 }}
            />
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
