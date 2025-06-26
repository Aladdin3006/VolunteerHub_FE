import { forwardRef } from "react";
import { IForumPost } from "../../apis/forum";
import { Stack, StackProps, Typography } from "@mui/material";
import { ForumPostImages } from "./ForumPostIImages";

interface IProps extends StackProps {
  /**
   * Post data
   */
  post: IForumPost;
  onImageClick?: (images: string[], idx: number) => void;
}

export const ForumPostContent = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { post, onImageClick, ...rest } = props;

    return (
      <Stack ref={ref} {...rest}>
        {/* Content */}
        <Typography>{post.content}</Typography>
        {/* Tags */}
        <Stack direction={"row"} gap={1}>
          {post.tags.map((tag) => (
            <Typography
              key={tag._id}
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              #{tag.name}
            </Typography>
          ))}
        </Stack>
        {/* Images */}
        <ForumPostImages images={post.images} onImageClick={onImageClick} />
      </Stack>
    );
  }
);
