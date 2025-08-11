import { useState, forwardRef, useImperativeHandle } from "react";
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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { DONATION_API, IDonationDataUpload } from "../../apis/donation";
import { DonationForm } from "../donation/DonationForm";

// Định nghĩa interface cho response từ createDonation
interface DonationCampaign {
  _id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface IProps extends Omit<DialogProps, "open"> {
  afterSubmit?: (data: IDonationDataUpload) => void;
  closeAfterSubmit?: boolean;
}

export interface INewDonationDialogRef {
  open: () => void;
}

export const NewDonationDialog = forwardRef<INewDonationDialogRef, IProps>(
  (props, ref) => {
    const { afterSubmit, closeAfterSubmit, ...rest } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("error");

    const close = () => {
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
      },
    }));

    const handleSubmitNewDonation = async (data: IDonationDataUpload) => {
      try {
        const res = await DONATION_API.createDonation(data); // res là res.data rồi do interceptor
        console.log("Response from createDonation:", res);

        // ✅ KHÔNG kiểm tra res.status vì interceptor đã trả res.data
        setSnackbarSeverity("success");
        setSnackbarMessage(res.message || "Tạo chiến dịch thành công");

        afterSubmit && afterSubmit(data);
        if (closeAfterSubmit !== false) {
          close();
        }
      } catch (error: any) {
        setSnackbarSeverity("error");
        setSnackbarMessage(error.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        console.error(error);
      }
    };


    return (
      <Dialog
        open={open}
        onClose={() => { }}
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
            <Typography variant="h6">Tạo chiến dịch quyên góp</Typography>
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
          <DonationForm
            onSubmitForm={handleSubmitNewDonation}
            type="create"
            sx={{
              height: "100%",
            }}
          />
        </DialogContent>

        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={6000}
          onClose={() => setSnackbarMessage(null)}
        >
          <Alert
            onClose={() => setSnackbarMessage(null)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Dialog>
    );
  }
);