import React, { forwardRef, useState } from "react";
import {
  Box,
  Avatar,
  TextField,
  IconButton,
  Paper,
  BoxProps,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface IProps extends BoxProps {
  avatar?: string;
  onSend: (text: string) => void;
}

export const CommentInput = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { avatar, onSend, ...rest } = props;

  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };
  return (
    <Box
      ref={ref}
      {...rest}
      sx={{ display: "flex", flexDirection: "column-reverse", ...rest.sx }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Avatar src={avatar} sx={{ mt: "4px" }} />

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            px: 2,
            py: 1,
            borderRadius: "20px",
            backgroundColor: "#f0f2f5",
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write your comment..."
            multiline
            maxRows={4}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { flex: 1, fontSize: 14 },
            }}
            fullWidth
          />

          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!value.trim()}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
});
