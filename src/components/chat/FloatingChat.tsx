import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  TextField,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import FancyChatButton from "./FancyChatButton";
import authService from "@/services/Authentication.service";

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { type: "user" | "bot"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const user = authService.getUser();
  const token = authService.getToken();
  const userId = user?._id || user?.id || null;

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { type: "user", text: message }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          userId,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
    } catch (err) {
      console.error("❌ Lỗi gửi chat:", err);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "🚨 Lỗi kết nối rồi đóa!" },
      ]);
    }

    setLoading(false);
  };

  const toggleChat = () => setOpen(!open);

  const Message = ({
    text,
    type,
  }: {
    text: string;
    type: "user" | "bot";
  }) => (
    <Box
      display="flex"
      justifyContent={type === "user" ? "flex-end" : "flex-start"}
      mb={1}
    >
      <Box
        display="flex"
        alignItems="flex-end"
        flexDirection={type === "user" ? "row-reverse" : "row"}
        maxWidth="75%"
      >
        <Avatar
          sx={{
            bgcolor: type === "user" ? "#1976d2" : "#9c27b0",
            width: 32,
            height: 32,
          }}
        >
          {type === "user" ? "🧑" : "🤖"}
        </Avatar>
        <Paper
          sx={{
            p: 1,
            mx: 1,
            bgcolor: type === "user" ? "#e3f2fd" : "#f3e5f5",
            borderRadius: 3,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Typography variant="body2">{text}</Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <>
      <FancyChatButton onClick={toggleChat} />

      <Box
        sx={{
          display: open ? "flex" : "none",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(50px)",
          transition: "all 0.3s ease-in-out",
          position: "fixed",
          bottom: 90,
          right: 24,
          width: 320,
          maxHeight: "70vh",
          backgroundColor: "#fff",
          flexDirection: "column",
          border: "2px solid",
          borderImageSlice: 1,
          borderImageSource: "linear-gradient(to right, #7b1fa2, #2196f3)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          overflow: "hidden",
          zIndex: 999,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#fafafa",
            borderBottom: "1px solid #eee",
          }}
        >
          <Typography variant="subtitle1">
            Trợ lý ảo VHHT sẵn sàng hỗ trợ
          </Typography>
        </Box>

        {/* Chat messages */}
        <Box
          ref={messagesContainerRef}
          sx={{
            flex: 1,
            p: 1.5,
            overflowY: "auto",
            backgroundColor: "#fffefc",
            scrollBehavior: "smooth",
          }}
        >
          {messages.map((msg, i) => (
            <Message key={i} {...msg} />
          ))}
          {loading && (
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <CircularProgress size={16} />
              <Typography variant="caption">
                Trợ lý ảo đang phản hồi...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Input */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          sx={{
            display: "flex",
            gap: 1,
            p: 1.5,
            bgcolor: "#fafafa",
            borderTop: "1px solid #eee",
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Nhập gì đó..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <IconButton
            onClick={handleSend}
            disabled={loading}
            type="button"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default FloatingChat;