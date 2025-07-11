import { Alert, Box, Snackbar, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  DonationForm,
  IDonationFormData,
} from "../../components/donation/DonationForm";
import { DONATION_API, IDonationDataUpload } from "../../apis/donation";
import { useEffect, useState } from "react";

export default function UpdateDonationPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [donation, setDonation] = useState<IDonationFormData | null>(null);
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
        const res = await DONATION_API.getById(id);
        if (res.data == null || res.error != null) {
          setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
          return;
        }
        const data = res.data;
        setDonation({
          description: data.description,
          goalAmount: data.goalAmount,
          images: data.images.map((img) => ({
            url: img,
            type: "image",
          })),
          tags: data.tags,
          thumbnail: {
            url: data.thumbnail,
            type: "image",
          },
          title: data.title,
        });
      } catch (error) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        return;
      }
    };

    fetchData();
  }, []);

  const handleSubmitUpdateDonation = async (data: IDonationDataUpload) => {
    try {
      const res = await DONATION_API.updateDonation(id!, data);
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
          {donation != null && (
            <DonationForm
              onSubmitForm={handleSubmitUpdateDonation}
              defaultData={donation}
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
