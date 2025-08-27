import { forwardRef } from "react";
import {
  Avatar,
  Box,
  Card,
  CardProps,
  Divider,
  IconButton,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import {
  EmojiEmotions,
  ImageOutlined,
  StyleOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface IProps extends CardProps {
  avatarUrl: string;
  userName: string;
  isLoggedIn: boolean;
  onPostClick?: () => void;
}

export const ForumPostComposer = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { avatarUrl, userName, isLoggedIn, onPostClick, ...rest } = props;
    const navigate = useNavigate();

    const handlePostClick = () => {
      if (!isLoggedIn) {
        return;
      }
      onPostClick?.();
    };

    return (
      <Card
        ref={ref}
        {...rest}
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
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
          ...rest.sx,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={avatarUrl} alt={userName} sx={{ mt: 0.5 }}>
            {userName.slice(0, 2)}
          </Avatar>
          <Box flex={1}>
            {isLoggedIn ? (
              <Box
                onClick={handlePostClick}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 8,
                  backgroundColor: "#f0f2f5",
                  fontSize: 16,
                  color: "text.secondary",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#e4e6eb",
                  },
                }}
              >
                Hãy đăng một bài viết, {userName}
              </Box>
            ) : (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập
                  </Button>
                }
              >
                Bạn cần đăng nhập để đăng bài viết
              </Alert>
            )}
          </Box>
          {isLoggedIn && (
            <>
              <Divider sx={{ my: 1 }} />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={2}>
                  <IconButton color="error" onClick={handlePostClick}>
                    <StyleOutlined />
                  </IconButton>
                  <IconButton color="success" onClick={handlePostClick}>
                    <ImageOutlined />
                  </IconButton>
                  <IconButton color="warning" onClick={handlePostClick}>
                    <EmojiEmotions />
                  </IconButton>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    );
  }
);
