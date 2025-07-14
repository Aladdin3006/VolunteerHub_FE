import { Box, SpeedDial, Stack, Tooltip } from "@mui/material";
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
} from "../../components/forum/ForumPostNewDialog";
import ForumLeftSide from "./ForumLeftSide";
import { IComment, IForumPost } from "../../apis/forum";
import { EditOutlined } from "@mui/icons-material";

export default function ForumPage() {
  const { posts } = userForumData();
  const forumPostDialogRef = useRef<IForumPostDialogRef | null>(null);
  const forumPostNewDialogRef = useRef<IForumPostNewDialogRef | null>(null);

  const [saveds, setSaveds] = useState<IForumPost[]>([]);

  const handleComment = (
    post: IForumPost,
    comment: IComment | null,
    text: string
  ) => {
    if (comment == null) {
      post.comments = [
        ...post.comments,
        {
          _id: String(Date.now()),
          comments: [],
          content: text,
          createdAt: new Date().toISOString(),
          createdBy: {
            _id: "a",
            fullName: "Test user",
          },
          downvotes: [],
          parentComment: "",
          updatedAt: new Date().toISOString(),
          upvotes: [],
        },
      ];
      // setPosts([...posts]);
      forumPostDialogRef.current &&
        forumPostDialogRef.current.open({ ...post });
      console.log(post);
    }
  };

  return (
    <Box className="page-wrapper" sx={{ position: "relative" }}>
      <Header />
      <Stack direction={"row"} gap={0.5} pt={2} justifyContent={"center"}>
        <Box sx={{ flex: 1, display: ["none", "none", "block"] }}>
          <ForumLeftSide
            saveds={saveds}
            onOpenShortcut={(post) => {
              forumPostDialogRef.current &&
                forumPostDialogRef.current.open(post);
            }}
          />
        </Box>
        <Stack
          direction={"column"}
          gap={3}
          sx={{
            width: ["100%", "80%", "590px", "590px"],
          }}
        >
          <ForumPostComposer
            avatarUrl=""
            userName="Huy"
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
                forumPostDialogRef.current &&
                  forumPostDialogRef.current.open(post);
              }}
              hideComment
              onSaveClick={() => {
                setSaveds([...saveds, post]);
              }}
            />
          ))}
        </Stack>
        <Box sx={{ flex: 1, display: ["none", "none", "none", "block"] }}></Box>
        <Tooltip title="Tạo bài viết" placement="left" arrow>
          <SpeedDial
            ariaLabel="Add action"
            sx={{ position: "fixed", bottom: 24, right: 24 }}
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
        onRely={handleComment}
        onSaveClick={(post) => {
          setSaveds([...saveds, post]);
        }}
      />
      <ForumPostNewDialog
        ref={forumPostNewDialogRef}
        avatarUrl=""
        userName="Huy"
      />
    </Box>
  );
}
