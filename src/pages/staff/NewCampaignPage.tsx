import { Alert, Box, Snackbar, Stack } from "@mui/material";
import { CAMPAIGN_API, ICampaignDataUpload } from "../../apis/campaign-new";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CampaignForm } from "../../components/campaign/CampaignForm";

export default function NewCampaignPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleSubmitNewCampaign = async (data: ICampaignDataUpload) => {
    try {
      const res = await CAMPAIGN_API.createCampaign(data);
      if (typeof res === "object" && (res as any).error != null) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      } else {
        navigate("/staff/dashboard");
      }
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      console.log(error);
    }
  };

  return (
    <Box className="page-wrapper" sx={{ position: "relative", pt: "80px" }}>
      <Stack direction={"row"} gap={0.5} pt={0} justifyContent={"center"}>
        <Stack
          direction={"column"}
          gap={3}
          sx={{
            width: ["100%", "550px"],
          }}
        >
          <CampaignForm onSubmitForm={handleSubmitNewCampaign} type="create" />
        </Stack>
      </Stack>

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
    </Box>
  );
}
