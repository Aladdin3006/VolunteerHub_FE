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
import { Task, Volunteer, Department } from "../../apis/staff";

interface TaskCRUDModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    assignedUsers: string[];
    status?: string;
    evaluation?: string;
    staffComment?: string;
  }) => void;
  volunteers: Volunteer[];
  departments?: Record<string, Department[]>;
  task?: Task | null;
  isReviewMode?: boolean;
  selectedUserId?: string | null;
}

const TaskCRUDModal: React.FC<TaskCRUDModalProps> = ({
  open,
  onClose,
  onSubmit,
  volunteers,
  departments = {},
  task,
  isReviewMode = false,
  selectedUserId,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedUsers, setAssignedUsers] = useState<string[]>(
    task?.assignedUsers?.map((au) =>
      typeof au === "string" ? au : au.userId
    ) || []
  );
  const [status, setStatus] = useState<string>("pending");
  const [evaluation, setEvaluation] = useState<string>("");
  const [staffComment, setStaffComment] = useState<string>("");

  useEffect(() => {
    if (task && isReviewMode && selectedUserId) {
      const assignedUser = task.assignedUsers.find(
        (au) => au.userId === selectedUserId
      );
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignedUsers(task.assignedUsers?.map((au) => au.userId) || []);
      setStatus(assignedUser?.review?.status || "pending");
      setEvaluation(assignedUser?.review?.evaluation || "");
      setStaffComment(assignedUser?.review?.staffComment || "");
    } else if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignedUsers(task.assignedUsers?.map((au) => au.userId) || []);
      setStatus("pending");
      setEvaluation("");
      setStaffComment("");
    } else {
      resetForm();
    }
  }, [task, isReviewMode, selectedUserId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedUsers([]);
    setStatus("pending");
    setEvaluation("");
    setStaffComment("");
  };

  const handleSubmit = () => {
    if (isReviewMode) {
      onSubmit({
        title,
        description,
        assignedUsers,
        status,
        evaluation,
        staffComment,
      });
    } else {
      onSubmit({
        title,
        description,
        assignedUsers,
      });
    }
  };

  const handleToggleVolunteer = (userId: string) => {
    setAssignedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isReviewMode ? "Review Task" : task ? "Edit Task" : "Create New Task"}
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          sx={{ input: { color: 'black' } }}
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
                      const deptNames =
                        deptList.map((dept) => dept.name).join(", ") || "N/A";
                      return (
                        <TableRow key={volunteer.user._id}>
                          <TableCell>{volunteer.user.fullName}</TableCell>
                          <TableCell>{deptNames}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={assignedUsers.includes(
                                volunteer.user._id
                              )}
                              onChange={() =>
                                handleToggleVolunteer(volunteer.user._id)
                              }
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

        {isReviewMode && task && selectedUserId && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Assigned Volunteers
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {task.assignedUsers?.map((au) => (
                <Chip
                  key={au.userId}
                  label={
                    volunteers.find((v) => v.user._id === au.userId)?.user
                      .fullName || "Unknown Volunteer"
                  }
                />
              ))}
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Submission
            </Typography>
            <Box sx={{ mt: 1 }}>
              {(() => {
                const submission = task.assignedUsers.find(
                  (au) => au.userId === selectedUserId
                )?.submission;
                if (!submission) {
                  return (
                    <Typography variant="body2">
                      No submission available
                    </Typography>
                  );
                }
                return (
                  <>
                    <Typography variant="body2">
                      Content: {submission.content || "No content"}
                    </Typography>
                    <Typography variant="body2">
                      Submitted At:{" "}
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleString()
                        : "Not submitted"}
                    </Typography>
                    {submission.images?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">Images:</Typography>
                        {submission.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Submission ${index}`}
                            style={{ maxWidth: "100px", margin: "5px" }}
                          />
                        ))}
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel
                id="evaluation-label"
                sx={{
                  top: "50%", ml: 2,
                  transform: "translateY(-50%) scale(1)",
                  "&.MuiInputLabel-shrink": {
                    top: 0,
                    transform: "translateY(-100%) scale(0.75)", // floating style
                  },
                }}
              >
                Evaluation
              </InputLabel>
              <Select
                labelId="evaluation-label"
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
                label="Evaluation"
                fullWidth
              >
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="average">Average</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Comment for task"
              value={staffComment}
              onChange={(e) => setStaffComment(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" size="small">
          {isReviewMode ? "Submit Review" : task ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskCRUDModal;
