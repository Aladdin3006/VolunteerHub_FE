import { Box, BoxProps } from "@mui/material";
import { IComment } from "../../apis/forum";
import { ForumPostComment } from "./ForumPostComment";
import { forwardRef, useMemo } from "react";

interface IProps extends BoxProps {
  comments: IComment[];
  currentUserId?: string;
  maxComments?: number;
  onLike?: (comment: IComment) => void;
  onUnLike?: (comment: IComment) => void;
  onReply?: (comment: IComment, text: string) => void;
}

export const ForumPostComments = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const {
      comments,
      currentUserId,
      maxComments,
      onLike,
      onUnLike,
      onReply,
      ...rest
    } = props;

    const renderComments = useMemo(() => {
      if (maxComments == null) {
        return comments;
      }
      return comments.slice(0, maxComments);
    }, [comments, maxComments]);

    console.log("comments", comments);

    return (
      <Box
        ref={ref}
        {...rest}
        sx={{
          height: "200px",
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
            key={comment._id}
            comment={comment}
            currentUserId={currentUserId}
            onLike={onLike}
            onUnLike={onUnLike}
            onReply={onReply}
          />
        ))}
      </Box>
    );
  }
);
