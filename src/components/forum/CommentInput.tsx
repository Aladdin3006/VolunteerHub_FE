import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  TextField,
  IconButton,
  Paper,
  BoxProps,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { IUserShort } from "@/apis/forum";

interface IProps extends BoxProps {
  avatar?: string;
  onSend: (text: string) => Promise<boolean>;
  relyTo: IUserShort | null;
}

export const CommentInput = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { avatar, onSend, relyTo, ...rest } = props;

  const [value, setValue] = useState(
    relyTo?.fullName ? `@${relyTo.fullName} ` : ""
  );
  const [sending, setSending] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = async () => {
    if (!value.trim()) return;
    setSending(true);
    const result = await onSend(value.trim());
    if (result) {
      setValue("");
    }
    setSending(false);
  };

  useEffect(() => {
    if (inputRef.current) {
      const len = value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, []);

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
            inputRef={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Viết bình luận..."
            multiline
            maxRows={4}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { flex: 1, fontSize: 14 },
            }}
            fullWidth
            disabled={sending}
            autoFocus
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
