import { Box, BoxProps } from "@mui/material";
import { ICommentListItem } from "../../apis/forum";
import { ForumPostComment } from "./ForumPostComment";
import { forwardRef, useMemo } from "react";

interface IProps extends BoxProps {
  comments: ICommentListItem[];
  maxComments?: number;
  onLike?: (comment: ICommentListItem) => void;
  onUnLike?: (comment: ICommentListItem) => void;
  onReply?: (comment: ICommentListItem, text: string) => Promise<boolean>;
  onShowReplies?: (comment: ICommentListItem) => Promise<boolean>;
  maxLevel?: number;
}

const DEFAULT_MAX_LEVEL = 2;

export const ForumPostComments = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const {
      comments,
      maxComments,
      onLike,
      onUnLike,
      onReply,
      onShowReplies,
      maxLevel,
      ...rest
    } = props;

    const renderComments = useMemo(() => {
      if (maxComments == null) {
        return comments;
      }
      return comments.slice(0, maxComments);
    }, [comments, maxComments]);

    return (
      <Box
        ref={ref}
        {...rest}
        sx={{
          height: "280px",
          overflowY: "auto",
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
          "& button": {
            textTransform: "none",
            "&:focus": {
              outline: "none",
            },
            "&:focus-visible": {
              outline: "none",
            },
            "&:active": {
              boxShadow: "none",
            },
          },
          ...rest.sx,
        }}
      >
        {renderComments.map((comment) => (
          <ForumPostComment
            key={comment._id + comment.updateCount}
            comment={comment}
            onLike={onLike}
            onUnLike={onUnLike}
            onReply={onReply}
            onShowReplies={onShowReplies}
            level={1}
            maxLevel={maxLevel ?? DEFAULT_MAX_LEVEL}
          />
        ))}
      </Box>
    );
  }
);
