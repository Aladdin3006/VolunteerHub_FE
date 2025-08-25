import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Typography,
  Box,
} from "@mui/material";
import { fetchTasksByVolunteer } from "../../apis/task";

interface Task {
  _id: string;
  title: string;
  description: string;
  campaignName: string;
  status: string;
}

interface OpenTaskModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  volunteerId: string;
  volunteerName: string;
}

const OpenTaskModal: React.FC<OpenTaskModalProps> = ({
  open,
  onClose,
  onConfirm,
  volunteerId,
  volunteerName,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    const fetchVolunteerTasks = async () => {
      if (!volunteerId || !open) return;
      try {
        setLoading(true);
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
        const response = await fetchTasksByVolunteer(
          volunteerId,
          year,
          month,
          token
        );
        // Check if response.data is an array and handle it
        const taskData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        const inProgressTasks = taskData.filter(
          (task: Task) => task.status === "in_progress"
        );
        setTasks(inProgressTasks);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tasks. Please try again.");
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchVolunteerTasks();
    }
  }, [volunteerId, open, token]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Danh sách nhiệm vụ chưa hoàn thành của {volunteerName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: "100%" }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
              {tasks.length === 0 ? (
                <Alert severity="info">
                  Không còn nhiệm vụ chưa hoàn thành nào.
                </Alert>
              ) : (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Active Tasks
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tiêu đề</TableCell>
                          <TableCell>Mô tả</TableCell>
                          <TableCell>Chiến dịch</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tasks.map((task) => (
                          <TableRow key={task._id}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.description}</TableCell>
                            <TableCell>{task.campaignName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          color="success"
          variant="contained"
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenTaskModal;
