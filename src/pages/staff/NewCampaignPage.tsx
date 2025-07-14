import { Alert, Box, Button, Snackbar, Stack } from "@mui/material";
import { useRef, useState } from "react";
import { INewCampaignDialogRef, NewCampaignDialog } from "./NewCampaignDialog";

export default function NewCampaignPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const newCampaignDialogRef = useRef<INewCampaignDialogRef | null>(null);

  return (
    <Box className="page-wrapper" sx={{ position: "relative", pt: "80px" }}>
      <Stack direction={"row"} gap={0.5} pt={0} justifyContent={"center"}>
        <Stack
          direction={"column"}
          gap={3}
          sx={{
            width: ["100%", "550px"],
            ml: 40,
          }}
        >
          <Button
            onClick={() => {
              newCampaignDialogRef.current?.open();
            }}
          >
            Click to open new campaign dialog
          </Button>
          <NewCampaignDialog ref={newCampaignDialogRef} />
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
