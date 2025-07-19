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
  onSubmit: (content: string, images: File[]) => void;
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({
  open,
  onClose,
  mode,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (open) {
      setContent('');
      setImages([]);
    }
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    onSubmit(content, images);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {mode === 'complete' ? 'Hoàn thành nhiệm vụ' : 'Báo cáo sự cố'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={mode === 'complete' ? 'Nội dung hoàn thành' : 'Mô tả sự cố'}
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Ảnh minh chứng (nếu có):
          </Typography>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === 'complete' ? 'Gửi hoàn thành' : 'Gửi báo cáo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskActionModal;
