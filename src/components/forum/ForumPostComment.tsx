import { forwardRef, useState } from "react";
import {
  Avatar,
  Box,
  BoxProps,
  Button,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { IComment } from "../../apis/forum";
import { getRelativeTime } from "./utils";
import {
  ThumbUpAltOutlined,
  ThumbDownAltOutlined,
  ReplyOutlined,
} from "@mui/icons-material";
import { CommentInput } from "./CommentInput";

interface IProps extends BoxProps {
  comment: IComment;
  currentUserId?: string;
  onLike?: (comment: IComment) => void;
  onUnLike?: (comment: IComment) => void;
  onReply?: (comment: IComment, text: string) => void;
}

export const ForumPostComment = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { comment, currentUserId, onLike, onUnLike, onReply, ...rest } =
      props;

    const [showReplies, setShowReplies] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);

    const handleToggleReplies = () => {
      setShowReplies((prev) => !prev);
    };

    const isUpvoted = currentUserId && comment.upvotes.includes(currentUserId);
    const isDownvoted =
      currentUserId && comment.downvotes.includes(currentUserId);

    return (
      <Box
        ref={ref}
        {...rest}
        sx={{ display: "flex", gap: 2, my: 1, ...rest.sx }}
      >
        <Avatar src={comment.createdBy.avatar} />
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              backgroundColor: "#f0f2f5",
              borderRadius: 2,
              px: 2,
              py: 1,
              maxWidth: "100%",
              wordBreak: "break-word",
            }}
          >
            <Typography fontWeight="bold">
              {comment.createdBy.fullName}
            </Typography>
            <Typography sx={{ whiteSpace: "pre-line" }}>
              {comment.content}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} mt={0.5}>
            <Typography variant="caption" sx={{ alignSelf: "center" }}>
              {getRelativeTime(comment.createdAt)}
            </Typography>
            <IconButton
              size="small"
              color={isUpvoted ? "primary" : "default"}
              onClick={() => onLike && onLike(comment)}
            >
              <ThumbUpAltOutlined fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color={isDownvoted ? "error" : "default"}
              onClick={() => onUnLike && onUnLike(comment)}
            >
              <ThumbDownAltOutlined fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color={isDownvoted ? "error" : "default"}
              onClick={() => setShowCommentInput(!showCommentInput)}
            >
              <ReplyOutlined fontSize="small" />
            </IconButton>
          </Stack>

          {comment.comments?.length > 0 && !showReplies && (
            <Button
              onClick={handleToggleReplies}
              size="small"
              sx={{ textTransform: "none", pl: 0 }}
            >
              Show {comment.comments.length} comments
            </Button>
          )}

          <Collapse in={showReplies} timeout="auto" unmountOnExit>
            <Box position="relative" ml={0} mt={1}>
              <Box pl={0}>
                {comment.comments.map((reply) => (
                  <Box key={reply._id}>
                    {/* <Box
                    key={reply._id}
                    sx={{
                      position: "absolute",
                      top: `0px`,
                      left: "-40px",
                      width: 20,
                      height: "70%",
                      borderLeft: "2px solid #ccc",
                      borderBottom: "2px solid #ccc",
                      borderBottomLeftRadius: 8,
                    }}
                  /> */}
                    <ForumPostComment
                      key={reply._id}
                      comment={reply}
                      currentUserId={currentUserId}
                      onLike={onLike}
                      onUnLike={onUnLike}
                      onReply={onReply}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>

          {showCommentInput && onReply && (
            <CommentInput onSend={(text) => onReply(comment, text)} />
          )}
        </Box>
      </Box>
    );
  }
);
