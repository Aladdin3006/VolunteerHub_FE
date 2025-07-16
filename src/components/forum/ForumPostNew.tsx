import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardProps,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { ForumPostImages } from "./ForumPostIImages";
import CategoryTag from "../utils/CategoryTag";
import { ICategory } from "../campaign/CampaignForm";
import CategorySearchInput from "../utils/CategorySearchInput";

export interface IForumPostNewRef {
  clear: () => void;
}

export interface IFormPostFormData {
  title: string;
  content: string;
  images: File[];
  tags: ICategory[];
}

interface IProps extends CardProps<any> {
  avatarUrl: string;
  userName: string;
  onSubmit?: (data: IFormPostFormData) => void;
}

const MAX_CONTENT_LENGTH = 500;
const MAX_TITLE_LENGTH = 100;

export const ForumPostNew = forwardRef<IForumPostNewRef, IProps>(
  (props, ref) => {
    const { avatarUrl, userName, onSubmit, ...rest } = props;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [tags, setTags] = useState<ICategory[]>([]);

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
      setTitle("");
      setContent("");
      setImages([]);
      setImagePreviews([]);
      setTags([]);
    };

    const handlePost = () => {
      if (onSubmit) {
        onSubmit({ title, content, images, tags });
      }
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
          pr={1}
        >
          <TextField
            placeholder={`Tiêu đề bài viết`}
            fullWidth
            variant="standard"
            value={title}
            onChange={(e) => {
              if (e.target.value.length <= MAX_TITLE_LENGTH) {
                setTitle(e.target.value);
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
              mb: 1,
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
          <TextField
            placeholder={`Nội dung bài viết`}
            multiline
            fullWidth
            minRows={4}
            maxRows={150}
            variant="standard"
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                setContent(e.target.value);
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
            {content.length}/{MAX_CONTENT_LENGTH}
          </Typography>

          {tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
              {tags.map((tag, i) => (
                <CategoryTag
                  key={tag._id}
                  name={tag.name}
                  icon={tag.icon}
                  tagColor={tag.color}
                  onDelete={() => {
                    setTags(tags.filter((_, j) => j !== i));
                  }}
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
            ẢNH
            <input
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={handleImageChange}
            />
          </Button>

          <CategorySearchInput
            onChange={(value) => {
              if (value != null) {
                if (tags.find((tag) => tag._id === value._id) == null) {
                  setTags((prev) => {
                    return [...prev, value];
                  });
                }
              }
            }}
            slotProps={{
              textfield: {
                fullWidth: false,
                sx: {
                  width: { xs: "100%", sm: "250px" },
                  backgroundColor: "#f0f2f5",
                  borderRadius: 8,
                  "& .MuiOutlinedInput-root": {
                    px: 1,
                  },
                  "& fieldset": {
                    border: "none",
                  },
                },
              },
            }}
            suggestText="Tìm kiếm chủ đề"
          />

          <Box flexGrow={1} />

          <Button
            variant="contained"
            disabled={!content.trim()}
            onClick={handlePost}
            sx={{
              width: { xs: "100%", sm: "150px" },
            }}
          >
            Đăng bài
          </Button>
        </Stack>
      </Card>
    );
  }
);
