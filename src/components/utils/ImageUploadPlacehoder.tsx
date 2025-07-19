import React, { useRef } from "react";
import {
  Box,
  BoxProps,
  ImageListItem,
  ImageListItemProps,
} from "@mui/material";
import { Add } from "@mui/icons-material";

interface IProps extends ImageListItemProps<any> {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  accept?: string;
  multiple?: boolean;
  slotProps?: {
    box?: BoxProps;
  };
}

export default function ImageUploadPlaceholder(props: IProps) {
  const {
    onChange,
    accept = "image/*",
    multiple = false,
    slotProps,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <ImageListItem {...rest}>
      <Box
        onClick={() => inputRef.current?.click()}
        {...slotProps?.box}
        sx={{
          width: "100%",
          height: 140,
          border: "2px dashed #ccc",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          ...slotProps?.box?.sx,
        }}
      >
        <Add fontSize="large" color="action" />
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          ref={inputRef}
          onChange={onChange}
          style={{ display: "none" }}
        />
      </Box>
    </ImageListItem>
  );
}
