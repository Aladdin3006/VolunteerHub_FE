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
  FORUM_API,
  ICommentListItem,
  IForumPostListItem,
  IUserShort,
} from "../../apis/forum";
import { ForumPost } from "./ForumPost";
import { IImageViewerDialogRef, ImageViewerDialog } from "./ImageViewerDialog";
import useLoaderState from "../../pages/forum/useLoaderState";
import ErrorMessage from "../utils/ErrorMessage";
import { getLocalUser } from "../../apis/utils";

const MAX_ITEM_FETCH_COUNT = Number.MAX_SAFE_INTEGER;

type IProps = Omit<DialogProps, "open"> & {
  onRely?: (
    post: IForumPostListItem,
    comment: ICommentListItem | null,
    text: string
  ) => void;
  onHideClick?: (post: IForumPostListItem) => void;
  onLikeClick?: (post: IForumPostListItem) => void;
  onUnLikeClick?: (post: IForumPostListItem) => void;
  onCommentClick?: (post: IForumPostListItem) => void;
  onSaveClick?: (post: IForumPostListItem) => void;
  onReportClick?: (post: IForumPostListItem) => void;
  afterClose?: (post: IForumPostListItem | null) => void;
};

export interface IForumPostDialogRef {
  open: (postId: string) => void;
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
      afterClose,
      ...rest
    } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [post, setPost] = useState<IForumPostListItem | null>(null);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
    const postIdRef = useRef<string>("");
    const userRef = useRef<IUserShort>(
      getLocalUser() || {
        _id: "",
        fullName: "Ẩn danh",
      }
    );
    const { state: postState, setState: setPostState } = useLoaderState();
    const imageViewerDialogRef = useRef<IImageViewerDialogRef | null>(null);

    const updatePost = (override?: Partial<IForumPostListItem>) => {
      setPost((post) => (post != null ? { ...post, ...override } : null));
    };

    const close = () => {
      afterClose && afterClose(post);
      setOpen(false);
    };

    const fetchPostDetailData = async (postId: string) => {
      setPostState("fetching");
      try {
        const res = await FORUM_API.getForumPostDetail(postId);
        const postData = res.data;
        if (postData != null) {
          setPost(() => postData);
          setPostState("success");
          return true;
        } else {
          setPostState("error");
          setSnackbarMessage(
            "Không thể tải bài biết này, vui lòng thử lại sau"
          );
          return false;
        }
      } catch (error) {
        setPostState("error");
        setSnackbarMessage("Không thể tải bài biết này, vui lòng thử lại sau");
        return false;
      }
    };

    const fetchPostComments = async (
      postId: string,
      skip: number,
      limit: number
    ) => {
      try {
        setPost((post) =>
          post == null
            ? null
            : { ...post, isLoadingComments: true, isErrorComments: false }
        );
        const res = await FORUM_API.getForumPostComments(postId, skip, limit);
        const comments = res.data;
        if (comments == null) throw new Error(String(res.error));
        updatePost({
          comments: comments,
          isLoadingComments: false,
          isLoadedAllComments:
            comments.length < MAX_ITEM_FETCH_COUNT ? true : false,
        });
        return true;
      } catch (error) {
        updatePost({
          isLoadingComments: false,
          isErrorComments: true,
        });

        setSnackbarMessage("Không thể tải bài biết này, vui lòng thử lại sau");
        return false;
      }
    };

    const fetchPostCommentComments = async (
      postId: string,
      comment: ICommentListItem
    ) => {
      try {
        comment.isLoadingComments = true;
        comment.isErrorComments = false;
        comment.updateCount = (comment.updateCount ?? 0) + 1;
        updatePost();

        const res = await FORUM_API.getForumPostCommentRelies(
          postId,
          comment._id,
          0,
          MAX_ITEM_FETCH_COUNT
        );
        const comments = res.data;
        if (comments == null) throw new Error(String(res.error));

        comment.isLoadingComments = false;
        comment.isErrorComments = false;
        comment.comments = [...(comment.comments ?? []), ...comments];
        comment.isLoadedAllComments =
          comments.length < MAX_ITEM_FETCH_COUNT ? true : false;
        comment.updateCount = (comment.updateCount ?? 0) + 1;
        updatePost();
        return true;
      } catch (error) {
        comment.isLoadingComments = false;
        comment.isErrorComments = true;
        comment.updateCount = (comment.updateCount ?? 0) + 1;
        updatePost();
        setSnackbarMessage("Không thể tải bài biết này, vui lòng thử lại sau");
        return false;
      }
    };

    const fetchInitialData = async (postId: string) => {
      const rDetail = await fetchPostDetailData(postId);
      if (rDetail) {
        await fetchPostComments(postId, 0, MAX_ITEM_FETCH_COUNT);
      }
    };

    const likePost = async () => {
      if (post == null) return;

      try {
        const promise = post.isUpvoted
          ? FORUM_API.unvoteForumPost(postIdRef.current)
          : FORUM_API.upvoteForumPost(postIdRef.current);
        const res = await promise;
        if (res.data != null) {
          setPost({
            ...post,
            isUpvoted: !post.isUpvoted,
            upvotesCount: post.isUpvoted
              ? post.upvotesCount - 1
              : post.upvotesCount + 1,
            isDownvoted: false,
            downvotesCount: post.isDownvoted
              ? post.downvotesCount - 1
              : post.downvotesCount,
          });
        } else {
          setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      } catch (error) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    };

    const unlikePost = async () => {
      if (post == null) return;

      try {
        const promise = post.isDownvoted
          ? FORUM_API.unvoteForumPost(postIdRef.current)
          : FORUM_API.downvoteForumPost(postIdRef.current);
        const res = await promise;
        if (res.data != null) {
          setPost({
            ...post,
            isUpvoted: false,
            upvotesCount: post.isUpvoted
              ? post.upvotesCount - 1
              : post.upvotesCount,
            isDownvoted: !post.isDownvoted,
            downvotesCount: post.isDownvoted
              ? post.downvotesCount - 1
              : post.downvotesCount + 1,
          });
        } else {
          setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      } catch (error) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    };

    const handleReply = async (
      post: IForumPostListItem,
      comment: ICommentListItem | null,
      text: string
    ): Promise<boolean> => {
      try {
        if (comment == null) {
          // Comment on post
          const { data, error } = await FORUM_API.commentForumPost(
            post._id,
            text
          );
          if (data == null) throw new Error(String(error));
          updatePost({
            comments: [
              ...(post.comments ?? []),
              {
                ...data,
                createdBy: userRef.current,
                commentsCount: 0,
                isDownvoted: false,
                isUpvoted: false,
                comments: [],
              },
            ],
          });
          return true;
        } else {
          // Reply on comment
          const { data, error } = await FORUM_API.replyForumPostComment(
            post._id,
            comment._id,
            text
          );
          if (data == null) throw new Error(String(error));
          comment.comments = [
            ...(comment.comments ?? []),
            {
              ...data,
              createdBy: userRef.current,
              commentsCount: 0,
              isDownvoted: false,
              isUpvoted: false,
              comments: [],
            },
          ];
          updatePost();
          return true;
        }
      } catch (error) {
        setSnackbarMessage("Không thể tải bài biết này, vui lòng thử lại sau");
        return false;
      }
    };

    const likeComment = async (comment: ICommentListItem) => {
      if (post == null) return;

      try {
        const promise = comment.isUpvoted
          ? FORUM_API.unvoteForumPostComment(postIdRef.current, comment._id)
          : FORUM_API.upvoteForumPostComment(postIdRef.current, comment._id);
        const res = await promise;
        if (res.data != null) {
          comment.isUpvoted = !comment.isUpvoted;
          comment.isDownvoted = false;
          comment.updateCount = (comment.updateCount ?? 0) + 1;
          updatePost();
        } else {
          setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      } catch (error) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    };

    const unlikeComment = async (comment: ICommentListItem) => {
      if (post == null) return;

      try {
        const promise = comment.isDownvoted
          ? FORUM_API.unvoteForumPostComment(postIdRef.current, comment._id)
          : FORUM_API.downvoteForumPostComment(postIdRef.current, comment._id);
        const res = await promise;
        if (res.data != null) {
          comment.isDownvoted = !comment.isDownvoted;
          comment.isUpvoted = false;
          comment.updateCount = (comment.updateCount ?? 0) + 1;
          updatePost();
        } else {
          setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      } catch (error) {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    };

    const copyLinkToNew = async (postId: string) => {
      await navigator.clipboard.writeText(
        `${window.location.host}/news/${postId}`
      );
    };

    useImperativeHandle(ref, () => ({
      open: (postId: string) => {
        postIdRef.current = postId;
        setOpen(true);
        fetchInitialData(postId);
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
              onReply={(comment, text) => handleReply(post, comment, text)}
              onShowReplies={(comment) =>
                fetchPostCommentComments(post._id, comment)
              }
              onLikeClick={likePost}
              onUnLikeClick={unlikePost}
              onLikeCommentClick={likeComment}
              onUnLikeCommentClick={unlikeComment}
              onShareClick={() => copyLinkToNew(post._id)}
              maxComments={100}
            />
          )}
          {postState === "fetching" && (
            <Skeleton
              variant="rectangular"
              sx={{
                width: "100%",
                height: "100%",
              }}
            />
          )}
          {postState === "error" && (
            <ErrorMessage onRetry={() => fetchInitialData(postIdRef.current)} />
          )}
        </DialogContent>

        <ImageViewerDialog ref={imageViewerDialogRef} />
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
