import { forwardRef } from "react";
import { ICommentListItem, IForumPostListItem } from "../../apis/forum";
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
  post: IForumPostListItem;

  onHideClick?: () => void;
  onLikeClick?: () => void;
  onUnLikeClick?: () => void;
  onCommentClick?: () => void;
  onSaveClick?: () => void;
  onReportClick?: () => void;
  onImageClick?: (images: string[], idx: number) => void;
  hideComment?: boolean;
  onReply?: (
    comment: ICommentListItem | null,
    text: string
  ) => Promise<boolean>;
  onShowReplies?: (comment: ICommentListItem) => Promise<boolean>;
  maxComments?: number;

  onLikeCommentClick?: (comment: ICommentListItem) => void;
  onUnLikeCommentClick?: (comment: ICommentListItem) => void;
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
    onShowReplies,
    onSaveClick,
    onReportClick,
    hideComment,
    maxComments,
    onLikeCommentClick,
    onUnLikeCommentClick,
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
          comments={post.comments ?? []}
          maxComments={maxComments ?? 1}
          onReply={onReply}
          onShowReplies={onShowReplies}
          onLike={onLikeCommentClick}
          onUnLike={onUnLikeCommentClick}
        />
      )}
      {onReply && <CommentInput onSend={(text) => onReply(null, text)} />}
    </Stack>
  );
});
