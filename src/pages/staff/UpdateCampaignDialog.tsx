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
import { CAMPAIGN_API, ICampaignDataUpload } from "../../apis/campaign-new";
import {
  CampaignForm,
  ICampaignFormData,
} from "../../components/campaign/CampaignForm";
import { Close } from "@mui/icons-material";
import useLoaderState from "../forum/useLoaderState";
import ErrorMessage from "../../components/utils/ErrorMessage";

interface IProps extends Omit<DialogProps, "open"> {
  afterSubmit?: (data: ICampaignDataUpload) => void;
  closeAfterSubmit?: boolean;
}
export interface IUpdateCampaignDialogRef {
  open: (campaignId: string) => void;
}

export const UpdateCampaignDialog = forwardRef<
  IUpdateCampaignDialogRef,
  IProps
>((props, ref) => {
  const { afterSubmit, closeAfterSubmit, ...rest } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const campaignIdRef = useRef<string | null>(null);
  const [campaign, setCampaign] = useState<ICampaignFormData | null>(null);
  const { state, setState } = useLoaderState();

  const fetchData = async (campaignId: string) => {
    try {
      setState("fetching");
      const res = await CAMPAIGN_API.getById(campaignId);
      if (res?.data == null || res.error != null) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        return;
      }
      const data = res.data;
      setCampaign({
        description: data.description,
        gallery: data.gallery.map((img) => ({
          url: img,
          type: "image",
        })),
        categories: data.categories,
        campaignImg: {
          url: data.campaignImg,
          type: "image",
        },
        name: data.name,
        endDate: new Date(data.endDate),
        location: data.location,
        startDate: new Date(data.startDate),
        phases: data.phases,
      });
      setState("success");
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      setState("error");
      return;
    }
  };

  const close = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    open: async (campaignId: string) => {
      campaignIdRef.current = campaignId;
      setOpen(true);
      //   Fetch the data
      fetchData(campaignId);
    },
  }));

  const handleSubmitUpdateCampaign = async (data: ICampaignDataUpload) => {
    try {
      const res = await CAMPAIGN_API.updateCampaign(
        campaignIdRef.current!,
        data
      );
      if (res.error != null) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      } else {
        afterSubmit && afterSubmit(data);
        if (closeAfterSubmit !== false) {
          close();
        }
      }
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      console.log(error);
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
          <Typography variant="h6">Cập nhật chiến dịch tình nguyện</Typography>

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
          <ErrorMessage onRetry={() => fetchData(campaignIdRef.current!)} />
        )}
        {state === "fetching" && (
          <Skeleton
            variant="rectangular"
            sx={{ width: "100%", height: "100%" }}
          />
        )}
        {state === "success" && campaign != null && (
          <CampaignForm
            onSubmitForm={handleSubmitUpdateCampaign}
            type="update"
            sx={{
              height: "100%",
            }}
            defaultData={campaign}
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
