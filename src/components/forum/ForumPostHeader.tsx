import { forwardRef, useState } from "react";
import { IForumPostListItem } from "../../apis/forum";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  StackProps,
  Typography,
} from "@mui/material";
import {
  Bookmark,
  CloseOutlined,
  Delete,
  MoreHorizOutlined,
  OutlinedFlagOutlined,
  VisibilityOffOutlined,
} from "@mui/icons-material";
import { getRelativeTime } from "./utils";

interface IProps extends StackProps {
  /**
   * Post data
   */
  post: IForumPostListItem;
  onHide?: () => void;
  onSave?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
}

export const ForumPostHeader = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { post, onHide, onSave, onReport, onDelete, ...rest } = props;
    const { createdBy } = post;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const actionVisible = Boolean(onSave || onReport || onHide || onDelete);

    return (
      <Stack ref={ref} direction={"row"} gap={1} {...rest}>
        <Avatar
          alt={createdBy.fullName}
          src={createdBy.avatar}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          {createdBy.fullName.slice(0, 2)}
        </Avatar>
        <Stack direction={"column"} gap={0.2} flex={1}>
          <Typography sx={{ color: "black", fontSize: "16px" }}>
            {createdBy.fullName}
          </Typography>
          <Typography sx={{ color: "black", fontSize: "12px" }}>
            {getRelativeTime(post.createdAt)}
          </Typography>
        </Stack>
        {actionVisible && (
          <Stack
            direction={"row"}
            sx={{
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
            }}
          >
            <IconButton
              onClick={handleClick}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <MoreHorizOutlined />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {onDelete && (
                <MenuItem
                  onClick={() => {
                    onDelete();
                    handleClose();
                  }}
                  sx={{ gap: 2 }}
                >
                  <Delete color="error" /> Xóa bài viết
                </MenuItem>
              )}
              {onSave && (
                <MenuItem
                  onClick={() => {
                    onSave();
                    handleClose();
                  }}
                  sx={{ gap: 2 }}
                >
                  <Bookmark color="secondary" /> Lưu bài viết
                </MenuItem>
              )}
              {onReport && (
                <MenuItem
                  onClick={() => {
                    onReport();
                    handleClose();
                  }}
                  sx={{ gap: 2 }}
                >
                  <OutlinedFlagOutlined color="error" /> Báo cáo
                </MenuItem>
              )}
              {onHide && (
                <MenuItem
                  onClick={() => {
                    onHide();
                    handleClose();
                  }}
                  sx={{ gap: 2 }}
                >
                  <VisibilityOffOutlined color="warning" /> Ẩn bài viết
                </MenuItem>
              )}
            </Menu>
            {onHide && (
              <IconButton onClick={onHide}>
                <CloseOutlined />
              </IconButton>
            )}
          </Stack>
        )}
      </Stack>
    );
  }
);
