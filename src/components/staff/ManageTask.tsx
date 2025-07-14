// ManageTask.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Assignment,
  RateReview,
  ExpandMore,
  Close,
} from "@mui/icons-material";
import {
  Volunteer,
  getCampaignVolunteers,
  Task,
  getTasksByPhaseDayId,
  createTask,
  updateTask,
  Phase,
  getPhasesByCampaignId,
  PhaseDay,
} from "../../apis/staff";
import TaskCRUDModal from "./TaskCRUDModal";

type TaskEvaluation = "excellent" | "good" | "average" | "poor";

interface ManageTaskProps {
  campaignId: string;
}

const ManageTask: React.FC<ManageTaskProps> = ({ campaignId }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [phaseDays, setPhaseDays] = useState<PhaseDay[]>([]);
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<PhaseDay | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

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
        assignedUsers: taskData.assignedUsers || [],
        status: { status: taskData.assignedUsers.length > 0 ? "in_progress" : "not-started" },
      });
      setTasks((prevTasks) => [newTask, ...Array.isArray(prevTasks) ? prevTasks : []]);
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

  const handleAssignTask = async (taskId: string, assignedUsers: string[]) => {
    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      setSnackbarMessage("Invalid task ID format");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const updatedTask = await updateTask(taskId, {
        assignedUsers: assignedUsers || [],
        status: { status: "in_progress" },
      });
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === taskId ? updatedTask : t)));
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

  const handleReviewTask = async (taskId: string, evaluation: TaskEvaluation, feedback: string) => {
    try {
      const updatedTask = await updateTask(taskId, {
        status: { status: "approved", evaluation, feedback, submittedAt: new Date() },
      });
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
      setReviewModalOpen(false);
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

  const notStartedTasks = tasks?.filter((t) => t?.status?.status === "not-started") || [];
  const inProgressTasks = tasks?.filter((t) => t?.status?.status === "in_progress") || [];
  const submittedTasks = tasks?.filter((t) => t?.status?.status === "submitted") || [];

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
                    primary={<Typography fontWeight="bold">{phase.name}</Typography>}
                    secondary={phase.description}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
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
                  primary={<Typography fontWeight="bold">{new Date(day.date).toLocaleDateString()}</Typography>}
                  secondary={day.checkinLocation?.address}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
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
        <Typography>{new Date(selectedPhaseDay.date).toLocaleDateString()}</Typography>
      </Breadcrumbs>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={goBackToPhaseDays} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">
          Task Management: {new Date(selectedPhaseDay.date).toLocaleDateString()}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Not Started" />
          <Tab label="In Progress" />
          <Tab label="Submitted" />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedTask(null);
            setTaskModalOpen(true);
          }}
        >
          Create Task
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 2 }}>
          {activeTab === 0 && (
            <TaskList
              tasks={notStartedTasks}
              volunteers={volunteers}
              onAssign={(task) => {
                setSelectedTask(task);
                setTaskModalOpen(true);
              }}
              onUnassign={(task, userId) => {
                const updatedUsers = task.assignedUsers.filter((id) => id !== userId);
                handleAssignTask(task._id, updatedUsers);
              }}
            />
          )}
          {activeTab === 1 && (
            <TaskList
              tasks={inProgressTasks}
              volunteers={volunteers}
              onAction={(task) => {
                updateTask(task._id, { status: { status: "submitted" } }).then((updatedTask) => {
                  setTasks(tasks.map((t) => (t._id === task._id ? updatedTask : t)));
                });
              }}
              actionLabel="Mark as Submitted"
              actionIcon={<Assignment />}
            />
          )}
          {activeTab === 2 && (
            <TaskList
              tasks={submittedTasks}
              volunteers={volunteers}
              onAction={(task) => {
                setSelectedTask(task);
                setReviewModalOpen(true);
              }}
              actionLabel="Review Task"
              actionIcon={<RateReview />}
            />
          )}
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
            handleAssignTask(selectedTask._id, taskData.assignedUsers);
          } else {
            handleCreateTask(taskData);
          }
        }}
        volunteers={volunteers}
        task={selectedTask}
      />
      <TaskCRUDModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={(taskData) => {
          if (selectedTask && taskData.evaluation && taskData.feedback) {
            handleReviewTask(selectedTask._id, taskData.evaluation as TaskEvaluation, taskData.feedback);
          }
        }}
        volunteers={volunteers}
        task={selectedTask}
        isReviewMode={true}
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
  onAssign?: (task: Task) => void;
  onUnassign?: (task: Task, userId: string) => void;
  onAction?: (task: Task) => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  volunteers,
  onAssign,
  onUnassign,
  onAction,
  actionLabel,
  actionIcon,
}) => {
  if (!tasks || tasks.length === 0) {
    return <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>No tasks found in this category</Typography>;
  }

  return (
    <List>
      {tasks.map((task, index) => (
        <ListItem
          key={task?._id || `task-${index}`}
          divider
          sx={{ "&:hover": { backgroundColor: "action.hover" }, display: "flex", alignItems: "flex-start", minHeight: "56px" }}
        >
          <ListItemText
            primary={<Typography fontWeight="bold">{task.title}</Typography>}
            secondary={task.description}
            sx={{ flex: 2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", mr: 1 }}
          />
          <Stack direction="row" spacing={1} sx={{ flex: 0, alignItems: "center", height: "56px" }}>
            {onAssign && (
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                onClick={() => onAssign(task)}
                sx={{ mr: 1, height: "100%", minHeight: "56px", padding: "6px 16px" }}
              >
                Assign Volunteers
              </Button>
            )}
            {onAction && (
              <Button
                variant="contained"
                startIcon={actionIcon}
                onClick={() => onAction(task)}
                sx={{ height: "100%", minHeight: "56px", padding: "6px 16px" }}
              >
                {actionLabel}
              </Button>
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flex: 1, minWidth: 200, maxWidth: 250, ml: 2 }}>
            {task.assignedUsers && task.assignedUsers.length > 0 ? (
              <Accordion sx={{ width: "100%", boxShadow: "none", "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">Volunteers ({task.assignedUsers.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {task.assignedUsers.map((userId) => {
                      const volunteer = volunteers.find((v) => v.user._id === userId);
                      return (
                        <ListItem key={userId} disableGutters>
                          <ListItemText primary={volunteer?.user.fullName || "Unknown"} />
                          {onUnassign && (
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => onUnassign(task, userId)}>
                                <Close />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            ) : (
              <Typography variant="caption" color="textSecondary">No volunteers assigned</Typography>
            )}
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};

export default ManageTask;