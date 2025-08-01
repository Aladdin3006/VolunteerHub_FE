import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Fab,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { keyframes } from "@emotion/react";
import { StormAPI, Storm } from "../../apis/storm.api";
import socket from "../../services/socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import ReliefPointMapLeaflet from './ReliefPointMapLeaflet';

dayjs.extend(relativeTime);
dayjs.extend(duration);

// 🌪️ Nhấp nháy đỏ cảnh báo
const pulseEmergency = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
`;

// 🔥 Rung nhẹ kiểu động đất
const shakeSlight = keyframes`
  0% { transform: translate(0px, 0px); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(3px, -1px); }
  60% { transform: translate(-1px, 2px); }
  80% { transform: translate(2px, -1px); }
  100% { transform: translate(0px, 0px); }
`;

const StormInfoModal: React.FC = () => {
    const [storm, setStorm] = useState<Storm | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState<string>("");
    const [isEmergency, setIsEmergency] = useState(false); // 🚨 animation chỉ 5s

    const fetchStorm = async () => {
        setLoading(true);
        try {
            const data = await StormAPI.getActiveStorm();
            if (data) {
                setStorm(data);
                setOpen(true);
                setIsEmergency(true);
                setTimeout(() => setIsEmergency(false), 5000);
            }
        } catch (err) {
            console.error("Không thể tải storm", err);
        } finally {
            setLoading(false);
        }
    };

    // ⏳ Đếm ngược đến thời gian bắt đầu bão
    useEffect(() => {
        if (!storm?.startDate) return;

        const interval = setInterval(() => {
            const now = dayjs();
            const start = dayjs(storm.startDate);
            const diff = start.diff(now);

            if (diff <= 0) {
                setCountdown("⛈️ Bão đã đến!");
                clearInterval(interval);
            } else {
                const duration = dayjs.duration(diff);
                setCountdown(
                    `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [storm?.startDate]);

    // 🎧 Nghe socket
    useEffect(() => {
        fetchStorm();

        socket.on("storm-activated", (data: Storm) => {
            setStorm(data);
            setOpen(true);
            setIsEmergency(true);
            setTimeout(() => setIsEmergency(false), 5000);
        });

        socket.on("storm-deactivated", () => {
            setStorm(null);
            setOpen(false);
        });

        return () => {
            socket.off("storm-activated");
            socket.off("storm-deactivated");
        };
    }, []);

    if (loading || !storm) return null;

    return (
        <>
            {/* 🌪️ Modal thông tin bão */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        ...(isEmergency && {
                            animation: `${pulseEmergency} 2s infinite, ${shakeSlight} 1.5s infinite`,
                            border: "2px solid #f44336",
                            bgcolor: "#fff3f3",
                        }),
                    },
                }}
            >
                <DialogTitle>🔥 {storm.name} — Thông tin khẩn cấp</DialogTitle>

                <DialogContent>
                    <Box sx={{ mb: 1 }}>
                        <Typography color="text.secondary">
                            {storm.description || "Không có mô tả"}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography fontWeight="bold" color="error">
                            🕒 Dự kiến bão đến trong: {countdown}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />
                    <ReliefPointMapLeaflet
                        stormId={storm._id}
                        centerLocation={storm.centerLocation}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* 🔴 Nút nổi để mở lại modal */}
            {storm && !open && (
                <Tooltip title={`Xem thông tin ${storm.name}`} arrow>
                    <Fab
                        onClick={() => setOpen(true)}
                        sx={{
                            position: "fixed",
                            top: 24,
                            right: 24,
                            bgcolor: "#f44336",
                            color: "#fff",
                            animation: `${pulseEmergency} 2s infinite`,
                            zIndex: 1300,
                        }}
                    >
                        <WarningAmberIcon />
                    </Fab>
                </Tooltip>
            )}
        </>
    );
};

export default StormInfoModal;
