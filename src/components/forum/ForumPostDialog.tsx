import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Dialog, DialogContent, IconButton, DialogProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { IComment, IForumPost } from "../../apis/forum";
import { ForumPost } from "./ForumPost";
import { IImageViewerDialogRef, ImageViewerDialog } from "./ImageViewerDialog";

type IProps = Omit<DialogProps, "open"> & {
  onRely?: (post: IForumPost, comment: IComment | null, text: string) => void;
  onHideClick?: (post: IForumPost) => void;
  onLikeClick?: (post: IForumPost) => void;
  onUnLikeClick?: (post: IForumPost) => void;
  onCommentClick?: (post: IForumPost) => void;
  onSaveClick?: (post: IForumPost) => void;
  onReportClick?: (post: IForumPost) => void;
};

export interface IForumPostDialogRef {
  open: (post: IForumPost) => void;
}

export const ForumPostDialog = forwardRef<IForumPostDialogRef, IProps>(
  (props, ref) => {
    const {
      onRely,
      onHideClick,
      onLikeClick,
      onUnLikeClick,
      onCommentClick,
      onSaveClick,
      onReportClick,
      ...rest
    } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [post, setPost] = useState<IForumPost | null>(null);
    const imageViewerDialogRef = useRef<IImageViewerDialogRef | null>(null);

    const close = () => {
      setOpen(false);
    };
    useImperativeHandle(ref, () => ({
      open: (post: IForumPost) => {
        setPost(post);
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
            height: "100%",
            "&.MuiDialogContent-root": {
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
            },
          }}
        >
          {post != null && (
            <ForumPost
              post={post}
              sx={{ boxShadow: 0 }}
              onImageClick={(images, idx) => {
                imageViewerDialogRef.current &&
                  imageViewerDialogRef.current.open(images, idx);
              }}
              onReply={(comment, text) => onRely && onRely(post, comment, text)}
              onReportClick={() => onReportClick && onReportClick(post)}
              onLikeClick={() => onLikeClick && onLikeClick(post)}
              onUnLikeClick={() => onUnLikeClick && onUnLikeClick(post)}
              onSaveClick={() => onSaveClick && onSaveClick(post)}
              maxComments={100}
            />
          )}
        </DialogContent>

        <ImageViewerDialog ref={imageViewerDialogRef} />
      </Dialog>
    );
  }
);
