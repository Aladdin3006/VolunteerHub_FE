import { Alert, Box, Button, Snackbar, Stack } from "@mui/material";
import { useRef, useState } from "react";
import { INewDonationDialogRef, NewDonationDialog } from "./NewDonationDialog";

export default function NewDonationPage() {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const newDonationDialogRef = useRef<INewDonationDialogRef | null>(null);

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
              newDonationDialogRef.current?.open();
            }}
          >
            Click to open new donation dialog
          </Button>
          <NewDonationDialog ref={newDonationDialogRef} />
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
