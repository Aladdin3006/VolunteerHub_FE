import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
  Box,
} from "@mui/material";

interface Task {
  _id: string;
  title: string;
  description: string;
  campaignName: string;
  status: string;
}

interface OpenTaskCurrentCampaignProps {
  open: boolean;
  onClose: () => void;
  volunteerName: string;
  campaignName: string;
  tasks: Task[];
}

const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case "in_progress":
      return "Đang làm";
    case "submitted":
      return "Đang chờ review";
    default:
      return status;
  }
};

const OpenTaskCurrentCampaign: React.FC<OpenTaskCurrentCampaignProps> = ({
  open,
  onClose,
  volunteerName,
  campaignName,
  tasks,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Không thể cấp chứng chỉ do {volunteerName} còn nhiệm vụ chưa hoàn thành
        trong chiến dịch
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Box sx={{ width: "100%" }}>
            {tasks.length === 0 ? (
              <Alert severity="info">
                Không còn nhiệm vụ chưa hoàn thành nào trong chiến dịch này.
              </Alert>
            ) : (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Nhiệm vụ chưa hoàn thành
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.description}</TableCell>
                          <TableCell>
                            {getStatusDisplayText(task.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenTaskCurrentCampaign;
