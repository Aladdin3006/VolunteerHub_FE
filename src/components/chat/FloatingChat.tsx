// src/components/FloatingChat.tsx
import React, { useState } from "react";
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
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import FancyChatButton from "./FancyChatButton";
import authService from "@/services/Authentication.service";

const FloatingChat = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ type: "user" | "bot"; text: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const user = authService.getUser();

    const handleSend = async () => {
        if (!message.trim()) return;

        const userId = user?._id || user?.id;
        const accessToken = authService.getToken();

        setMessages((prev) => [...prev, { type: "user", text: message }]);
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`, // 🛡️ Gửi token
                },
                body: JSON.stringify({
                    message,
                    userId: userId || null,
                }),
            });

            console.log("📤 Sending to backend:", { message, userId });

            const data = await res.json();
            setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
        } catch (err) {
            console.error("❌ Lỗi gửi chat:", err);
            setMessages((prev) => [...prev, { type: "bot", text: "🚨 Lỗi kết nối rồi đóa!" }]);
        }

        setLoading(false);
    };



    const toggleChat = () => setOpen(!open);

    const Message = ({ text, type }: { text: string; type: "user" | "bot" }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
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
                    <Avatar sx={{ bgcolor: type === "user" ? "#1976d2" : "#9c27b0", width: 32, height: 32 }}>
                        {type === "user" ? "🧑" : "🤖"}
                    </Avatar>
                    <Paper
                        sx={{
                            p: 1,
                            mx: 1,
                            bgcolor: type === "user" ? "#e3f2fd" : "#f3e5f5",
                            borderRadius: 3,
                        }}
                    >
                        <Typography variant="body2">{text}</Typography>
                    </Paper>
                </Box>
            </Box>
        </motion.div>
    );

    return (
        <>
            {/* Nút mở chat ở góc phải */}
            <FancyChatButton onClick={toggleChat} />

            {/* Khung chat */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box
                            sx={{
                                position: "fixed",
                                bottom: 90,
                                right: 24,
                                width: 320,
                                maxHeight: "70vh",
                                bgcolor: "#fff",
                                borderRadius: 4,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                border: "2px solid",
                                borderImageSlice: 1,
                                borderImageSource: "linear-gradient(to right, #7b1fa2, #2196f3)",
                                boxShadow: 12,
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ p: 1.5, bgcolor: "#fafafa", borderBottom: "1px solid #eee" }}>
                                <Typography variant="subtitle1">
                                    Trợ lý ảo VHHT sẵn sàng hỗ trợ
                                </Typography>
                            </Box>

                            {/* Nội dung chat */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1.5,
                                    overflowY: "auto",
                                    backgroundColor: "#fffefc",
                                    zIndex: 999
                                }}
                            >
                                {messages.map((msg, i) => (
                                    <Message key={i} {...msg} />
                                ))}
                                {loading && (
                                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                                        <CircularProgress size={16} />
                                        <Typography variant="caption">Trợ lý ảo đang phản hồi...</Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Ô nhập */}
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
                                <IconButton onClick={handleSend} disabled={loading}>
                                    <SendIcon />
                                </IconButton>
                            </Box>

                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingChat;
