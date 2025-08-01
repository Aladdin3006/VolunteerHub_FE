import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { editExpense } from "@/apis/expense";

interface Expense {
  _id: string;
  amount: number;
  description: string;
  evidences?: string[];
  approvalStatus: string;
  createdBy: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  afterSubmit?: () => void;
}

const EditExpenseDialog: React.FC<Props> = ({ open, onClose, expense, afterSubmit }) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open && expense) {
      setAmount(expense.amount || 0);
      setDescription(expense.description || "");
      setFiles([]);
      setError(null);
      setSuccess(null);
    }
  }, [open, expense]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files).slice(0, 5);
      if (e.target.files.length > 5) {
        setError("Chỉ được tải lên tối đa 5 hình ảnh!");
        return;
      }
      setFiles(fileList);
    }
  };

  const handleSubmit = async () => {
    if (!expense) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";

      const formData = new FormData();
      formData.append("amount", amount.toString());
      formData.append("description", description);
      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await editExpense(expense._id, token, formData);
      if (res.error) {
        throw new Error(res.error);
      }

      setSuccess("Cập nhật chi phí thành công");
      if (afterSubmit) afterSubmit();
      onClose();
    } catch (error: any) {
      setError(error.message || "Lỗi khi cập nhật chi phí");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa chi phí</DialogTitle>
      <DialogContent>
        <Box mt={1} display="flex" flexDirection="column" gap={2}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <TextField
            label="Số tiền"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <Box>
            <Typography variant="body2" mb={0.5}>
              Thêm hình ảnh minh chứng (nếu cần, tối đa 5):
            </Typography>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExpenseDialog;
