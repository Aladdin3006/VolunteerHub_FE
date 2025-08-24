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
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { StormAPI, Storm } from "../../apis/storm.api";
import socket from "../../services/socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import ReliefPointMapLeaflet from "./ReliefPointMapLeaflet";
import EmergencyButton from "../Header/EmergencyButton";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const pulseEmergency = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
`;

const shakeSlight = keyframes`
  0% { transform: translate(0px, 0px); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(3px, -1px); }
  60% { transform: translate(-1px, 2px); }
  80% { transform: translate(2px, -1px); }
  100% { transform: translate(0px, 0px); }
`;

interface StormInfoModalProps {
  open?: boolean;
  onClose?: () => void;
}

const StormInfoModal: React.FC<StormInfoModalProps> = ({
  open: propOpen,
  onClose,
}) => {
  const [storm, setStorm] = useState<Storm | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>("");
  const [isEmergency, setIsEmergency] = useState(false);

  // Determine if component is controlled or uncontrolled
  const isControlled = propOpen !== undefined;
  const open = isControlled ? propOpen : internalOpen;

  const fetchStorm = async () => {
    setLoading(true);
    try {
      const data = await StormAPI.getActiveStorm();
      if (data) {
        setStorm(data);
        if (!isControlled) {
          setInternalOpen(true);
        }
        setIsEmergency(true);
        setTimeout(() => setIsEmergency(false), 5000);
      }
    } catch (err) {
      console.error("Không thể tải storm", err);
    } finally {
      setLoading(false);
    }
  };

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
        const d = dayjs.duration(diff);
        setCountdown(`${d.hours()}h ${d.minutes()}m ${d.seconds()}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [storm?.startDate]);

  useEffect(() => {
    fetchStorm();
    socket.on("storm-activated", (data: Storm) => {
      setStorm(data);
      if (!isControlled) {
        setInternalOpen(true);
      }
      setIsEmergency(true);
      setTimeout(() => setIsEmergency(false), 5000);
    });
    socket.on("storm-deactivated", () => {
      setStorm(null);
      if (!isControlled) {
        setInternalOpen(false);
      }
    });
    return () => {
      socket.off("storm-activated");
      socket.off("storm-deactivated");
    };
  }, []);

  const handleClose = () => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };

  if (loading || !storm) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
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
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {storm && !open && !isControlled && (
        <Box sx={{ zIndex: 1300 }}>
          <EmergencyButton onClick={() => setInternalOpen(true)} />
        </Box>
      )}
    </>
  );
};

export default StormInfoModal;
