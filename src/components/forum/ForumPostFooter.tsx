import { forwardRef } from "react";
import { IForumPostListItem } from "../../apis/forum";
import { Badge, Button, Stack, StackProps } from "@mui/material";
import {
  ContentCopyOutlined,
  MapsUgcOutlined,
  ThumbDownOffAlt,
  ThumbDownOffAltOutlined,
  ThumbUp,
  ThumbUpOutlined,
} from "@mui/icons-material";

interface IProps extends StackProps {
  /**
   * Post data
   */
  post: IForumPostListItem;
  onLikeClick?: () => void;
  onUnLikeClick?: () => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
}

export const ForumPostFooter = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const {
      post,
      onLikeClick,
      onUnLikeClick,
      onCommentClick,
      onShareClick,
      ...rest
    } = props;
    return (
      <Stack
        ref={ref}
        {...rest}
        direction={"row"}
        sx={{
          justifyContent: "space-around",
          ".MuiBadge-badge": {
            top: -2,
            right: 0,
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
          pt: 1,
          ...rest.sx,
        }}
      >
        <Button
          startIcon={
            <Badge badgeContent={post.upvotesCount} color="secondary">
              {post.isUpvoted ? <ThumbUp /> : <ThumbUpOutlined />}
            </Badge>
          }
          sx={{ textTransform: "none" }}
          fullWidth
          onClick={onLikeClick}
          color={post.isUpvoted ? "info" : "inherit"}
        >
          {post.isUpvoted ? "Đã thích" : "Thích"}
        </Button>
        <Button
          startIcon={
            <Badge badgeContent={post.downvotesCount} color="secondary">
              {post.isDownvoted ? (
                <ThumbDownOffAlt />
              ) : (
                <ThumbDownOffAltOutlined />
              )}
            </Badge>
          }
          sx={{ textTransform: "none" }}
          fullWidth
          onClick={onUnLikeClick}
          color={post.isDownvoted ? "error" : "inherit"}
        >
          {post.isDownvoted ? "Đã chê" : "Không thích"}
        </Button>
        <Button
          startIcon={
            <Badge badgeContent={post.commentsCount} color="secondary">
              <MapsUgcOutlined />
            </Badge>
          }
          sx={{ textTransform: "none" }}
          fullWidth
          onClick={onCommentClick}
          color="inherit"
        >
          Bình luận
        </Button>
        <Button
          startIcon={<ContentCopyOutlined />}
          sx={{ textTransform: "none" }}
          fullWidth
          onClick={onShareClick}
          color="inherit"
        >
          Liên kết
        </Button>
      </Stack>
    );
  }
);
