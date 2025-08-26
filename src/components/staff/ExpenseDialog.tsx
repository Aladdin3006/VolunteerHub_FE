import React, { useImperativeHandle, useState, useEffect,forwardRef  } from "react";
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
import  getCampaignDetail  from "@/apis/campaign"; // Giả định bạn đã import API này
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
    const [currentAmount, setCurrentAmount] = useState<number | null>(null); // Lưu currentAmount
    const [amountError, setAmountError] = useState(""); // Lưu thông báo lỗi

    // Lấy thông tin chiến dịch khi mở dialog
    useEffect(() => {
        if (open && campaignId) {
            const fetchCampaign = async () => {
                try {
                    const data = await getCampaignDetail(campaignId);
                    setCurrentAmount(data.campaign.currentAmount);
                } catch (err) {
                    console.error("Lỗi khi lấy thông tin chiến dịch", err);
                }
            };
            fetchCampaign();
        }
    }, [open, campaignId]);

    useImperativeHandle(ref, () => ({
        open: (id: string) => {
            setCampaignId(id);
            setOpen(true);
            setAmount(""); // Reset amount khi mở dialog
            setDescription(""); // Reset description
            setImages([]); // Reset images
            setAmountError(""); // Reset lỗi
        },
    }));

    // Kiểm tra số tiền nhập vào
    const handleAmountChange = (value: string) => {
        setAmount(value);
        const numValue = Number(value);
        if (value === "") {
            setAmountError("Vui lòng nhập số tiền");
        } else if (isNaN(numValue) || numValue <= 0) {
            setAmountError("Số tiền phải là một số dương");
        } else if (currentAmount !== null && numValue > currentAmount) {
            setAmountError(`Số tiền không được vượt quá ${currentAmount.toLocaleString()} đ`);
        } else {
            setAmountError("");
        }
    };

    const handleSubmit = async () => {
        if (amountError || !amount) return; // Không submit nếu có lỗi hoặc amount rỗng
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
                        onChange={(e) => handleAmountChange(e.target.value)}
                        error={!!amountError}
                        helperText={amountError}
                        inputProps={{ min: 0 }}
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
                    {currentAmount !== null && (
                        <Typography variant="body2" color="textSecondary">
                            Số tiền còn lại: {currentAmount.toLocaleString()} đ
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Hủy</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !!amountError || !amount}
                    variant="contained"
                >
                    {loading ? "Đang lưu..." : "Tạo chi phí"}
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Tạo chi phí thành công!
                </Alert>
            </Snackbar>
        </Dialog>
    );
});