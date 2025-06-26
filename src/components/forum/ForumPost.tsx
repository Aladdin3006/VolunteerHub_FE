import { forwardRef } from "react";
import { IComment, IForumPost } from "../../apis/forum";
import { Divider, Stack, StackProps } from "@mui/material";
import { ForumPostHeader } from "./ForumPostHeader";
import { ForumPostFooter } from "./ForumPostFooter";
import { ForumPostContent } from "./ForumPostContent";
import { ForumPostComments } from "./ForumPostComments";
import { CommentInput } from "./CommentInput";

interface IProps extends StackProps {
  /**
   * Post data
   */
  post: IForumPost;
  onHideClick?: () => void;
  onLikeClick?: () => void;
  onUnLikeClick?: () => void;
  onCommentClick?: () => void;
  onSaveClick?: () => void;
  onReportClick?: () => void;
  onImageClick?: (images: string[], idx: number) => void;
  hideComment?: boolean;
  onReply?: (comment: IComment | null, text: string) => void;
  maxComments?: number;
}

export const ForumPost = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const {
    post,
    onHideClick,
    onLikeClick,
    onUnLikeClick,
    onCommentClick,
    onImageClick,
    onReply,
    onSaveClick,
    onReportClick,
    hideComment,
    maxComments,
    ...rest
  } = props;

  return (
    <Stack
      ref={ref}
      direction={"column"}
      gap={0.5}
      borderRadius={"8px"}
      {...rest}
      sx={{
        minHeight: "575px",
        maxHeight: "1000px",
        p: "12px",
        pb: "5px",
        color: "#080809",
        ...rest.sx,
      }}
      boxShadow={1}
    >
      <ForumPostHeader
        post={post}
        onHide={onHideClick}
        onSave={onSaveClick}
        onReport={onReportClick}
      />
      <ForumPostContent
        post={post}
        sx={{ flex: 1 }}
        onImageClick={onImageClick}
      />
      <Divider />
      <ForumPostFooter
        post={post}
        onLikeClick={onLikeClick}
        onUnLikeClick={onUnLikeClick}
        onCommentClick={onCommentClick}
      />
      {!hideComment && (
        <ForumPostComments
          comments={post.comments}
          currentUserId={"0"}
          maxComments={maxComments ?? 1}
          onReply={onReply}
        />
      )}
      {onReply && <CommentInput onSend={(text) => onReply(null, text)} />}
    </Stack>
  );
});
