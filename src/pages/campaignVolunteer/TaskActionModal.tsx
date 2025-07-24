// TaskActionModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';

interface TaskActionModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'complete' | 'report';
  taskId: string | null;
  onSubmit: (taskId: string, content: string, images: File[]) => void;
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({
  open,
  onClose,
  mode,
  taskId,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setContent('');
      setTitle('');
      setImages([]);
    }
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
  if (isSubmitting) return; // ✅ Chặn gửi nhiều lần
  if (!taskId) {
    alert('Không tìm thấy taskId');
    return;
  }

  setIsSubmitting(true);

  try {
    const finalContent =
      mode === 'report' ? `${title}\n${content}` : content;

    await onSubmit(taskId, finalContent, images); // Gửi dữ liệu
    onClose(); // Đóng modal sau khi gửi thành công
  } catch (err) {
    console.error('Lỗi khi gửi:', err);
  } finally {
    setIsSubmitting(false); // Cho phép gửi lại sau khi xử lý xong
  }
};


  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {mode === 'complete' ? 'Hoàn thành nhiệm vụ' : 'Báo cáo sự cố'}
      </DialogTitle>
      <DialogContent>
        {mode === 'report' && (
          <TextField
            fullWidth
            label="Tiêu đề sự cố"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}

        <TextField
          fullWidth
          label={
            mode === 'complete' ? 'Nội dung hoàn thành' : 'Mô tả chi tiết'
          }
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mt: 2 }}
        />

        {mode === 'complete' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Ảnh minh chứng (nếu có):
            </Typography>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {mode === 'complete' ? 'Gửi hoàn thành' : 'Gửi báo cáo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskActionModal;
