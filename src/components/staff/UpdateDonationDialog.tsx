import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogProps,
  Alert,
  Snackbar,
  Box,
  IconButton,
  Typography,
  Skeleton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import useLoaderState from "../../pages/forum/useLoaderState";
import ErrorMessage from "../utils/ErrorMessage";
import { DONATION_API, IDonationDataUpload } from "../../apis/donation";
import { DonationForm, IDonationFormData } from "../donation/DonationForm";

interface IProps extends Omit<DialogProps, "open"> {
  afterSubmit?: (data: IDonationDataUpload) => void;
  closeAfterSubmit?: boolean;
}
export interface IUpdateDonationDialogRef {
  open: (campaignId: string) => void;
}

export const UpdateDonationDialog = forwardRef<
  IUpdateDonationDialogRef,
  IProps
>((props, ref) => {
  const { afterSubmit, closeAfterSubmit, ...rest } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const donationIdRef = useRef<string | null>(null);
  const [donation, setDonation] = useState<IDonationFormData | null>(null);
  const { state, setState } = useLoaderState();

  const fetchData = async (donationId: string) => {
    try {
      setState("fetching");
      const res = await DONATION_API.getById(donationId);
      if (res.data == null || res.error != null) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        return;
      }
      const data = res.data?.campaign;

      setDonation({
        description: data.description,
        goalAmount: data.goalAmount,
        images: Array.isArray(data.images)
          ? data.images.map((img) => ({
              url: img,
              type: "image",
            }))
          : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        thumbnail: {
          url: data.thumbnail ?? "", // nếu bị null
          type: "image",
        },
        title: data.title,
      });

      setState("success");
    } catch (error: any) {
      console.error("❌ Lỗi trong fetchData:", error);
      if (error.response) {
        console.error("📛 Lỗi từ backend:", error.response.data);
      } else if (error.request) {
        console.error("📛 Không nhận được phản hồi từ backend:", error.request);
      } else {
        console.error("📛 Lỗi khác:", error.message);
      }
      setSnackbarMessage("Có lỗi xảy ra khi tải dữ liệu");
      setState("error");
    }
  };

  const close = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    open: async (campaignId: string) => {
      donationIdRef.current = campaignId;
      setOpen(true);
      //   Fetch the data
      fetchData(campaignId);
    },
  }));

  const handleSubmitUpdateDonation = async (data: IDonationDataUpload) => {
    try {
      const res = await DONATION_API.updateDonation(
        donationIdRef.current!,
        data
      );
      if (!res || !res.data) {
        console.error("❌ Không có dữ liệu từ API:", res);
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        return;
      } else {
        afterSubmit && afterSubmit(data);
        if (closeAfterSubmit !== false) {
          close();
        }
      }
    } catch (error: any) {
      console.error("LỖI THỰC TẾ:", error);
      const axiosError = error.origin || error;

      if (axiosError.response) {
        console.error("❌ Backend trả về lỗi:", axiosError.response.data);
        setSnackbarMessage(
          axiosError.response.data.message || "Có lỗi xảy ra (backend)"
        );
      } else if (axiosError.request) {
        console.error(
          "❌ Không nhận được phản hồi từ backend:",
          axiosError.request
        );
        setSnackbarMessage("Không nhận được phản hồi từ server");
      } else {
        console.error("❌ Lỗi khác:", axiosError.message);
        setSnackbarMessage("Lỗi không xác định: " + axiosError.message);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      fullWidth
      maxWidth="sm"
      keepMounted={false}
      {...rest}
    >
      <DialogTitle>
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6">Cập nhật chiến dịch quyên góp</Typography>

          <IconButton
            onClick={close}
            sx={{ position: "absolute", right: 0 }}
            aria-label="close"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          height: "80vh",
          overflowY: "hidden",
          ".form": {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            ".form-title": {
              display: "none",
            },
            ".form-body": {
              flex: 1,
              p: 1,
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
            },
          },
        }}
      >
        {state === "error" && (
          <ErrorMessage onRetry={() => fetchData(donationIdRef.current!)} />
        )}
        {state === "fetching" && (
          <Skeleton
            variant="rectangular"
            sx={{ width: "100%", height: "100%" }}
          />
        )}
        {state === "success" && donation != null && (
          <DonationForm
            onSubmitForm={handleSubmitUpdateDonation}
            type="update"
            sx={{
              height: "100%",
            }}
            defaultData={donation}
          />
        )}
      </DialogContent>

      {/* Error message */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
});
