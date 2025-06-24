import React, { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { io } from "socket.io-client";
import axios from "axios";
import authService from "../../services/Authentication.service";

const API_URL = "http://localhost:4000";
const SOCKET_URL = "http://localhost:4000";

interface NotificationBellProps {
  color?: string; 
}

let socket;

const NotificationBell: React.FC<NotificationBellProps> = ({ color = "#fff" }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    const user = authService.getUser();
    const _token = authService.getToken();

    if (user && _token) {
      setUserId(user._id);
      setToken(`Bearer ${_token}`);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!token) return;

      const axiosClient = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      const res = await axiosClient.get("/notification");
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
    } catch (err) {
      console.error("❌ Lỗi khi gọi API thông báo:", err);
    }
  };

  useEffect(() => {
    if (!userId || !token) return;

    fetchNotifications();

    const socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"],
    });
    
     socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ color }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 350, p: 1 } }}
      >
        {notifications.length === 0 ? (
          <Box p={2}>
            <Typography variant="body2">Không có thông báo</Typography>
          </Box>
        ) : (
          notifications.map((noti) => (
            <Box
              key={noti._id}
              component="a"
              href={noti.link}
              target="_blank"
              rel="noreferrer"
              sx={{
                textDecoration: "none",
                color: "inherit",
                px: 2,
                py: 1,
                borderRadius: 1,
                display: "block",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                  cursor: "pointer",
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar
                  src={noti.image || "/default-avatar.png"}
                  alt={noti.title}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {noti.title}
                  </Typography>
                  <Typography variant="body2">{noti.content}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;