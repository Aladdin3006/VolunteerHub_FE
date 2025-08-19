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
import { ICommentListItem, IUserShort } from "../../apis/forum";
import { getRelativeTime } from "./utils";
import {
  ThumbUpAltOutlined,
  ThumbDownAltOutlined,
  ReplyOutlined,
  ThumbDownAlt,
  ThumbUpAlt,
} from "@mui/icons-material";
import { CommentInput } from "./CommentInput";

interface IProps extends BoxProps {
  comment: ICommentListItem;
  onLike?: (comment: ICommentListItem) => void;
  onUnLike?: (comment: ICommentListItem) => void;
  onReply?: (comment: ICommentListItem, text: string) => Promise<boolean>;
  onShowReplies?: (comment: ICommentListItem) => Promise<boolean>;
  childReply?: (Comment: ICommentListItem) => void;
  level: number;
  maxLevel: number;
}

export const ForumPostComment = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const {
      comment,
      onLike,
      onUnLike,
      onReply,
      onShowReplies,
      childReply,
      level,
      maxLevel,
      ...rest
    } = props;

    const [showReplies, setShowReplies] = useState(comment.updateCount != null);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [replyTo, setReplyTo] = useState<IUserShort | null>(null);

    const handleToggleReplies = async () => {
      if (onShowReplies && !showReplies && !comment.isLoadedAllComments) {
        const rs = await onShowReplies(comment);
        if (rs) {
          setShowReplies(true);
        }
      } else {
        setShowReplies((prev) => !prev);
      }
    };

    const scrollToCommentInput = () => {
      setTimeout(() => {
        const el = document.getElementById(`comment-input-${comment._id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };

    const handleChildReply = (comment: ICommentListItem) => {
      if (!showCommentInput) {
        setShowCommentInput(true);
      }
      setReplyTo({ ...comment.createdBy });
      scrollToCommentInput();
    };

    return (
      <Box
        ref={ref}
        {...rest}
        sx={{ display: "flex", gap: 2, my: 1, ...rest.sx }}
      >
        <Avatar src={comment.createdBy.avatar}>
          {comment.createdBy.fullName.slice(0, 2)}
        </Avatar>
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
              color={comment.isUpvoted ? "primary" : "default"}
              onClick={() => onLike && onLike(comment)}
            >
              {comment.isUpvoted ? (
                <ThumbUpAlt fontSize="small" />
              ) : (
                <ThumbUpAltOutlined fontSize="small" />
              )}
            </IconButton>
            <IconButton
              size="small"
              color={comment.isDownvoted ? "error" : "default"}
              onClick={() => onUnLike && onUnLike(comment)}
            >
              {comment.isDownvoted ? (
                <ThumbDownAlt fontSize="small" />
              ) : (
                <ThumbDownAltOutlined fontSize="small" />
              )}
            </IconButton>
            {level <= maxLevel && (
              <IconButton
                size="small"
                color={"default"}
                onClick={() => {
                  if (level === maxLevel) {
                    childReply && childReply(comment);
                  } else {
                    if (!showCommentInput) {
                      setReplyTo(comment.createdBy);
                      setShowCommentInput(true);
                      scrollToCommentInput();
                    } else {
                      setReplyTo(null);
                      setShowCommentInput(false);
                    }
                  }
                }}
              >
                <ReplyOutlined fontSize="small" />
              </IconButton>
            )}
            {level < maxLevel && showReplies && (
              <Button
                onClick={handleToggleReplies}
                size="small"
                sx={{ textTransform: "none", pl: 0 }}
              >
                Ẩn {comment.commentsCount} bình luận
              </Button>
            )}
            {level < maxLevel && comment.commentsCount > 0 && !showReplies && (
              <Button
                onClick={handleToggleReplies}
                size="small"
                sx={{ textTransform: "none", pl: 0 }}
              >
                Hiển thị {comment.commentsCount} bình luận
              </Button>
            )}
          </Stack>

          <Collapse in={showReplies} timeout="auto" unmountOnExit>
            <Box position="relative" ml={0} mt={1}>
              <Box pl={0}>
                {(comment.comments ?? []).map((reply) => (
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
                      onLike={onLike}
                      onUnLike={onUnLike}
                      onReply={onReply}
                      level={level + 1}
                      maxLevel={maxLevel}
                      childReply={handleChildReply}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>

          {showCommentInput && onReply && (
            <CommentInput
              onSend={async (text) => {
                const result = await onReply(comment, text);
                if (result && onShowReplies) {
                  onShowReplies(comment);
                  setShowReplies(true);
                }
                return result;
              }}
              relyTo={replyTo}
              id={`comment-input-${comment._id}`}
            />
          )}
        </Box>
      </Box>
    );
  }
);
