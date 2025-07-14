import React from "react";
import { Stack, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorMessageProps {
  message?: string;
  buttonText?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = "Đã xảy ra lỗi. Vui lòng thử lại.",
  buttonText = "Thử lại",
  onRetry,
}) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ height: "100%", textAlign: "center" }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />

      <Typography variant="h6" color="error">
        {message}
      </Typography>

      {onRetry && (
        <Button variant="contained" color="error" onClick={onRetry}>
          {buttonText}
        </Button>
      )}
    </Stack>
  );
};

export default ErrorMessage;
