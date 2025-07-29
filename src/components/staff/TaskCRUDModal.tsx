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
  Rating,
} from "@mui/material";
import { Task, Volunteer, Department } from "../../apis/staff";

interface TaskCRUDModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    leaderId?: string;
    assignedUsers?: string[];
    score?: number;
    comment?: string;
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
  const [leaderId, setLeaderId] = useState(task?.leaderId || "");
  const [assignedUsers, setAssignedUsers] = useState<string[]>(
    task?.assignedUsers?.map((au) => au.userId) || []
  );
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (task && isReviewMode && selectedUserId) {
      const peerReview = task.peerReviews?.find(
        (pr) => pr.reviewee.toString() === selectedUserId
      );
      setTitle(task.title || "");
      setDescription(task.description || "");
      setLeaderId(task.leaderId || "");
      setAssignedUsers(task.assignedUsers?.map((au) => au.userId) || []);
      setScore(peerReview?.score || null);
      setComment(peerReview?.comment || "");
    } else if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setLeaderId(task.leaderId || "");
      setAssignedUsers(task.assignedUsers?.map((au) => au.userId) || []);
      setScore(null);
      setComment("");
    } else {
      resetForm();
    }
  }, [task, isReviewMode, selectedUserId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLeaderId("");
    setAssignedUsers([]);
    setScore(null);
    setComment("");
  };

  const handleSubmit = () => {
    if (isReviewMode) {
      onSubmit({
        title,
        description,
        leaderId,
        assignedUsers,
        score: score || 0,
        comment,
      });
    } else {
      if (!leaderId) {
        alert("Please select a task leader");
        return;
      }
      onSubmit({
        title,
        description,
        leaderId,
        assignedUsers,
      });
    }
  };

  const handleToggleVolunteer = (userId: string) => {
    if (userId === leaderId) return; // Prevent unselecting leader
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
          sx={{ input: { color: "black" } }}
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
        <FormControl fullWidth margin="normal">
          <InputLabel>Task Leader</InputLabel>
          <Select
            value={leaderId}
            onChange={(e) => {
              const newLeaderId = e.target.value;
              setLeaderId(newLeaderId);
              if (newLeaderId && !assignedUsers.includes(newLeaderId)) {
                setAssignedUsers([...assignedUsers, newLeaderId]);
              }
            }}
            label="Task Leader"
            required
            disabled={isReviewMode}
          >
            {volunteers
              .filter((v) => v.status === "approved")
              .map((volunteer) => (
                <MenuItem key={volunteer.user._id} value={volunteer.user._id}>
                  {volunteer.user.fullName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

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
                              disabled={volunteer.user._id === leaderId}
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

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Peer Review
            </Typography>
            <Rating
              name="score"
              value={score}
              onChange={(event, newValue) => setScore(newValue)}
              precision={1}
              max={5}
            />
            <TextField
              fullWidth
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
