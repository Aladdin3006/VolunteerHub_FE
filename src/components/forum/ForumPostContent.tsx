import { forwardRef } from "react";
import { IForumPostListItem } from "../../apis/forum";
import { Stack, StackProps, Typography } from "@mui/material";
import { ForumPostImages } from "./ForumPostIImages";

interface IProps extends StackProps {
  /**
   * Post data
   */
  post: IForumPostListItem;
  onImageClick?: (images: string[], idx: number) => void;
}

export const ForumPostContent = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { post, onImageClick, ...rest } = props;

    return (
      <Stack ref={ref} {...rest}>
        {/* Title */}
        <Typography variant="h6">{post.title}</Typography>
        {/* Content */}
        <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
          {post.content}
        </Typography>
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
        <ForumPostImages
          images={post.images}
          onImageClick={onImageClick}
          sx={{
            maxHeight: "500px",
          }}
        />
      </Stack>
    );
  }
);
