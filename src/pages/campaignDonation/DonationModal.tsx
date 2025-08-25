import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Link,
  IconButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab"; // 🆕
import authService from "../../services/Authentication.service";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  presetAmount?: number;
}

const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  presetAmount,
}) => {
  const user = authService.getUser();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    anonymous: false,
    amount: "",
    message: "",
  });

  const [loadingProvider, setLoadingProvider] = useState<
    "zalopay" | "payos" | null
  >(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: user?.fullName || "",
        phoneNumber: user?.phone || "",
        email: user?.email || "",
        anonymous: false,
        amount: presetAmount ? presetAmount.toString() : "",
        message: "",
      });
    }
  }, [isOpen, presetAmount]);

  const handlePayment = async (
    provider: "zalopay" | "payos",
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoadingProvider(provider); // 🔥 bật loading
    try {
      const token = authService.getToken();
      const payload = {
        donationCampaignId: campaignId,
        guestName: formData.fullName,
        amount: Number(formData.amount),
        message: formData.message,
        anonymous: formData.anonymous,
        userId: user?._id || null,
      };

      const API_BASE = import.meta.env.VITE_API_BASE_URL;

      let endpoint = "";
      if (provider === "zalopay") {
        endpoint = `${API_BASE}/payments/zalopay_payment_url`;
      } else if (provider === "payos") {
        endpoint = `${API_BASE}/payments/create`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (provider === "zalopay" && result?.data?.order_url) {
        window.location.href = result.data.order_url;
      } else if (provider === "payos" && result?.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else {
        alert(`Không thể khởi tạo thanh toán ${provider}.`);
      }
    } catch (err) {
      console.error(`Lỗi gửi yêu cầu ${provider}:`, err);
      alert(`Có lỗi xảy ra khi gửi yêu cầu ${provider}.`);
    } finally {
      setLoadingProvider(null); // ✅ tắt loading khi xong
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <form>
        {/* Header */}
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: 20,
            textAlign: "center",
            position: "relative",
            pt: 3,
            pb: 1.5,
          }}
        >
          Thông tin ủng hộ
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 12, right: 16 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Body */}
        <DialogContent sx={{ px: 4 }}>
          <Typography variant="body2" align="center" mb={2}>
            Vui lòng điền thông tin của bạn để hoàn tất việc ủng hộ.
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Họ tên người ủng hộ *"
              fullWidth
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />

            <TextField
              label="Số điện thoại"
              fullWidth
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />

            <TextField
              label="Email *"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.anonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, anonymous: e.target.checked })
                  }
                />
              }
              label="Tôi muốn ủng hộ ẩn danh"
            />

            <TextField
              label="Số tiền ủng hộ *"
              type="number"
              fullWidth
              required
              placeholder="Nhập số tiền"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />

            <TextField
              label="Lời nhắn (tuỳ chọn)"
              fullWidth
              multiline
              minRows={2}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </Stack>
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: 1.5,
            px: 4,
            pb: 3,
            pt: 2,
          }}
        >
          <Stack spacing={1.5}>
            <LoadingButton
              loading={loadingProvider === "zalopay"}
              onClick={(e) => handlePayment("zalopay", e)}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#f43f5e",
                fontWeight: 600,
                fontSize: 16,
                minHeight: 48,
                textTransform: "uppercase",
                borderRadius: 2,
                "&:hover": { backgroundColor: "#e11d48" },
                "& .MuiLoadingButton-loadingIndicator": { color: "white" },
              }}
            >
              Ủng hộ qua ZaloPay
            </LoadingButton>

            <LoadingButton
              loading={loadingProvider === "payos"}
              onClick={(e) => handlePayment("payos", e)}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#0ea5e9",
                fontWeight: 600,
                fontSize: 16,
                minHeight: 48,
                textTransform: "uppercase",
                borderRadius: 2,
                "&:hover": { backgroundColor: "#0284c7" },
                "& .MuiLoadingButton-loadingIndicator": { color: "white" },
              }}
            >
              Ủng hộ qua PayOS (VietQr)
            </LoadingButton>
          </Stack>

          <Typography variant="caption" textAlign="center" mt={1}>
            Bằng việc nhấp "Ủng hộ", bạn đồng ý với{" "}
            <Link href="#" underline="hover">
              điều khoản và điều kiện
            </Link>{" "}
            của chúng tôi.
          </Typography>
        </DialogActions>
      </form>

    </Dialog>
  );
};

export default DonationModal;
