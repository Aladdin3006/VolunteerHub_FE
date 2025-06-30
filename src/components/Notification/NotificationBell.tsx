import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Popover,
  Box,
  Typography,
  Divider,
  Avatar,
  Stack,
  Button,
} from "@mui/material";
import { FaBell } from "react-icons/fa"; // Use react-icons like other dropdown items
import { io } from "socket.io-client";
import axios from "axios";
import authService from "../../services/Authentication.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const API_URL = "http://localhost:4000";
const SOCKET_URL = "http://localhost:4000";

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const fetchNotifications = async (token: string) => {
    try {
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
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {}
  };

  useEffect(() => {
    const user = authService.getUser();
    const rawToken = authService.getToken();
    const userId = user?._id || user?.id;

    if (!userId || !rawToken) return;

    const token = `Bearer ${rawToken}`;

    fetchNotifications(token);

    const socketInstance = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {});

    socketInstance.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleOpen = (e: React.MouseEvent<SVGElement>) => {
    setAnchorEl(e.currentTarget as unknown as HTMLElement);

    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/notification.wav");
      audioRef.current.load();

      // Play silently to unlock audio context
      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
        })
        .catch(() => {});
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* Use the same structure as other dropdown items */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <FaBell 
          className="dropdown-icon" 
          onClick={handleOpen}
          style={{ cursor: 'pointer', width: '24px', height: '19.2px' }}
        />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              minWidth: '18px'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 380, maxHeight: 500, p: 1 } }}
      >
        <Box px={2} py={1}>
          <Typography fontWeight="bold">Thông báo</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box p={2}>
            <Typography variant="body2">Không có thông báo</Typography>
          </Box>
        ) : (
          notifications.map((noti) => (
            <Box
              key={noti._id}
              component="a"
              href={noti.link || "#"}
              target="_blank"
              rel="noreferrer"
              sx={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                backgroundColor: noti.isRead ? "#fff" : "#e3f2fd",
                px: 2,
                py: 1.5,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
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
                    {noti.title} • {dayjs(noti.createdAt).fromNow()}
                  </Typography>
                  <Typography variant="body2">{noti.content}</Typography>
                </Box>
              </Stack>
            </Box>
          ))
        )}
        <Divider sx={{ my: 1 }} />
        <Box textAlign="center" pb={1}>
          <Button size="small">XEM TẤT CẢ</Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;