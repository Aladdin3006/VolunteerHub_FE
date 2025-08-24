import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Assignment,
  RateReview,
  Edit,
  Delete,
} from "@mui/icons-material";
import {
  Task,
  getTasksByPhaseDayId,
  createTask,
  updateTask,
  deleteTask,
  assignTaskToUsers,
  Phase,
  getPhasesByCampaignId,
  PhaseDay,
  staffReviewTask,
  getCampaignVolunteers,
  Volunteer,
  Department,
  getDepartmentsByVolunteerId,
} from "../../apis/staff";
import TaskCRUDModal from "./TaskCRUDModal";

interface ManageTaskProps {
  campaignId: string;
}

const ManageTask: React.FC<ManageTaskProps> = ({ campaignId }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [phaseDays, setPhaseDays] = useState<PhaseDay[]>([]);
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<PhaseDay | null>(
    null
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [campaignVolunteers, setCampaignVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [departments, setDepartments] = useState<Record<string, Department[]>>(
    {}
  );

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        setLoading(true);
        const data = await getPhasesByCampaignId(campaignId);
        setPhases(data);
      } catch (error) {
        console.error("Error fetching phases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhases();
  }, [campaignId]);

  useEffect(() => {
    const fetchCampaignVolunteers = async () => {
      try {
        const volunteers = await getCampaignVolunteers(campaignId);
        setCampaignVolunteers(volunteers);

        // Fetch departments for all campaign volunteers
        const departmentsMap: Record<string, Department[]> = {};
        await Promise.all(
          volunteers.map(async (volunteer) => {
            const deptData = await getDepartmentsByVolunteerId(
              volunteer.user._id,
              campaignId
            );
            departmentsMap[volunteer.user._id] = deptData;
          })
        );
        setDepartments(departmentsMap);
      } catch (error) {
        console.error("Error fetching campaign volunteers:", error);
      }
    };
    fetchCampaignVolunteers();
  }, [campaignId]);

  useEffect(() => {
    if (selectedPhase) {
      setPhaseDays(selectedPhase.phaseDays);
      setSelectedPhaseDay(null);
    }
  }, [selectedPhase]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedPhaseDay) {
        try {
          setLoading(true);
          const tasksData = await getTasksByPhaseDayId(selectedPhaseDay._id);
          setTasks(tasksData);

          // Use campaignVolunteers directly instead of mapping
          if (campaignVolunteers.length > 0) {
            setVolunteers(campaignVolunteers.map((v) => v.user));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [selectedPhaseDay, campaignVolunteers]);

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    leaderId: string;
    assignedUsers: string[];
  }) => {
    if (!selectedPhaseDay) {
      setSnackbarMessage("No phase day selected");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setTaskLoading(true);
      const newTask = await createTask(selectedPhaseDay._id, {
        title: taskData.title,
        description: taskData.description,
        leaderId: taskData.leaderId,
        assignedUsers: taskData.assignedUsers || [],
        phaseDayDate: selectedPhaseDay.date,
      });

      // Refresh both tasks and volunteers
      const updatedTasks = await getTasksByPhaseDayId(selectedPhaseDay._id);
      setTasks(updatedTasks);

      // Refresh campaign volunteers to ensure data is up to date
      const refreshedVolunteers = await getCampaignVolunteers(campaignId);
      setCampaignVolunteers(refreshedVolunteers);
      setVolunteers(refreshedVolunteers.map((v) => v.user));

      setTaskModalOpen(false);
      setSnackbarMessage("Task created successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error creating task:", error);
      setSnackbarMessage("Failed to create task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleUpdateTask = async (
    taskId: string,
    taskData: {
      title: string;
      description: string;
      leaderId: string;
      assignedUsers: string[];
    }
  ) => {
    try {
      setTaskLoading(true);
      const updatedTask = await updateTask(taskId, {
        title: taskData.title,
        description: taskData.description,
        leaderId: taskData.leaderId,
        assignedUsers: taskData.assignedUsers,
        phaseDayDate: selectedPhaseDay?.date,
      });

      const updatedTasks = await getTasksByPhaseDayId(
        selectedPhaseDay?._id || ""
      );
      setTasks(updatedTasks);
      setTaskModalOpen(false);
      setSnackbarMessage("Task updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating task:", error);
      setSnackbarMessage("Failed to update task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setTaskLoading(false); // Set loading to false
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      const updatedTasks = await getTasksByPhaseDayId(
        selectedPhaseDay?._id || ""
      );
      setTasks(updatedTasks);
      setSnackbarMessage("Task deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting task:", error);
      setSnackbarMessage("Failed to delete task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAssignTask = async (taskId: string, assignedUsers: string[]) => {
    try {
      await assignTaskToUsers(taskId, assignedUsers);
      const updatedTasks = await getTasksByPhaseDayId(
        selectedPhaseDay?._id || ""
      );
      setTasks(updatedTasks);
      setTaskModalOpen(false);
      setSnackbarMessage("Volunteers assigned successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error assigning task:", error);
      setSnackbarMessage("Failed to assign volunteers");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleStaffReviewTask = async (
    taskId: string,
    staffId: string,
    finalScore: number,
    comment: string
  ) => {
    try {
      await staffReviewTask(taskId, staffId, finalScore, comment);
      const updatedTasks = await getTasksByPhaseDayId(
        selectedPhaseDay?._id || ""
      );
      setTasks(updatedTasks);
      setReviewModalOpen(false);
      setSelectedUserId(null);
      setSnackbarMessage("Task reviewed successfully by staff!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error reviewing task:", error);
      setSnackbarMessage("Failed to review task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const goBackToPhases = () => {
    setSelectedPhase(null);
    setSelectedPhaseDay(null);
  };

  const goBackToPhaseDays = () => {
    setSelectedPhaseDay(null);
  };

  if (!selectedPhase) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select Phase
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Paper sx={{ p: 2 }}>
            <List>
              {phases.map((phase) => (
                <ListItem key={phase._id} divider>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" noWrap>
                        {phase.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 300 }} // adjust width as needed
                      >
                        {phase.description}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectedPhase(phase)}
                    >
                      Select
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {phases.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No phases available for this campaign.
                </Alert>
              )}
            </List>
          </Paper>
        )}
      </Box>
    );
  }

  if (!selectedPhaseDay) {
    return (
      <Box sx={{ p: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" onClick={goBackToPhases}>
            Phases
          </Link>
          <Typography>{selectedPhase.name}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={goBackToPhases} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">Select Phase Day</Typography>
        </Box>
        <Paper sx={{ p: 2 }}>
          <List>
            {phaseDays.map((day) => (
              <ListItem key={day._id} divider>
                <ListItemText
                  primary={
                    <Typography fontWeight="bold">
                      {new Date(day.date).toLocaleDateString()}
                    </Typography>
                  }
                  secondary={day.checkinLocation?.address}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSelectedPhaseDay(day)}
                  >
                    Select
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {phaseDays.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No phase days available for this phase.
              </Alert>
            )}
          </List>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={goBackToPhases}>
          Phases
        </Link>
        <Link component="button" onClick={goBackToPhaseDays}>
          {selectedPhase.name}
        </Link>
        <Typography>
          {new Date(selectedPhaseDay.date).toLocaleDateString()}
        </Typography>
      </Breadcrumbs>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={goBackToPhaseDays} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">
          Task Management:{" "}
          {new Date(selectedPhaseDay.date).toLocaleDateString()}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() => {
            setSelectedTask(null);
            setTaskModalOpen(true);
          }}
          sx={{
            px: 1.5,
            py: 0.5,
            minWidth: "unset",
            fontSize: "0.75rem",
          }}
        >
          Create Task
        </Button>
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn chắc chắn muốn xóa công việc này chứ? Hành động này không thể
              hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (taskToDelete) {
                  handleDeleteTask(taskToDelete);
                  setDeleteConfirmOpen(false);
                  setTaskToDelete(null);
                }
              }}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 2 }}>
          <TaskList
            tasks={tasks}
            volunteers={volunteers}
            onAssign={(task) => {
              setSelectedTask(task);
              setTaskModalOpen(true);
            }}
            onReview={(task, userId) => {
              setSelectedTask(task);
              setSelectedUserId(userId);
              setReviewModalOpen(true);
            }}
            onUpdate={(task) => {
              setSelectedTask(task);
              setTaskModalOpen(true);
            }}
            onDelete={(taskId) => {
              setTaskToDelete(taskId);
              setDeleteConfirmOpen(true);
            }}
          />
          {(!tasks || tasks.length === 0) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Không có nhiệm vụ nào cho ngày giai đoạn này.
            </Alert>
          )}
        </Paper>
      )}
      <TaskCRUDModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(taskData) => {
          if (selectedTask) {
            if (taskData.assignedUsers) {
              handleUpdateTask(selectedTask._id, {
                title: taskData.title,
                description: taskData.description,
                leaderId: taskData.leaderId ?? "",
                assignedUsers: taskData.assignedUsers ?? [],
              });
            }
          } else {
            handleCreateTask({
              title: taskData.title,
              description: taskData.description,
              leaderId: taskData.leaderId ?? "",
              assignedUsers: taskData.assignedUsers ?? [],
            });
          }
        }}
        volunteers={campaignVolunteers.map((v) => ({
          _id: v.user._id,
          fullName: v.user.fullName,
          email: v.user.email,
          phone: v.user.phone,
          avatar: v.user.avatar,
          skills: v.user.skills,
          status: v.status,
        }))}
        departments={departments}
        task={selectedTask}
        loading={taskLoading}
      />

      <TaskCRUDModal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedUserId(null);
        }}
        onSubmit={(taskData) => {
          if (
            selectedTask &&
            selectedUserId &&
            taskData.score &&
            taskData.comment
          ) {
            handleStaffReviewTask(
              selectedTask._id,
              JSON.parse(localStorage.getItem("user") || "{}").id,
              taskData.score,
              taskData.comment
            );
          }
        }}
        volunteers={volunteers}
        departments={{}}
        task={selectedTask}
        isReviewMode={true}
        selectedUserId={selectedUserId}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

interface TaskListProps {
  tasks: Task[];
  volunteers: any[];
  onAssign?: (task: Task) => void;
  onReview?: (task: Task, userId: string) => void;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  volunteers,
  onReview,
  onUpdate,
  onDelete,
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <Typography
        variant="body1"
        sx={{ p: 2, textAlign: "center", color: "#666" }}
      >
        Không có nhiệm vụ nào
      </Typography>
    );
  }

  return (
    <List>
      {tasks.map((task, index) => (
        <ListItem
          key={task?._id || `task-${index}`}
          divider
          sx={{
            "&:hover": { backgroundColor: "action.hover" },
            display: "flex",
            alignItems: "center",
            minHeight: "80px",
            borderRadius: 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            transition: "all 0.3s ease",
          }}
        >
          <ListItemText
            primary={
              <Typography fontWeight="bold" color="#333">
                {task.title}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="#666">
                  {task.description}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  {task.leaderId && (
                    <>
                      <Box
                        component="img"
                        src={
                          volunteers.find((v) => v._id === task.leaderId)
                            ?.avatar || "/default-avatar.jpg" // Add fallback
                        }
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/default-avatar.jpg";
                        }}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          mr: 1,
                        }}
                      />
                      <Typography variant="caption" color="#999">
                        Leader:{" "}
                        {volunteers.find((v) => v._id === task.leaderId)
                          ?.fullName || "Unknown"}
                      </Typography>
                    </>
                  )}
                </Box>
              </>
            }
            sx={{
              flex: 2,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              mr: 2,
              padding: 1,
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              flex: 0,
              alignItems: "center",
              height: "100%",
              padding: 1,
            }}
          >
            {onUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit />}
                onClick={() => onUpdate(task)}
                sx={{
                  padding: "6px 12px",
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                }}
              >
                Update
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Delete />}
                onClick={() => onDelete(task._id)}
                sx={{
                  padding: "6px 12px",
                  borderColor: "#d32f2f",
                  color: "#d32f2f",
                  "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
                }}
              >
                Delete
              </Button>
            )}
          </Box>
          <Box
            sx={{ flex: 1, minWidth: 200, maxWidth: 250, ml: 2, padding: 1 }}
          >
            {task.assignedUsers && task.assignedUsers.length > 0 ? (
              <>
                <Typography variant="subtitle2" color="#333" fontWeight="bold">
                  Volunteers ({task.assignedUsers.length})
                </Typography>
                <TableContainer
                  sx={{ mt: 1, borderRadius: 4, overflow: "hidden" }}
                >
                  <Table>
                    <TableBody>
                      {task.assignedUsers.map((au) => {
                        const volunteer = volunteers.find(
                          (v) => v._id === au.userId._id
                        );
                        return (
                          <TableRow
                            key={au.userId._id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.04)",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                padding: "8px",
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                component="img"
                                src={volunteer?.avatar || "/default-avatar.jpg"}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/default-avatar.jpg";
                                }}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  mr: 1,
                                }}
                              />
                              {volunteer?.fullName || "Unknown"}
                            </TableCell>
                            <TableCell
                              sx={{
                                padding: "8px",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              {onReview && task.leaderId === au.userId._id && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<RateReview />}
                                  onClick={() => onReview(task, au.userId._id)}
                                  sx={{
                                    padding: "4px 8px",
                                    backgroundColor: "#1976d2",
                                    "&:hover": { backgroundColor: "#1565c0" },
                                    "&:disabled": {
                                      backgroundColor: "#ccc",
                                      color: "#fff",
                                    },
                                  }}
                                  disabled={
                                    (task.status !== "submitted" &&
                                      task.status !== "completed") ||
                                    !task.submission
                                  }
                                >
                                  Review
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography variant="caption" color="#999">
                No volunteers assigned
              </Typography>
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ManageTask;
