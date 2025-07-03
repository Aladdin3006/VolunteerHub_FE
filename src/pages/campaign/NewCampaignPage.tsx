import { Alert, Box, Snackbar, Stack } from "@mui/material";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { CampaignForm } from "../../components/campaign/CampaignForm";
import { CAMPAIGN_API, ICampaignDataUpload } from "../../apis/campaign";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function NewCampaignPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleSubmitNewCampaign = async (data: ICampaignDataUpload) => {
    try {
      const res = await CAMPAIGN_API.createCampaign(data);
      navigate("/campaign");
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      console.log(error);
    }
  };

  return (
    <Box className="page-wrapper" sx={{ position: "relative" }}>
      <Header />
      <Stack direction={"row"} gap={0.5} pt={0} justifyContent={"center"}>
        <Stack
          direction={"column"}
          gap={3}
          sx={{
            width: ["100%"],
          }}
        >
          <CampaignForm onSubmitForm={handleSubmitNewCampaign} />
        </Stack>
      </Stack>
      <Footer />

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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
