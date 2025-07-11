import { Alert, Box, Snackbar, Stack } from "@mui/material";
import { CAMPAIGN_API, ICampaignDataUpload } from "../../apis/campaign-new";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CampaignForm,
  ICampaignFormData,
} from "../../components/campaign/CampaignForm";

export default function UpdateCampaignPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<ICampaignFormData | null>(null);
  const { id } = useParams();

  const navigate = useNavigate();

  //   Fetch the data
  useEffect(() => {
    if (!id) {
      setSnackbarMessage("Chiến dịch này không tồn tại");
      return;
    }
    const fetchData = async () => {
      try {
        const res = await CAMPAIGN_API.getById(id);
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
      } catch (error) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        return;
      }
    };

    fetchData();
  }, []);

  const handleSubmitUpdateCampaign = async (data: ICampaignDataUpload) => {
    try {
      const res = await CAMPAIGN_API.updateCampaign(id!, data);
      if (res.error != null) {
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
          {campaign && (
            <CampaignForm
              onSubmitForm={handleSubmitUpdateCampaign}
              defaultData={campaign}
              type="update"
            />
          )}
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
