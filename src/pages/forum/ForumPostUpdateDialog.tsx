import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  DialogProps,
  Alert,
  Snackbar,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  ForumPostNew,
  IFormPostFormData,
  IForumPostNewRef,
} from "../../components/forum/ForumPostNew";
import { FORUM_API, IUserShort } from "../../apis/forum";
import { getLocalUser, toBase64 } from "../../apis/utils";
import useLoaderState from "./useLoaderState";
import ErrorMessage from "@/components/utils/ErrorMessage";

type IProps = Omit<DialogProps, "open"> & {
  afterSubmit?: (id: string, data: IFormPostFormData) => void;
};

export interface IForumPostUpdateDialogRef {
  open: (postId: string) => void;
}

export const ForumPostUpdateDialog = forwardRef<
  IForumPostUpdateDialogRef,
  IProps
>((props, ref) => {
  const { afterSubmit, ...rest } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const forumPostNewRef = useRef<IForumPostNewRef | null>(null);
  const idRef = useRef<string | null>(null);
  const [data, setData] = useState<IFormPostFormData | null>(null);
  const { setState, state } = useLoaderState();
  const [user, _setUser] = useState<IUserShort>(() => {
    return (
      getLocalUser() || {
        _id: "0",
        fullName: "Unknown",
        avatar: "",
      }
    );
  });

  const fetchData = async (postId: string) => {
    try {
      setState("fetching");
      const res = await FORUM_API.getForumPostDetail(postId);
      if (res.data == null || res.error != null) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        return;
      }
      const data = res.data;
      setData({
        title: data.title,
        content: data.content,
        images: data.images.map((url) => ({ url, type: "image" })),
        tags: data.tags,
      });
      setState("success");
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      setState("error");
      return;
    }
  };

  const close = () => {
    setOpen(false);
    forumPostNewRef.current && forumPostNewRef.current.clear();
  };

  useImperativeHandle(ref, () => ({
    open: (postId: string) => {
      idRef.current = postId;
      setOpen(true);
      fetchData(postId);
    },
  }));

  const handleSubmitData = async (data: IFormPostFormData) => {
    try {
      const images = await Promise.all(
        data.images.map(({ file, url }) =>
          file != null ? toBase64(file) : url
        )
      );
      const res = await FORUM_API.updatePost(idRef.current!, {
        title: data.title,
        content: data.content,
        images: images,
        tags: data.tags.map((tag) => tag._id),
      });
      if (res.error == null) {
        afterSubmit && afterSubmit(idRef.current!, data);
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
        {state === "error" && (
          <ErrorMessage onRetry={() => fetchData(idRef.current!)} />
        )}
        {state === "fetching" && (
          <Skeleton
            variant="rectangular"
            sx={{ width: "100%", height: "100%" }}
          />
        )}
        {state === "success" && data != null && (
          <ForumPostNew
            ref={forumPostNewRef}
            avatarUrl={user.avatar}
            userName={user.fullName}
            onSubmit={handleSubmitData}
            sx={{
              border: "none",
              flex: 1,
            }}
            defaultData={data}
            type={"update"}
          />
        )}
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
});
