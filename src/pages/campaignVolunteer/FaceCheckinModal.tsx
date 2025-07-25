import React, { useRef } from "react";
import Webcam from "react-webcam";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import axios from "axios";

interface Props {
    open: boolean;
    onClose: () => void;
    campaignId: string;
    phaseId: string;
    phaseDayId: string;
}

export const FaceCheckinModal: React.FC<Props> = ({ open, onClose, campaignId, phaseId, phaseDayId }) => {
    const webcamRef = useRef<Webcam>(null);

    const handleCapture = async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        const user = localStorage.getItem("user");
        const userId = user ? JSON.parse(user).id : null;

        if (!imageSrc || !userId) {
            alert("Không thể lấy ảnh hoặc user");
            return;
        }

        const base64Image = imageSrc.split(',')[1];

        const payload = {
            image: base64Image,
            user_id: userId,
            campaignId,
            phaseId,
            phasedayId: phaseDayId,
            method: "face", // ✅ thêm dòng này
        };

        console.log("Payload gửi checkin:", payload);

        try {
            const res = await axios.post("http://localhost:8000/checkin", payload);
            alert(res.data.status || "✅ Check-in thành công!");
            onClose();
        } catch (err) {
            console.error("❌ Lỗi check-in khuôn mặt:", err);
            alert("❌ Lỗi khi check-in bằng khuôn mặt");
        }
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>📸 Check-in khuôn mặt</DialogTitle>
            <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ width: 480, height: 360 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleCapture} variant="contained" color="primary">
                    Check-in
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FaceCheckinModal;
