import {
  Alert,
  Box,
  Skeleton,
  Snackbar,
  SpeedDial,
  Stack,
  Tooltip,
} from "@mui/material";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import userForumData from "./useForumData";
import { ForumPost } from "../../components/forum/ForumPost";
import { useRef, useState } from "react";
import {
  ForumPostDialog,
  IForumPostDialogRef,
} from "../../components/forum/ForumPostDialog";
import { ForumPostComposer } from "../../components/forum/ForumPostComposer";
import {
  ForumPostNewDialog,
  IForumPostNewDialogRef,
} from "./ForumPostNewDialog";
import ForumLeftSide from "./ForumLeftSide";
import { FORUM_API, IForumPostListItem, IUserShort } from "../../apis/forum";
import { EditOutlined } from "@mui/icons-material";
import { getLocalUser } from "../../apis/utils";
import ErrorMessage from "../../components/utils/ErrorMessage";

export default function ForumPage() {
  const { posts, setPosts, state, fetch, ref } = userForumData();
  const forumPostDialogRef = useRef<IForumPostDialogRef | null>(null);
  const forumPostNewDialogRef = useRef<IForumPostNewDialogRef | null>(null);
  const userRef = useRef<IUserShort | null>(getLocalUser());

  const [shortcuts, setShortcuts] = useState<IForumPostListItem[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const afterPostDialogClosed = (post: IForumPostListItem | null) => {
    if (post != null) {
      setPosts(posts.map((iPost) => (iPost._id === post._id ? post : iPost)));
    }
  };

  const likePost = async (post: IForumPostListItem) => {
    try {
      const promise = post.isUpvoted
        ? FORUM_API.unvoteForumPost(post._id)
        : FORUM_API.upvoteForumPost(post._id);
      const res = await promise;
      if (res.data != null) {
        Object.assign(post, {
          isUpvoted: !post.isUpvoted,
          upvotesCount: post.isUpvoted
            ? post.upvotesCount - 1
            : post.upvotesCount + 1,
          isDownvoted: false,
          downvotesCount: post.isDownvoted
            ? post.downvotesCount - 1
            : post.downvotesCount,
        });
        setPosts([...posts]);
      } else {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
    }
  };

  const unlikePost = async (post: IForumPostListItem) => {
    try {
      const promise = post.isDownvoted
        ? FORUM_API.unvoteForumPost(post._id)
        : FORUM_API.downvoteForumPost(post._id);
      const res = await promise;
      if (res.data != null) {
        Object.assign(post, {
          isUpvoted: false,
          upvotesCount: post.isUpvoted
            ? post.upvotesCount - 1
            : post.upvotesCount,
          isDownvoted: !post.isDownvoted,
          downvotesCount: post.isDownvoted
            ? post.downvotesCount - 1
            : post.downvotesCount + 1,
        });
        setPosts([...posts]);
      } else {
        setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra, vui lòng thử lại sau");
    }
  };

  return (
    <Box className="page-wrapper" sx={{ position: "relative" }}>
      <Header />
      <Stack direction={"row"} gap={0.5} pt={2} justifyContent={"center"}>
        <Box sx={{ flex: 1, display: ["none", "none", "block"] }}></Box>
        <Stack
          direction={"column"}
          gap={3}
          sx={{
            width: ["100%", "80%", "590px", "590px"],
          }}
        >
          <ForumPostComposer
            avatarUrl={userRef.current?.avatar ?? ""}
            userName={userRef.current?.fullName ?? ""}
            onPostClick={() => {
              forumPostNewDialogRef.current &&
                forumPostNewDialogRef.current.open();
            }}
          />

          {posts.map((post) => (
            <ForumPost
              post={post}
              key={post._id}
              onCommentClick={() => {
                setShortcuts([
                  post,
                  ...shortcuts.filter((s) => s._id !== post._id),
                ]);
                forumPostDialogRef.current &&
                  forumPostDialogRef.current.open(post._id);
              }}
              onLikeClick={() => likePost(post)}
              onUnLikeClick={() => unlikePost(post)}
              hideComment
            />
          ))}
          {state === "fetching" && (
            <Stack
              direction={"column"}
              gap={0.5}
              borderRadius={"8px"}
              sx={{
                minHeight: "575px",
                maxHeight: "1000px",
                p: "12px",
                pb: "5px",
                color: "#080809",
              }}
              boxShadow={1}
            >
              <Skeleton
                variant="rectangular"
                sx={{ width: "100%", height: "100%" }}
              />
            </Stack>
          )}
        </Stack>
        {state === "error" && (
          <ErrorMessage
            sx={{ height: "100px" }}
            onRetry={() => fetch(ref, posts.length, 50)}
          />
        )}
        <Stack
          direction={"column"}
          sx={{
            flex: 1,
            display: ["none", "none", "none", "block"],
            justifyItems: "end",
          }}
        >
          <ForumLeftSide
            shortcuts={shortcuts}
            onOpenShortcut={(post) => {
              forumPostDialogRef.current &&
                forumPostDialogRef.current.open(post._id);
            }}
          />
        </Stack>
        <Tooltip title="Tạo bài viết" placement="left" arrow>
          <SpeedDial
            ariaLabel="Add action"
            sx={{ position: "fixed", bottom: 104, right: 24 }}
            icon={<EditOutlined />}
            onClick={() => {
              forumPostNewDialogRef.current &&
                forumPostNewDialogRef.current.open();
            }}
            FabProps={{
              color: "primary",
            }}
            open={false}
          />
        </Tooltip>
      </Stack>
      <Footer />
      <ForumPostDialog
        ref={forumPostDialogRef}
        afterClose={afterPostDialogClosed}
      />
      <ForumPostNewDialog ref={forumPostNewDialogRef} />
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
