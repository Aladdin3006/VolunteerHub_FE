import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getCampaignVolunteerDetail } from "../../apis/campaign";
import { CampaignVolunteer } from "../../apis/campaign";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BuildIcon from "@mui/icons-material/Build";
import HelpIcon from "@mui/icons-material/Help";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
// import MapWithDistanceCheck from "./MapWithDistanceCheck";
import dayjs from "dayjs";

// Kiểu dữ liệu
type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: {
    status: TaskStatus;
  };
  lat?: number;
  lng?: number;
}

export interface PhaseDay {
  _id: string;
  date: string;
  tasks: Task[];
}

export interface Phase {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  phaseDays: PhaseDay[];
}



// Cấu hình trạng thái
const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    color: string;
    muiColor: "default" | "warning" | "success";
    icon: React.ReactNode;
  }
> = {
  todo: {
    label: "⏳ Chưa bắt đầu",
    color: "#e0e0e0",
    muiColor: "default",
    icon: <HourglassEmptyIcon fontSize="small" />,
  },
  doing: {
    label: "🔧 Đang thực hiện",
    color: "#fff3e0",
    muiColor: "warning",
    icon: <BuildIcon fontSize="small" />,
  },
  done: {
    label: "✅ Hoàn thành",
    color: "#e8f5e9",
    muiColor: "success",
    icon: <TaskAltIcon fontSize="small" />,
  },
};

// Style Paper
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: "1px solid #eee",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
  },
}));

const VolunteerTaskList: React.FC = () => {
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [formMode, setFormMode] = useState<"complete" | "issue">("complete");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<PhaseDay | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { campaignId } = useParams();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!campaignId) return;
    (async () => {
      try {
        const campaign: CampaignVolunteer = await getCampaignVolunteerDetail(campaignId);
        setPhases(campaign.phases ?? []);
      } catch (err) {
        console.error("Lỗi khi tải campaign", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId]);

  const handleOpenForm = (task: Task | null, phaseDay: PhaseDay | null, mode: "complete" | "issue") => {
    setSelectedTask(task);
    setSelectedPhaseDay(phaseDay);
    setFormMode(mode);
    setOpenTaskForm(true);
  };

  const handleCloseForm = () => {
    setOpenTaskForm(false);
    setSelectedTask(null);
    setSelectedPhaseDay(null);
    setImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      setImage(file);
    } else {
      setMessage("Vui lòng chọn file ảnh dưới 5MB.");
    }
  };

  const handleSubmitForm = async () => {
    if (selectedPhaseDay) {
      const doingTasks = selectedPhaseDay.tasks.filter((task) => task.status.status === "doing");
      if (doingTasks.length === 0) {
        setMessage("Không có nhiệm vụ nào đang thực hiện trong ngày này.");
        return;
      }
      try {
        const formData = new FormData();
        formData.append("phaseDayId", selectedPhaseDay._id);
        formData.append("mode", formMode);
        formData.append(
          "description",
          (document.getElementById("task-description") as HTMLInputElement)?.value || ""
        );
        if (image) formData.append("image", image);

        // await submitPhaseDayReport(formData); // Giả định API
        setMessage(
          `Đã gửi ${formMode === "complete" ? "báo cáo hoàn thành" : "báo sự cố"} cho ngày: ${dayjs(
            selectedPhaseDay.date
          ).format("DD/MM/YYYY")}`
        );
        handleCloseForm();
      } catch (err) {
        setMessage("Lỗi khi gửi báo cáo. Vui lòng thử lại.");
      }
    } else if (selectedTask) {
      try {
        const formData = new FormData();
        formData.append("taskId", selectedTask._id);
        formData.append("mode", formMode);
        formData.append(
          "description",
          (document.getElementById("task-description") as HTMLInputElement)?.value || ""
        );
        if (image) formData.append("image", image);

        // await submitTaskReport(formData); // Giả định API
        setMessage(
          `Đã gửi ${formMode === "complete" ? "báo cáo hoàn thành" : "báo sự cố"} cho nhiệm vụ: ${selectedTask.title
          }`
        );
        handleCloseForm();
      } catch (err) {
        setMessage("Lỗi khi gửi báo cáo. Vui lòng thử lại.");
      }
    } else {
      setMessage("Không có nhiệm vụ hoặc ngày được chọn.");
    }
  };

  const handleOpenCheckin = (task: Task) => {
    setSelectedTask(task);
    setCheckinModalOpen(true);
  };

  const handleConfirmCheckin = async () => {
    if (!selectedTask) {
      setMessage("Không có nhiệm vụ được chọn.");
      return;
    }
    try {
      // const isWithinRange = await checkUserLocation(selectedTask._id); // Giả định API
      const isWithinRange = true; // Giả lập
      if (isWithinRange) {
        // await confirmTaskCheckin(selectedTask._id); // Giả định API
        setMessage(`Check-in thành công cho nhiệm vụ: ${selectedTask.title}!`);
        setCheckinModalOpen(false);
      } else {
        setMessage("Bạn không ở trong bán kính 100m từ điểm tập kết!");
      }
    } catch (err) {
      setMessage("Lỗi khi check-in. Vui lòng thử lại.");
    }
  };

  // Kiểm tra nếu không có phase hoặc nhiệm vụ
  const hasTasks = useMemo(
    () => phases.some((phase) => phase.phaseDays.some((day) => day.tasks.length > 0)),
    [phases]
  );

  if (phases.length === 0 || !hasTasks) {
    return (
      <>
        <Header sx={{ width: "100%", bgcolor: "background.paper", boxShadow: 1, py: 2 }} />
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            maxWidth: 900,
            mx: "auto",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Hiện chưa có giai đoạn hoặc nhiệm vụ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy kiểm tra lại sau nhé!
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{ mt: 2 }}
          >
            Quay lại
          </Button>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header sx={{ width: "100%", bgcolor: "background.paper", boxShadow: 1, py: 2 }} />
      <Box sx={{ maxWidth: { xs: "100%", sm: 900 }, mx: "auto", py: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Danh sách nhiệm vụ
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {phases.map((phase) => (
            <Accordion
              key={phase._id}
              defaultExpanded={phase.phaseDays.some((day) => day.tasks.length > 0)}
              disableGutters
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={700}>
                  🧭 {phase.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  (Từ {dayjs(phase.startDate).format("DD/MM/YYYY")} đến{" "}
                  {dayjs(phase.endDate).format("DD/MM/YYYY")})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {phase.description && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 2, whiteSpace: "pre-line" }}
                  >
                    {phase.description}
                  </Typography>
                )}
                {phase.phaseDays.length === 0 ? (
                  <Typography color="text.secondary">
                    Không có ngày hoạt động nào trong giai đoạn này.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {phase.phaseDays.map((day) => {
                      const hasDoingTasks = day.tasks.some((task) => task.status.status === "doing");
                      return (
                        <Box key={day._id}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ mb: 1 }}
                          >
                            <Typography fontWeight={600}>
                              📅 {dayjs(day.date).format("DD/MM/YYYY")}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenForm(null, day, "complete")}
                                disabled={!hasDoingTasks}
                              >
                                Check-In
                              </Button>

                            </Stack>
                          </Stack>
                          {day.tasks.length === 0 ? (
                            <Typography color="text.secondary" sx={{ ml: 2 }}>
                              Không có nhiệm vụ.
                            </Typography>
                          ) : (
                            <Stack spacing={2}>
                              {day.tasks.map((task) => {
                                const statusInfo = statusConfig[task.status.status] || {
                                  label: "Không rõ trạng thái",
                                  muiColor: "default" as const,
                                  icon: <HelpIcon fontSize="small" />,
                                };
                                if (!["todo", "doing", "done"].includes(task.status.status)) {
                                  console.warn(`Invalid task status for task ${task._id}: ${task.status.status}`);
                                }


                                return (
                                  <StyledPaper key={task._id}>
                                    <Stack
                                      direction={{ xs: "column", sm: "row" }}
                                      justifyContent="space-between"
                                      alignItems={{ xs: "flex-start", sm: "center" }}
                                      spacing={2}
                                    >
                                      <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                          🔧 {task.title}
                                        </Typography>
                                        {task.description && (
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                          >
                                            {task.description}
                                          </Typography>
                                        )}
                                        <Chip
                                          label={statusInfo.label}
                                          color={statusInfo.muiColor}
                                          icon={statusInfo.icon}
                                          size="small"
                                          sx={{ mt: 1 }}
                                        />
                                      </Box>

                                      <Stack direction="row" spacing={1}>

                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => handleOpenForm(task, null, "complete")}
                                        >
                                          Hoàn thành
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="warning"
                                          onClick={() => handleOpenForm(task, null, "issue")}
                                        >
                                          Báo sự cố
                                        </Button>
                                      </Stack>

                                    </Stack>
                                  </StyledPaper>
                                );
                              })}
                            </Stack>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        {/* Dialog báo cáo nhiệm vụ */}
        <Dialog open={openTaskForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
          <DialogTitle>
            {formMode === "complete" ? "Báo cáo hoàn thành" : "Báo sự cố"}
          </DialogTitle>
          <DialogContent>
            {selectedTask ? (
              <Typography mb={2}>
                <strong>Nhiệm vụ: {selectedTask.title}</strong> –{" "}
                {selectedTask.description || "Không có mô tả"}
              </Typography>
            ) : selectedPhaseDay ? (
              <Typography mb={2}>
                <strong>Ngày: {dayjs(selectedPhaseDay.date).format("DD/MM/YYYY")}</strong> –{" "}
                {selectedPhaseDay.tasks
                  .filter((task) => task.status.status === "doing")
                  .map((task) => task.title)
                  .join(", ") || "Không có nhiệm vụ đang thực hiện"}
              </Typography>
            ) : (
              <Typography color="error">Không có nhiệm vụ hoặc ngày được chọn.</Typography>
            )}
            {formMode === "complete" ? (
              <>
                <TextField
                  id="task-description"
                  fullWidth
                  multiline
                  rows={4}
                  label="Mô tả kết quả công việc"
                  placeholder="Ví dụ: Đã hoàn thành nhiệm vụ và kiểm tra kết quả."
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined" component="label">
                  Tải ảnh minh chứng
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleImageChange}
                  />
                </Button>
                {image && <Typography mt={1}>📎 {image.name}</Typography>}
              </>
            ) : (
              <TextField
                id="task-description"
                fullWidth
                multiline
                rows={3}
                label="Lý do không thể thực hiện"
                placeholder="Ví dụ: Thiết bị hỏng, cần hỗ trợ thêm..."
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Hủy</Button>
            <Button variant="contained" onClick={handleSubmitForm}>
              Gửi
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog check-in */}
        <Dialog open={checkinModalOpen} onClose={() => setCheckinModalOpen(false)}>
          <DialogTitle>Check-in nhiệm vụ</DialogTitle>
          <DialogContent>
            <Typography mb={2}>
              Bạn cần đứng gần điểm tập kết trong bán kính <strong>100m</strong>{" "}
              để check-in. Vui lòng kiểm tra bản đồ để đến đúng vị trí!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCheckinModalOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleConfirmCheckin}>
              Xác nhận check-in
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={!!message}
          autoHideDuration={4000}
          onClose={() => setMessage(null)}
          message={message}
        />
      </Box>
      <Footer />
    </>
  );
};

export default VolunteerTaskList;