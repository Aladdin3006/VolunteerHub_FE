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
  TableRow,
  TableContainer,
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
  Volunteer,
  getCampaignVolunteers,
  Task,
  getTasksByPhaseDayId,
  createTask,
  updateTask,
  deleteTask,
  assignTaskToUsers,
  Phase,
  getPhasesByCampaignId,
  PhaseDay,
  Department,
  getDepartmentsByVolunteerId,
  reviewPeerTask,
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
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [departments, setDepartments] = useState<Record<string, Department[]>>(
    {}
  );
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
          const [tasksData, volunteersData] = await Promise.all([
            getTasksByPhaseDayId(selectedPhaseDay._id),
            getCampaignVolunteers(campaignId),
          ]);
          setTasks(tasksData);
          setVolunteers(volunteersData);

          const departmentsMap: Record<string, Department[]> = {};
          await Promise.all(
            volunteersData.map(async (volunteer) => {
              const deptData = await getDepartmentsByVolunteerId(
                volunteer.user._id,
                campaignId
              );
              departmentsMap[volunteer.user._id] = deptData;
            })
          );
          setDepartments(departmentsMap);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [selectedPhaseDay, campaignId]);

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
      const newTask = await createTask(selectedPhaseDay._id, {
        title: taskData.title,
        description: taskData.description,
        leaderId: taskData.leaderId,
        assignedUsers: taskData.assignedUsers || [],
        phaseDayDate: selectedPhaseDay.date,
      });

      const updatedTasks = await getTasksByPhaseDayId(selectedPhaseDay._id);
      setTasks(updatedTasks);
      setTaskModalOpen(false);
      setSnackbarMessage("Task created successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error creating task:", error);
      setSnackbarMessage("Failed to create task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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

  const handlePeerReviewTask = async (
    taskId: string,
    reviewerId: string,
    revieweeId: string,
    score: number,
    comment: string
  ) => {
    try {
      await reviewPeerTask(taskId, reviewerId, revieweeId, score, comment);
      const updatedTasks = await getTasksByPhaseDayId(
        selectedPhaseDay?._id || ""
      );
      setTasks(updatedTasks);
      setReviewModalOpen(false);
      setSelectedUserId(null);
      setSnackbarMessage("Task reviewed successfully!");
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
                      <Typography fontWeight="bold">{phase.name}</Typography>
                    }
                    secondary={phase.description}
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
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 2 }}>
          <TaskList
            tasks={tasks}
            volunteers={volunteers}
            departments={departments}
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
            onDelete={(taskId) => handleDeleteTask(taskId)}
          />
          {(!tasks || tasks.length === 0) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No tasks found for this phase day.
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
              handleAssignTask(selectedTask._id, taskData.assignedUsers);
            } else {
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
        volunteers={volunteers}
        departments={departments}
        task={selectedTask}
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
            handlePeerReviewTask(
              selectedTask._id,
              JSON.parse(localStorage.getItem("user") || "{}")._id,
              selectedUserId,
              taskData.score,
              taskData.comment
            );
          }
        }}
        volunteers={volunteers}
        departments={departments}
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
  volunteers: Volunteer[];
  departments: Record<string, Department[]>;
  onAssign?: (task: Task) => void;
  onReview?: (task: Task, userId: string) => void;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  volunteers,
  departments,
  onAssign,
  onReview,
  onUpdate,
  onDelete,
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>
        No tasks found
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
            alignItems: "flex-start",
            minHeight: "56px",
          }}
        >
          <ListItemText
            primary={<Typography fontWeight="bold">{task.title}</Typography>}
            secondary={
              <>
                <Typography variant="body2">{task.description}</Typography>
                <Typography variant="caption">
                  Leader:{" "}
                  {volunteers.find((v) => v.user._id === task.leaderId)?.user
                    .fullName || "Unknown"}
                </Typography>
              </>
            }
            sx={{
              flex: 2,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              mr: 1,
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flex: 0,
              alignItems: "center",
              height: "56px",
            }}
          >
            {onAssign && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Assignment />}
                onClick={() => onAssign(task)}
                sx={{
                  mb: 1,
                  padding: "6px 16px",
                }}
              >
                Assign Volunteers
              </Button>
            )}
            {onUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit />}
                onClick={() => onUpdate(task)}
                sx={{
                  mb: 1,
                  padding: "6px 16px",
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
                  padding: "6px 16px",
                }}
              >
                Delete
              </Button>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, maxWidth: 250, ml: 2 }}>
            {task.assignedUsers && task.assignedUsers.length > 0 ? (
              <>
                <Typography variant="subtitle2">
                  Volunteers ({task.assignedUsers.length})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      {task.assignedUsers.map((au) => {
                        const volunteer = volunteers.find(
                          (v) => v.user._id === au.userId
                        );
                        return (
                          <TableRow key={au.userId}>
                            <TableCell>
                              {volunteer?.user.fullName || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {onReview && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<RateReview />}
                                  onClick={() => onReview(task, au.userId)}
                                  sx={{ padding: "4px 8px" }}
                                  disabled={
                                    task.status !== "submitted" &&
                                    !(
                                      au.submission &&
                                      (au.submission.content?.trim() ||
                                        au.submission.images.length > 0)
                                    )
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
              <Typography variant="caption" color="textSecondary">
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
