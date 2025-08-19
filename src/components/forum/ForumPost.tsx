import { forwardRef } from "react";
import {
  ICommentListItem,
  IForumPostListItem,
  IUserShort,
} from "../../apis/forum";
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
  user?: IUserShort;

  onHideClick?: () => void;
  onDeleteClick?: () => void;
  onLikeClick?: () => void;
  onUnLikeClick?: () => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  onSaveClick?: () => void;
  onEditClick?: () => void;
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
    user,
    onHideClick,
    onDeleteClick,
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
    onShareClick,
    onEditClick,
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
        minHeight: "fit-content",
        maxHeight: "1000px",
        p: "12px",
        pb: "5px",
        color: "#080809",
        backgroundColor: "white",
        ...rest.sx,
      }}
      boxShadow={1}
    >
      <ForumPostHeader
        post={post}
        onHide={onHideClick}
        onSave={onSaveClick}
        onReport={onReportClick}
        onDelete={onDeleteClick}
        onEdit={onEditClick}
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
        onShareClick={onShareClick}
      />
      {!hideComment && (
        <>
          <Divider />
          <ForumPostComments
            comments={post.comments ?? []}
            maxComments={maxComments ?? 1}
            onReply={onReply}
            onShowReplies={onShowReplies}
            onLike={onLikeCommentClick}
            onUnLike={onUnLikeCommentClick}
          />
        </>
      )}
      {onReply && (
        <CommentInput
          onSend={(text) => onReply(null, text)}
          relyTo={null}
          user={user}
        />
      )}
    </Stack>
  );
});
