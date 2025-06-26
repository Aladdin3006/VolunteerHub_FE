import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  DialogProps,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface IProps extends Omit<DialogProps, "open"> {}
export interface IImageViewerDialogRef {
  open: (images: string[], idx: number) => void;
}

interface IProps {}

export const ImageViewerDialog = forwardRef<IImageViewerDialogRef, IProps>(
  (props, ref) => {
    const { ...rest } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const close = () => {
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      open: (images: string[], idx: number) => {
        setImages(images);
        setCurrentIndex(idx);
        setOpen(true);
      },
    }));

    const handlePrev = () => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    return (
      <Dialog
        {...rest}
        open={open}
        onClose={close}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: "black",
            height: "90vh",
          },
        }}
      >
        <DialogContent
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            p: 0,
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={close}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Prev */}
          {images.length > 1 && (
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 8,
                color: "white",
                zIndex: 1,
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          {/* Image */}
          <Box
            component="img"
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            sx={{
              maxHeight: "90vh",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />

          {/* Next */}
          {images.length > 1 && (
            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 8,
                color: "white",
                zIndex: 1,
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}

          {/* Quick View (thumbnails) */}
          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 1,
              px: 2,
              pb: 1,
              width: "100%",
              justifyContent: "center",
              position: "absolute",
              bottom: "20px",
            }}
          >
            {images.map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img}
                onClick={() => setCurrentIndex(idx)}
                sx={{
                  height: 60,
                  width: 60,
                  objectFit: "cover",
                  borderRadius: 1,
                  cursor: "pointer",
                  border:
                    idx === currentIndex
                      ? "2px solid #fff"
                      : "2px solid transparent",
                  opacity: idx === currentIndex ? 1 : 0.6,
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Box>

          {/* Index text */}
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
            }}
          >
            {currentIndex + 1} / {images.length}
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }
);
