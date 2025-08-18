import React from "react";
import {
  Popover,
  Box,
  Typography,
  Divider,
  Paper,
  List,
  ListItemButton,
} from "@mui/material";

interface NotificationItem {
  _id: string;
  title: string;
  content: string;
  read: boolean;
}

interface Props {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  notifications: NotificationItem[];
  onReadNotification?: (id: string) => void;
}

const NotificationDropdown: React.FC<Props> = ({
  open,
  anchorEl,
  onClose,
  notifications,
  onReadNotification,
}) => {
  const handleClick = async (id: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      await fetch(`${API_BASE}/notification/${id}/read`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });
      onReadNotification?.(id); // optional callback
      onClose(); // đóng popover sau khi bấm
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      PaperProps={{ sx: { width: 320, p: 1, borderRadius: 2 } }}
    >
      <Paper elevation={0}>
        <List>
          {notifications.map((item, index) => (
            <React.Fragment key={item._id}>
              <ListItemButton onClick={() => handleClick(item._id)}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={item.read ? 400 : 600}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.content}
                  </Typography>
                </Box>
              </ListItemButton>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Popover>
  );
};

export default NotificationDropdown;
