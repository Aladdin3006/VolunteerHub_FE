import React from "react";
import { Stack, Typography, Button, StackProps } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorMessageProps extends StackProps {
  message?: string;
  buttonText?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = (props) => {
  const {
    message = "Đã xảy ra lỗi. Vui lòng thử lại.",
    buttonText = "Thử lại",
    onRetry,
    ...rest
  } = props;
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      {...rest}
      sx={{ height: "100%", textAlign: "center", ...rest.sx }}
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
