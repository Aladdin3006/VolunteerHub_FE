import React, { useImperativeHandle, useState, forwardRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Stack,
} from "@mui/material";
import { createExpenseApi } from "@/apis/expense";
import { Snackbar, Alert } from "@mui/material";


export interface IExpenseDialogRef {
    open: (campaignId: string) => void;
}

interface Props {
    afterSubmit?: () => void;
}

export const ExpenseDialog = forwardRef<IExpenseDialogRef, Props>(({ afterSubmit }, ref) => {
    const [open, setOpen] = useState(false);
    const [campaignId, setCampaignId] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);


    useImperativeHandle(ref, () => ({
        open: (id: string) => {
            setCampaignId(id);
            setOpen(true);
        },
    }));

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            const token = userStr ? JSON.parse(userStr).token : "";

            await createExpenseApi(token, {
                donationCampaignId: campaignId,
                amount: Number(amount),
                description,
                images,
            });
            setOpen(false);
            setSnackbarOpen(true);
            afterSubmit?.();
        } catch (err) {
            console.error("Lỗi tạo expense", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Tạo chi phí mới</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                        label="Số tiền"
                        type="number"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <TextField
                        label="Mô tả"
                        fullWidth
                        multiline
                        minRows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button component="label" variant="outlined">
                        Tải ảnh bằng chứng
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setImages(files);
                            }}
                        />
                    </Button>
                    {images.length > 0 && (
                        <Typography variant="body2" color="textSecondary">
                            Đã chọn {images.length} ảnh.
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={handleSubmit} disabled={loading} variant="contained">
                    {loading ? "Đang lưu..." : "Tạo chi phí"}
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
                    Tạo chi phí thành công!
                </Alert>
            </Snackbar>

        </Dialog>
    );
});
