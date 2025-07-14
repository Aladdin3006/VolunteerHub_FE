import React, { useRef } from "react";
import {
  Box,
  BoxProps,
  IconButton,
  ImageListItem,
  ImageListItemProps,
} from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";

interface IProps extends ImageListItemProps<any> {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onDelete?: () => void;
  onView?: () => void;
  accept?: string;
  multiple?: boolean;
  slotProps?: {
    box?: BoxProps;
  };
  url: string;
}

export default function ImageUpload(props: IProps) {
  const {
    onChange,
    onDelete,
    onView,
    accept = "image/*",
    multiple = false,
    slotProps,
    url,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const hasEvent = Boolean(onChange || onDelete || onView);

  return (
    <ImageListItem {...rest}>
      <Box
        {...slotProps?.box}
        sx={{
          position: "relative",
          width: "100%",
          height: 140,
          overflow: "hidden",
          borderRadius: 1,
          ...slotProps?.box?.sx,
        }}
      >
        <img
          src={url}
          loading="lazy"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            borderRadius: 8,
          }}
        />
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          ref={inputRef}
          onChange={onChange}
          style={{ display: "none" }}
        />
        {hasEvent && (
          <Box
            className="overlay"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0,0,0,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              opacity: 0,
              transition: "opacity 0.3s ease",
              "&:hover": {
                opacity: 1,
              },
            }}
          >
            {onView && (
              <IconButton onClick={() => onView()} color="info">
                <Visibility />
              </IconButton>
            )}
            {onDelete && (
              <IconButton onClick={() => onDelete()} color="error">
                <Delete />
              </IconButton>
            )}
            {onChange && (
              <IconButton
                onClick={() => {
                  inputRef.current?.click();
                }}
                color="secondary"
              >
                <Edit />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    </ImageListItem>
  );
}
