import { forwardRef } from "react";
import { IForumPost } from "../../apis/forum";
import { Badge, Button, Stack, StackProps } from "@mui/material";
import {
  ContentCopyOutlined,
  MapsUgcOutlined,
  ThumbDownOffAltOutlined,
  ThumbUpOutlined,
} from "@mui/icons-material";

interface IProps extends StackProps {
  /**
   * Post data
   */
  post: IForumPost;
  onLikeClick?: () => void;
  onUnLikeClick?: () => void;
  onCommentClick?: () => void;
}

export const ForumPostFooter = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { post, onLikeClick, onUnLikeClick, onCommentClick, ...rest } = props;
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
            <Badge badgeContent={post.upvotes.length} color="secondary">
              <ThumbUpOutlined />
            </Badge>
          }
          sx={{ textTransform: "none" }}
          fullWidth
          onClick={onLikeClick}
        >
          Like
        </Button>
        <Button
          startIcon={
            <Badge badgeContent={post.downvotes.length} color="secondary">
              <ThumbDownOffAltOutlined />
            </Badge>
          }
          sx={{ textTransform: "none" }}
          fullWidth
          onClick={onUnLikeClick}
        >
          Unlike
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
        >
          Comment
        </Button>
        <Button
          startIcon={<ContentCopyOutlined />}
          sx={{ textTransform: "none" }}
          fullWidth
        >
          Copy
        </Button>
      </Stack>
    );
  }
);
