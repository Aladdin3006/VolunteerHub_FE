import { forwardRef, useImperativeHandle, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface IProps {}

export interface IConfirmDialogRef {
  open: (title: string, content: string, callback: () => void) => void;
}

export const ConfirmDialog = forwardRef<IConfirmDialogRef, IProps>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [callback, setCallback] = useState<(() => void) | null>(null);

  const handleClose = () => setOpen(false);

  const handleOk = () => {
    callback?.();
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    open: (title: string, content: string, callback: () => void) => {
      setTitle(title);
      setContent(content);
      setCallback(() => callback);
      setOpen(true);
    },
  }));

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy bỏ</Button>
        <Button onClick={handleOk} variant="contained" color="primary">
          Đồng ý
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmDialog;
