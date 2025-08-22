import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControlLabel, Checkbox, Stack, Typography, Box, IconButton, Tooltip
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import viLocale from "date-fns/locale/vi";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  onClose: () => void;
  pointId: string | null;
  apiBase: string;
  onSuccess?: () => void;
  authToken?: string; // nếu cần Bearer
};

type SelFile = { file: File; url: string; id: string };

const AddRescueDialog: React.FC<Props> = ({ open, onClose, pointId, apiBase, onSuccess, authToken }) => {
  const [rescueNote, setRescueNote] = useState("");
  const [note, setNote] = useState("");
  const [markAsRescued, setMarkAsRescued] = useState(false);
  const [rescuedAt, setRescuedAt] = useState<Date | null>(null);

  const [selected, setSelected] = useState<SelFile[]>([]); // các ảnh đã chọn (có preview)
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ rescuedAt?: string }>({});

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (authToken) h["Authorization"] = `Bearer ${authToken}`;
    return h;
  }, [authToken]);

  // Dọn URL khi dialog đóng
  useEffect(() => {
    if (!open && selected.length) {
      selected.forEach(s => URL.revokeObjectURL(s.url));
      setSelected([]);
    }
  }, [open]); // eslint-disable-line

  const validate = () => {
    const next: typeof errors = {};
    if (rescuedAt && isNaN(rescuedAt.getTime())) next.rescuedAt = "Thời gian không hợp lệ.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFilesAdd = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const additions: SelFile[] = Array.from(files).map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`
    }));
    // có thể limit ví dụ 10 ảnh
    setSelected(prev => {
      const merged = [...prev, ...additions];
      return merged.slice(0, 30); // limit tối đa 30 ảnh cho an toàn
    });
  };

  const handleRemoveOne = (id: string) => {
    setSelected(prev => {
      const tgt = prev.find(s => s.id === id);
      if (tgt) URL.revokeObjectURL(tgt.url);
      return prev.filter(s => s.id !== id);
    });
  };

  const handleClearAll = () => {
    selected.forEach(s => URL.revokeObjectURL(s.url));
    setSelected([]);
  };

  const resetForm = () => {
    setRescueNote("");
    setNote("");
    setRescuedAt(null);
    setMarkAsRescued(false);
    handleClearAll();
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!pointId) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Append ảnh
      selected.forEach(s => fd.append("images", s.file));
      // Thông tin khác
      if (rescueNote) fd.append("rescueNote", rescueNote);
      if (note) fd.append("note", note);
      if (rescuedAt) fd.append("rescuedAt", rescuedAt.toISOString());
      fd.append("markAsRescued", String(markAsRescued));

      const res = await fetch(`${apiBase}/relief-point/${pointId}/rescues`, {
        method: "POST",
        headers, // KHÔNG set Content-Type khi dùng FormData
        body: fd
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSuccess?.();
      onClose();
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Thêm lượt cứu trợ thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Thêm lượt cứu trợ</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>

          <TextField
            label="Ghi chú cứu trợ"
            value={rescueNote}
            onChange={(e) => setRescueNote(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
            <DateTimePicker
              label="Thời gian cứu trợ (tuỳ chọn)"
              value={rescuedAt}
              onChange={(d) => setRescuedAt(d)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(errors.rescuedAt),
                  helperText: errors.rescuedAt
                }
              }}
            />
          </LocalizationProvider>

          <FormControlLabel
            control={
              <Checkbox
                checked={markAsRescued}
                onChange={(e) => setMarkAsRescued(e.target.checked)}
              />
            }
            label="Đánh dấu điểm đã được cứu"
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" component="label">
              Chọn ảnh 
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleFilesAdd(e.target.files)}
              />
            </Button>
            {selected.length > 0 && (
              <Tooltip title="Xoá tất cả ảnh đã chọn">
                <Button color="error" onClick={handleClearAll} variant="text">
                  Xoá tất cả
                </Button>
              </Tooltip>
            )}
            <Typography variant="caption" color="text.secondary">
              {selected.length > 0 ? `Đã chọn ${selected.length} ảnh` : "Chưa chọn ảnh"}
            </Typography>
          </Stack>

          {selected.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1
              }}
            >
              {selected.map((s) => (
                <Box key={s.id} sx={{ position: "relative", borderRadius: 1, overflow: "hidden" }}>
                  <img
                    src={s.url}
                    alt="preview"
                    style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveOne(s.id)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.75)" }
                    }}
                    aria-label="Xoá ảnh"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting || !pointId}>
          {submitting ? "Đang lưu..." : "Lưu lượt cứu trợ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRescueDialog;
