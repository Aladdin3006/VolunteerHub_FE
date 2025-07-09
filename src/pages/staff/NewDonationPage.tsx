import { Alert, Box, Snackbar, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DonationForm } from "../../components/donation/DonationForm";
import { DONATION_API, IDonationDataUpload } from "../../apis/donation";
import { useState } from "react";

export default function NewDonationPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmitNewDonation = async (data: IDonationDataUpload) => {
    console.log("data", data);
    try {
      const res = await DONATION_API.createDonation(data);
      navigate("/donate");
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
          <DonationForm onSubmitForm={handleSubmitNewDonation} />
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
