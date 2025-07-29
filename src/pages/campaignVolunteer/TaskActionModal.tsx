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
  CircularProgress,
  Slider,
} from "@mui/material";

interface TaskActionModalProps {
  open: boolean;
  onClose: () => void;
  mode: "complete" | "report" | "review";
  taskId: string | null;
  onSubmit: (taskId: string, content: string, images: File[]) => void;
  reviewProps?: {
    score: number;
    setScore: (score: number) => void;
    comment: string;
    setComment: (comment: string) => void;
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

  useEffect(() => {
    if (open) {
      setContent("");
      setTitle("");
      setImages([]);
      if (reviewProps) {
        reviewProps.setScore(0);
        reviewProps.setComment("");
      }
    }
  }, [open, reviewProps]);

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
      if (mode === "review" && reviewProps) {
        // For review mode, pass empty content and images since they are not needed
        await onSubmit(taskId, "", []);
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
      <DialogContent>
        {mode === "review" && reviewProps ? (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Điểm số (0-100):</Typography>
            <Slider
              value={reviewProps.score}
              onChange={(e, value) => reviewProps.setScore(value as number)}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              disabled={isSubmitting}
            />
            <TextField
              label="Bình luận"
              multiline
              rows={4}
              value={reviewProps.comment}
              onChange={(e) => reviewProps.setComment(e.target.value)}
              fullWidth
              margin="normal"
              disabled={isSubmitting}
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
                sx={{ mt: 2 }}
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
              sx={{ mt: 2 }}
              disabled={isSubmitting}
            />
            {mode === "complete" && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Ảnh minh chứng (nếu có):
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (mode === "review" && reviewProps
              ? reviewProps.score === 0 || !reviewProps.comment.trim()
              : !content.trim() || (mode === "report" && !title.trim()))
          }
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
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
