import { Alert, Box, Button, Snackbar, Stack } from "@mui/material";
import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import {
  IUpdateCampaignDialogRef,
  UpdateCampaignDialog,
} from "./UpdateCampaignDialog";

export default function UpdateCampaignPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const { id } = useParams();
  const updateCampaignDialogRef = useRef<IUpdateCampaignDialogRef | null>(null);

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
          <Button
            onClick={() => {
              updateCampaignDialogRef.current?.open(id!);
            }}
          >
            Click to open update campaign dialog
          </Button>
          <UpdateCampaignDialog ref={updateCampaignDialogRef} />
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
