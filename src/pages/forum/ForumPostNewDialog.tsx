import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  DialogProps,
  Alert,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  ForumPostNew,
  IFormPostFormData,
  IForumPostNewRef,
} from "../../components/forum/ForumPostNew";
import { FORUM_API, IForumPostListItem, IUserShort } from "../../apis/forum";
import { getLocalUser, toBase64 } from "../../apis/utils";

type IProps = Omit<DialogProps, "open"> & {
  afterSubmit?: (data: IForumPostListItem) => void;
};

export interface IForumPostNewDialogRef {
  open: () => void;
}

export const ForumPostNewDialog = forwardRef<IForumPostNewDialogRef, IProps>(
  (props, ref) => {
    const { afterSubmit, ...rest } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
    const forumPostNewRef = useRef<IForumPostNewRef | null>(null);
    const [user, _setUser] = useState<IUserShort>(() => {
      return (
        getLocalUser() || {
          _id: "0",
          fullName: "Unknown",
          avatar: "",
        }
      );
    });

    const close = () => {
      setOpen(false);
      forumPostNewRef.current && forumPostNewRef.current.clear();
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
      },
    }));

    const handleSubmitData = async (data: IFormPostFormData) => {
      try {
        const images = await Promise.all(
          data.images.map(({ file, url }) =>
            file != null ? toBase64(file) : url
          )
        );
        const res = await FORUM_API.createNewPost({
          title: data.title,
          content: data.content,
          images: images,
          tags: data.tags.map((tag) => tag._id),
        });
        if (res.data != null) {
          afterSubmit &&
            afterSubmit(res.data);
          close();
        } else {
          setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      } catch (error) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    };

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
            avatarUrl={user.avatar}
            userName={user.fullName}
            onSubmit={handleSubmitData}
            sx={{
              border: "none",
              flex: 1,
            }}
          />
        </DialogContent>
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
      </Dialog>
    );
  }
);
