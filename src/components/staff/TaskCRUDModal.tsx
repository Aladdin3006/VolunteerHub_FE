import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Task, Volunteer, Department, getDepartmentsByVolunteerId } from "../../apis/staff";

interface TaskCRUDModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    assignedUsers: string[];
    evaluation?: string;
    feedback?: string;
  }) => void;
  volunteers: Volunteer[];
  departments?: Record<string, Department[]>; // Optional departments prop
  task?: Task | null;
  isReviewMode?: boolean;
}

const TaskCRUDModal: React.FC<TaskCRUDModalProps> = ({
  open,
  onClose,
  onSubmit,
  volunteers,
  departments = {}, // Default to empty object if not provided
  task,
  isReviewMode = false,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedUsers, setAssignedUsers] = useState<string[]>(task?.assignedUsers || []);
  const [evaluation, setEvaluation] = useState<string>(task?.status?.evaluation || "");
  const [feedback, setFeedback] = useState<string>(task?.status?.feedback || "");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignedUsers(task.assignedUsers || []);
      setEvaluation(task.status?.evaluation || "");
      setFeedback(task.status?.feedback || "");
    } else {
      resetForm();
    }
  }, [task]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedUsers([]);
    setEvaluation("");
    setFeedback("");
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      assignedUsers,
      evaluation: isReviewMode ? evaluation : undefined,
      feedback: isReviewMode ? feedback : undefined,
    });
  };

  const handleToggleVolunteer = (userId: string) => {
    setAssignedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isReviewMode ? "Review Task" : task ? "Edit Task" : "Create New Task"}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          disabled={isReviewMode}
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          disabled={isReviewMode}
        />

        {!isReviewMode && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Assign Volunteers
            </Typography>
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Select</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteers
                    .filter((v) => v.status === "approved")
                    .map((volunteer) => {
                      const deptList = departments[volunteer.user._id] || [];
                      const deptNames = deptList.map((dept) => dept.name).join(", ") || "N/A";
                      return (
                        <TableRow key={volunteer.user._id}>
                          <TableCell>{volunteer.user.fullName}</TableCell>
                          <TableCell>{deptNames}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={assignedUsers.includes(volunteer.user._id)}
                              onChange={() => handleToggleVolunteer(volunteer.user._id)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {isReviewMode && task && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Assigned Volunteers
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {task.assignedUsers?.map((userId) => (
                <Chip
                  key={userId}
                  label={volunteers.find((v) => v.user._id === userId)?.user.fullName || "Unknown Volunteer"}
                />
              ))}
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Evaluation</InputLabel>
              <Select
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
                label="Evaluation"
              >
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="average">Average</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isReviewMode ? "Submit Review" : task ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskCRUDModal;