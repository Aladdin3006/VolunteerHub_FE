import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid
} from "@mui/material";

interface RescueProof {
  images: string[];
  note?: string;
  uploadedAt?: string;
}

interface RescueEntry {
  rescuedAt?: string;
  rescueNote?: string;
  rescueProofs?: RescueProof[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  pointId: string | null;
  apiBase: string;
}

const RescueHistoryDialog: React.FC<Props> = ({ open, onClose, pointId, apiBase }) => {
  const [rescueList, setRescueList] = useState<RescueEntry[]>([]);

  useEffect(() => {
    if (!pointId) return;
    fetch(`${apiBase}/relief-point/${pointId}`)
      .then((res) => res.json())
      .then((data) => setRescueList(data?.rescueList || []))
      .catch(console.error);
  }, [pointId, apiBase]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Lịch sử cứu trợ</DialogTitle>
      <DialogContent dividers>
        {rescueList.length === 0 && (
          <Typography>Chưa có lượt cứu trợ nào.</Typography>
        )}
        {rescueList.map((r, idx) => (
          <Box key={idx} mb={2} p={1} border="1px solid #ddd" borderRadius={2}>
            <Typography fontWeight={600}>
              Lần {idx + 1} – {r.rescuedAt ? new Date(r.rescuedAt).toLocaleString() : ""}
            </Typography>
            <Typography>📝 {r.rescueNote || "Không có ghi chú"}</Typography>
            {r.rescueProofs && r.rescueProofs.length > 0 && (
              <Grid container spacing={1} mt={1}>
                {r.rescueProofs.flatMap((p) => p.images).map((url, i) => (
                  <Grid item xs={4} key={i}>
                    <img
                      src={url}
                      alt="proof"
                      style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescueHistoryDialog;
