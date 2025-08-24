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
import { CAMPAIGN_API, ICampaignDataUpload } from "../../apis/campaign";
import { CampaignForm, ICampaignFormData } from "../campaign/CampaignForm";
import useLoaderState from "../../pages/forum/useLoaderState";
import ErrorMessage from "../utils/ErrorMessage";

interface IProps extends Omit<DialogProps, "open"> {
  afterSubmit?: (data: ICampaignDataUpload) => void;
  closeAfterSubmit?: boolean;
}

export interface IUpdateCampaignDialogRef {
  open: (campaignId: string) => void;
}

// Helpers chuyển đổi toạ độ
const toFormLocation = (apiLocation: any): ICampaignFormData["location"] => {
  // Backend: { type: 'Point', coordinates: [lng, lat], address? }
  // Form cần: { coordinates: [lat, lng], address }
  if (!apiLocation?.coordinates || apiLocation.coordinates.length !== 2) {
    return { address: apiLocation?.address ?? "", coordinates: [0, 0] };
  }
  const [lng, lat] = apiLocation.coordinates;
  return {
    address: apiLocation?.address ?? "",
    coordinates: [lng, lat],
  };
};

const toApiLocation = (formLocation: ICampaignFormData["location"]) => {
  // Form: [lat, lng] -> API: GeoJSON Point [lng, lat]
  if (!formLocation?.coordinates || formLocation.coordinates.length !== 2) {
    return {
      type: "Point",
      coordinates: [0, 0],
      address: formLocation?.address ?? "",
    };
  }
  const [lng, lat] = formLocation.coordinates;
  return {
    type: "Point",
    coordinates: [lng, lat],
    address: formLocation?.address ?? "",
  };
};

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
      if (res?.data == null || (res as any).error != null) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        setState("error");
        return;
      }
      const data = res.data;

      setCampaign({
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: toFormLocation(data.location),
        campaignImg: { url: data.image, type: "image" },
        gallery: (data.gallery ?? []).map((url: string) => ({
          url,
          type: "image",
        })),
        categories: data.categories ?? [],
      });

      setState("success");
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      setState("error");
    }
  };

  const close = () => setOpen(false);

  useImperativeHandle(ref, () => ({
    open: async (campaignId: string) => {
      campaignIdRef.current = campaignId;
      setOpen(true);
      fetchData(campaignId);
    },
  }));

  const handleSubmitUpdateCampaign = async (data: ICampaignDataUpload) => {
    try {
      // data.location hiện là { coordinates: [lat, lng], address }
      const payload: ICampaignDataUpload = {
        ...data,
        location: toApiLocation(data.location), // Ensure proper conversion without type assertion
      };

      const res = await CAMPAIGN_API.updateCampaign(
        campaignIdRef.current!,
        payload
      );
      if ((res as any).error != null) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      } else {
        afterSubmit && afterSubmit(payload);
        if (closeAfterSubmit !== false) close();
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
            ".form-title": { display: "none" },
            ".form-body": {
              flex: 1,
              p: 1,
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
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
            defaultData={campaign}
            sx={{ height: "100%" }}
          />
        )}
      </DialogContent>

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
