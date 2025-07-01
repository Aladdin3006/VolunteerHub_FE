import { forwardRef } from "react";
import {
  Box,
  BoxProps,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface IProps extends BoxProps {
  images: string[];
  maxVisible?: number;
  cols?: number;
  onImageClick?: (images: string[], idx: number) => void;
  onImageRemove?: (image: string, idx: number) => void;
}

const DEFAULT_MAX_VISIBLE = 4;

export const ForumPostImages = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { images, maxVisible, cols, onImageClick, onImageRemove, ...rest } =
      props;

    const rMaxVisible = maxVisible ?? DEFAULT_MAX_VISIBLE;
    const showCount =
      images.length > rMaxVisible ? rMaxVisible - 1 : images.length;
    const rCols = cols ?? (showCount > 1 ? 2 : 1);
    const extraCount = images.length - showCount;

    return (
      <Box
        ref={ref}
        {...rest}
        sx={{ width: "100%", height: "100%", overflow: "hidden", ...rest.sx }}
      >
        <ImageList
          cols={rCols}
          sx={{
            width: "100%",
            m: 0,
          }}
        >
          {images.slice(0, showCount).map((img, index) => (
            <ImageListItem
              key={index}
              onClick={() => {
                onImageClick && onImageClick(images, index);
              }}
              sx={{
                cursor: onImageClick ? "pointer" : "default",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: 1,
                }}
              >
                <img
                  src={img}
                  alt={`img-${index}`}
                  loading="lazy"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                />
                {onImageRemove && (
                  <IconButton
                    size="small"
                    onClick={() => onImageRemove(img, index)}
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      backgroundColor: "white",
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </ImageListItem>
          ))}

          {extraCount > 0 && (
            <ImageListItem
              onClick={() => {
                onImageClick && onImageClick(images, showCount);
              }}
              sx={{
                cursor: onImageClick ? "pointer" : "default",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: 1,
                }}
              >
                <img
                  src={images[showCount]}
                  alt="more"
                  loading="lazy"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    filter: "brightness(50%)",
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    color: "#fff",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontWeight: "bold",
                  }}
                >
                  +{extraCount}
                </Typography>
              </Box>
            </ImageListItem>
          )}
        </ImageList>
      </Box>
    );
  }
);
