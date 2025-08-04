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
  Paper,
} from "@mui/material";
import { Task } from "../../apis/staff";

interface Volunteer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  skills?: string[];
}

interface Department {
  _id: string;
  name: string;
  description?: string;
}

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
    task?.assignedUsers?.map((au) => au.userId._id) || []
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
      setAssignedUsers(task.assignedUsers?.map((au) => au.userId._id) || []);
      setScore(peerReview?.score || null);
      setComment(peerReview?.comment || "");
    } else if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setLeaderId(task.leaderId || "");
      setAssignedUsers(task.assignedUsers?.map((au) => au.userId._id) || []);
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          maxWidth: "800px",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 2,
          px: 3,
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isReviewMode ? "Review Task" : task ? "Edit Task" : "Create New Task"}
      </DialogTitle>
      <DialogContent sx={{ p: 3, bgcolor: "#f9fafb" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Task Details
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              disabled={isReviewMode}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-input": {
                    color: "black",
                    "&:disabled": {
                      color: "black",
                      WebkitTextFillColor: "black",
                    },
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "black",
                  "&.Mui-disabled": {
                    color: "black",
                  },
                },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-input": {
                    color: "black",
                    "&:disabled": {
                      color: "black",
                      WebkitTextFillColor: "black",
                    },
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "black",
                  "&.Mui-disabled": {
                    color: "black",
                  },
                },
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel
                sx={{
                  color: "black",
                  "&.Mui-disabled": {
                    color: "black",
                  },
                }}
              >
                Task Leader
              </InputLabel>
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
                sx={{
                  borderRadius: 1,
                  backgroundColor: "white",
                  "& .MuiSelect-select": {
                    color: "black",
                    "&:disabled": {
                      color: "black !important",
                      WebkitTextFillColor: "black !important",
                    },
                  },
                  "& .MuiSvgIcon-root": {
                    color: "black",
                    "&.Mui-disabled": {
                      color: "black",
                    },
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        color: "black",
                        "&.Mui-selected": {
                          backgroundColor: "rgba(0, 0, 0, 0.08)",
                        },
                      },
                    },
                  },
                }}
              >
                {volunteers.map((volunteer) => (
                  <MenuItem
                    key={volunteer._id}
                    value={volunteer._id}
                    sx={{
                      color: "black",
                      "&.Mui-disabled": {
                        color: "black",
                        opacity: 1,
                      },
                    }}
                  >
                    {volunteer.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {!isReviewMode && (
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Assign Volunteers
              </Typography>
              <TableContainer sx={{ maxHeight: 300, borderRadius: 1 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ bgcolor: "#f1f5f9", fontWeight: "bold" }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{ bgcolor: "#f1f5f9", fontWeight: "bold" }}
                      >
                        Department
                      </TableCell>
                      <TableCell
                        sx={{ bgcolor: "#f1f5f9", fontWeight: "bold" }}
                      >
                        Select
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers.map((volunteer) => {
                      const deptList = departments[volunteer._id] || [];
                      const deptNames =
                        deptList.map((dept) => dept.name).join(", ") || "N/A";
                      return (
                        <TableRow
                          key={volunteer._id}
                          sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}
                        >
                          <TableCell>{volunteer.fullName}</TableCell>
                          <TableCell>{deptNames}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={assignedUsers.includes(volunteer._id)}
                              onChange={() =>
                                handleToggleVolunteer(volunteer._id)
                              }
                              disabled={volunteer._id === leaderId}
                              sx={{ color: "primary.main" }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {isReviewMode && task && selectedUserId && (
            <>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Submission Details
                </Typography>
                {task.submission ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body2">
                      <strong>Content:</strong>{" "}
                      {task.submission.content || "No content"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Submitted At:</strong>{" "}
                      {task.submission.submittedAt
                        ? new Date(task.submission.submittedAt).toLocaleString()
                        : "Not submitted"}
                    </Typography>
                    <Typography variant="body2">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <strong>Submitted By:</strong>
                        <Box
                          component="img"
                          src={
                            volunteers.find(
                              (v) => v._id === task.submission?.submittedBy
                            )?.avatar || "/default-avatar.png"
                          }
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            mx: 1,
                          }}
                        />
                        {volunteers.find(
                          (v) => v._id === task.submission?.submittedBy
                        )?.fullName || "Unknown"}
                      </Box>
                    </Typography>
                    {task.submission.images?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Images:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          {task.submission.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Submission ${index}`}
                              style={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 4,
                                border: "1px solid #e5e7eb",
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2">
                    No submission available
                  </Typography>
                )}
              </Paper>

              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Assigned Volunteers
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {task.assignedUsers?.map((au) => {
                    const volunteer = volunteers.find(
                      (v) => v._id === au.userId._id
                    );
                    return (
                      <Chip
                        key={au.userId._id}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              component="img"
                              src={volunteer?.avatar || "/default-avatar.png"}
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                              }}
                            />
                            {volunteer?.fullName || "Unknown Volunteer"}
                          </Box>
                        }
                        sx={{
                          bgcolor: "primary.light",
                          color: "white",
                          borderRadius: 1,
                          "& .MuiChip-label": {
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "4px",
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Paper>

              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Peer Reviews
                </Typography>
                {task.assignedUsers?.length > 0 ? (
                  task.assignedUsers.map((au) => {
                    const reviews =
                      task.peerReviews?.filter(
                        (pr) => pr.reviewee.toString() === au.userId._id
                      ) || [];
                    const avgScore =
                      reviews.length > 0
                        ? (
                            reviews.reduce((sum, pr) => sum + pr.score, 0) /
                            reviews.length
                          ).toFixed(1)
                        : "N/A";
                    return (
                      <Box key={au.userId._id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              component="img"
                              src={
                                volunteers.find((v) => v._id === au.userId._id)
                                  ?.avatar || "/default-avatar.png"
                              }
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            {au.userId.fullName || "Unknown Volunteer"}
                          </Box>
                        </Typography>
                        {reviews.length > 0 ? (
                          <>
                            <TableContainer sx={{ mt: 1, borderRadius: 1 }}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                      Reviewer
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                      Score
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                      Comment
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                      Reviewed At
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {reviews.map((pr, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <Box
                                            component="img"
                                            src={
                                              volunteers.find(
                                                (v) => v._id === pr.reviewer
                                              )?.avatar || "/default-avatar.png"
                                            }
                                            sx={{
                                              width: 24,
                                              height: 24,
                                              borderRadius: "50%",
                                              objectFit: "cover",
                                            }}
                                          />
                                          {volunteers.find(
                                            (v) => v._id === pr.reviewer
                                          )?.fullName || "Unknown"}
                                        </Box>
                                      </TableCell>
                                      <TableCell>{pr.score}</TableCell>
                                      <TableCell>
                                        {pr.comment || "No comment"}
                                      </TableCell>
                                      <TableCell>
                                        {pr.reviewedAt
                                          ? new Date(
                                              pr.reviewedAt
                                            ).toLocaleString()
                                          : "N/A"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Average Score: {avgScore}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2">
                            No reviews for this volunteer
                          </Typography>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2">
                    No assigned volunteers
                  </Typography>
                )}
              </Paper>

              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Your Review
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="body2" mb={1}>
                      Rating
                    </Typography>
                    <Rating
                      name="score"
                      value={score}
                      onChange={(event, newValue) => setScore(newValue)}
                      precision={0.5}
                      size="large"
                      sx={{ color: "primary.main" }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    multiline
                    rows={4}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        backgroundColor: "white",
                      },
                    }}
                  />
                </Box>
              </Paper>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: "#f9fafb" }}>
        <Button
          onClick={onClose}
          size="large"
          sx={{
            borderRadius: 1,
            px: 3,
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          sx={{
            borderRadius: 1,
            px: 3,
            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          {isReviewMode ? "Submit Review" : task ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskCRUDModal;
