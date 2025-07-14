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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { Task, Volunteer } from "../../apis/staff";

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
  task?: Task | null;
  isReviewMode?: boolean;
}

const TaskCRUDModal: React.FC<TaskCRUDModalProps> = ({
  open,
  onClose,
  onSubmit,
  volunteers,
  task,
  isReviewMode = false,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedUsers, setAssignedUsers] = useState<string[]>(
    task?.assignedUsers || []
  );
  const [evaluation, setEvaluation] = useState<string>(
    task?.status?.evaluation || ""
  );
  const [feedback, setFeedback] = useState<string>(
    task?.status?.feedback || ""
  );

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

  const getDepartmentName = (userId: string) => {
    const volunteer = volunteers.find((v) => v.user?._id === userId);
    if (!volunteer) return "No department assigned";
    return volunteer.departmentId
      ? `Department: ${volunteer.departmentId}`
      : "No department assigned";
  };

  const getVolunteerName = (userId: string) => {
    const volunteer = volunteers.find((v) => v.user?._id === userId);
    return volunteer?.user?.fullName || "Unknown Volunteer";
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Volunteers</InputLabel>
              <Select
                multiple
                value={assignedUsers}
                onChange={(e) => setAssignedUsers(e.target.value as string[])}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((userId) => (
                      <Chip
                        key={userId}
                        label={getVolunteerName(userId)}
                      />
                    ))}
                  </Box>
                )}
              >
                {volunteers
                  .filter((v) => v.status === "approved")
                  .map((volunteer) => (
                    <MenuItem
                      key={volunteer.user?._id || volunteer.id}
                      value={volunteer.user?._id || volunteer.id}
                    >
                      {getVolunteerName(volunteer.user?._id || volunteer.id)} -{" "}
                      {getDepartmentName(volunteer.user?._id || volunteer.id)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
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
                  label={getVolunteerName(userId)}
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