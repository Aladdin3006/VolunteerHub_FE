import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Dialog, DialogContent, IconButton, DialogProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ForumPostNew, IForumPostNewRef } from "./ForumPostNew";

type IProps = Omit<DialogProps, "open"> & {
  avatarUrl: string;
  userName: string;
  onSubmit?: (data: { text: string; images: File[]; tags: string[] }) => void;
};

export interface IForumPostNewDialogRef {
  open: () => void;
}

export const ForumPostNewDialog = forwardRef<IForumPostNewDialogRef, IProps>(
  (props, ref) => {
    const { avatarUrl, userName, onSubmit, ...rest } = props;
    const [open, setOpen] = useState<boolean>(false);
    const forumPostNewRef = useRef<IForumPostNewRef | null>(null);

    const close = () => {
      setOpen(false);
      forumPostNewRef.current && forumPostNewRef.current.clear();
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
      },
    }));

    return (
      <Dialog
        {...rest}
        open={open}
        onClose={close}
        fullWidth
        maxWidth="sm"
        scroll="body"
        PaperProps={{
          sx: {
            height: "90vh",
            p: 0,
          },
        }}
        sx={{
          overflowY: "hidden",
          ".MuiPaper-root": {
            overflowY: "hidden",
          },
          ...rest.sx,
        }}
      >
        <IconButton
          onClick={close}
          size="small"
          sx={{
            position: "absolute",
            top: "5px",
            right: "15px",
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          dividers
          sx={{
            overflow: "auto",
            display: "flex",
            height: "100%",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          <ForumPostNew
            ref={forumPostNewRef}
            avatarUrl={avatarUrl}
            userName={userName}
            onSubmit={onSubmit}
            sx={{
              border: "none",
              flex: 1,
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }
);
