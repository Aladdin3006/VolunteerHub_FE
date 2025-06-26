import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardProps,
  Chip,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PhotoCamera, Tag } from "@mui/icons-material";
import { ForumPostImages } from "./ForumPostIImages";

export interface IForumPostNewRef {
  clear: () => void;
}

interface IProps extends CardProps<any> {
  avatarUrl: string;
  userName: string;
  onSubmit?: (data: { text: string; images: File[]; tags: string[] }) => void;
}

const MAX_TEXT_LENGTH = 500;

export const ForumPostNew = forwardRef<IForumPostNewRef, IProps>(
  (props, ref) => {
    const { avatarUrl, userName, onSubmit, ...rest } = props;

    const [text, setText] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const files = Array.from(e.target.files);
      const newFiles = files.filter(
        (file) =>
          !images.some(
            (img) => img.name === file.name && img.size === file.size
          )
      );

      setImages((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [
        ...prev,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ]);

      e.target.value = "";
    };

    const clear = () => {
      setText("");
      setImages([]);
      setImagePreviews([]);
      setTags([]);
    };

    const handlePost = () => {
      if (onSubmit) onSubmit({ text, images, tags });
      clear();
    };

    const handleRemoveImage = (index: number) => {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    useImperativeHandle(ref, () => ({
      clear: clear,
    }));

    return (
      <Card
        variant="outlined"
        {...rest}
        sx={{
          p: 2,
          borderRadius: 3,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          ...rest.sx,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar src={avatarUrl} />
          <Box>
            <Typography fontWeight={500}>{userName}</Typography>
            <Typography fontSize={13} color="text.secondary">
              Công khai 🌐
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ mb: 0.5 }} />

        <Stack
          sx={{
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
          direction={"column"}
          flex={1}
        >
          <TextField
            placeholder={`What's on your mind, ${userName}?`}
            multiline
            fullWidth
            minRows={4}
            maxRows={150}
            variant="standard"
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_TEXT_LENGTH) {
                setText(e.target.value);
              }
            }}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: 18,
                backgroundColor: "transparent",
                p: 0,
              },
            }}
            sx={{
              mb: 0,
              ".MuiInputBase-input": {
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
              },
            }}
          />
          <Typography align="right" color="text.secondary" fontSize={12}>
            {text.length}/{MAX_TEXT_LENGTH}
          </Typography>

          {tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
              {tags.map((tag, i) => (
                <Chip
                  key={i}
                  label={tag}
                  onDelete={() => setTags(tags.filter((_, j) => j !== i))}
                />
              ))}
            </Stack>
          )}

          {imagePreviews.length > 0 && (
            <ForumPostImages
              flexWrap="wrap"
              my={2}
              images={imagePreviews}
              onImageRemove={(_img, idx) => {
                handleRemoveImage(idx);
              }}
              sx={{
                minHeight: "fit-content",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
              }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component="label"
            startIcon={<PhotoCamera />}
            variant="outlined"
            sx={{ borderRadius: 8, width: { xs: "100%", sm: "150px" } }}
          >
            Photo
            <input
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={handleImageChange}
            />
          </Button>

          <TextField
            placeholder="Tag"
            value={tagInput}
            onChange={(e) => {
              if (e.target.value.length <= 20) setTagInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();
                const newTag = tagInput.trim();
                if (!tags.includes(newTag)) {
                  setTags((prev) => [...prev, newTag]);
                }
                setTagInput("");
              }
            }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tag fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: "150px" },
              backgroundColor: "#f0f2f5",
              borderRadius: 8,
              "& .MuiOutlinedInput-root": {
                px: 1,
              },
              "& fieldset": {
                border: "none",
              },
            }}
          />

          <Box flexGrow={1} />

          <Button
            variant="contained"
            disabled={!text.trim()}
            onClick={handlePost}
            sx={{
              width: { xs: "100%", sm: "150px" },
            }}
          >
            Post
          </Button>
        </Stack>
      </Card>
    );
  }
);
