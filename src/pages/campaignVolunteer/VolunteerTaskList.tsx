import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BuildIcon from "@mui/icons-material/Build";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MapWithDistanceCheck from "./MapWithDistanceCheck";

// Kiểu dữ liệu một nhiệm vụ
export interface Task {
  _id: string;
  name: string;
  description?: string;
  status: "todo" | "doing" | "done";
}

interface VolunteerTaskListProps {
  /** Danh sách nhiệm vụ để hiển thị */
  tasks: Task[];
}

// Định nghĩa màu sắc và biểu tượng cho từng trạng thái
const statusConfig: Record<Task["status"], { label: string; color: string; muiColor: "default" | "warning" | "success"; icon: React.ReactNode }> = {
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

// Tùy chỉnh Paper
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

/**
 * Danh sách nhiệm vụ của tình nguyện viên trong một chiến dịch
 */
const VolunteerTaskList: React.FC<VolunteerTaskListProps> = ({ tasks }) => {
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [formMode, setFormMode] = useState<"complete" | "issue">("complete");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);

  const handleOpenForm = (task: Task, mode: "complete" | "issue") => {
    setSelectedTask(task);
    setFormMode(mode);
    setOpenTaskForm(true);
  };

  const handleCloseForm = () => {
    setOpenTaskForm(false);
    setSelectedTask(null);
    setImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmitForm = () => {
    alert(`Đã gửi ${formMode === "complete" ? "báo cáo hoàn thành" : "báo sự cố"} cho nhiệm vụ: ${selectedTask?.name}`);
    handleCloseForm();
  };

  const handleOpenCheckin = () => {
    setCheckinModalOpen(true);
  };

  const handleConfirmCheckin = () => {
    alert(`Bạn đã check-in thành công cho nhiệm vụ: ${selectedTask?.name}!`);
    setCheckinModalOpen(false);
  };

  // Nhóm nhiệm vụ theo trạng thái
  const groupedTasks = {
    todo: tasks.filter((task) => task.status === "todo"),
    doing: tasks.filter((task) => task.status === "doing"),
    done: tasks.filter((task) => task.status === "done"),
  };

  if (tasks.length === 0) {
    return (
      <>
        <Header sx={{ width: "100%", bgcolor: "background.paper", boxShadow: 1, py: 2 }} />
        <Box sx={{ textAlign: "center", py: 6, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1, maxWidth: 900, mx: "auto" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Hiện chưa có nhiệm vụ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy kiểm tra lại sau nhé!
          </Typography>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header sx={{ width: "100%", bgcolor: "background.paper", boxShadow: 1, py: 2 }} />
      <Box sx={{ maxWidth: 900, mx: "auto", py: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Danh sách nhiệm vụ
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {(["todo", "doing", "done"] as Task["status"][]).map((status) => (
            <Accordion key={status} defaultExpanded={status === "doing" || groupedTasks[status].length > 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">
                  {statusConfig[status].label} ({groupedTasks[status].length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {groupedTasks[status].length === 0 ? (
                  <Typography color="text.secondary">Không có nhiệm vụ ở trạng thái này.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {groupedTasks[status].map((task) => (
                      <StyledPaper key={task._id}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              🔧 {task.name}
                            </Typography>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {task.description}
                              </Typography>
                            )}
                            <Chip
                              label={statusConfig[task.status].label}
                              color={statusConfig[task.status].muiColor}
                              icon={statusConfig[task.status].icon}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                          {task.status === "doing" && (
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => {
                                  setSelectedTask(task);
                                  handleOpenCheckin();
                                }}
                              >
                                Check-in
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenForm(task, "complete")}
                              >
                                Hoàn thành
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => handleOpenForm(task, "issue")}
                              >
                                Báo sự cố
                              </Button>
                            </Stack>
                          )}
                        </Stack>
                      </StyledPaper>
                    ))}
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        {/* Dialog báo cáo nhiệm vụ */}
        <Dialog open={openTaskForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
          <DialogTitle>{formMode === "complete" ? "Báo cáo hoàn thành nhiệm vụ" : "Báo sự cố nhiệm vụ"}</DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Typography mb={2}>
                <strong>{selectedTask.name}</strong> – {selectedTask.description || "Không có mô tả"}
              </Typography>
            )}
            {formMode === "complete" ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Mô tả kết quả công việc"
                  placeholder="Ví dụ: Đã hoàn thành nhiệm vụ và kiểm tra kết quả."
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined" component="label">
                  Tải ảnh minh chứng
                  <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                </Button>
                {image && <Typography mt={1}>📎 {image.name}</Typography>}
              </>
            ) : (
              <TextField
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
              Bạn cần đứng gần điểm tập kết trong bán kính <strong>100m</strong> để check-in. Vui lòng kiểm tra bản đồ để đến đúng vị trí!
            </Typography>
            <Box>
              {/* <MapWithDistanceCheck checkpoint={{ lat: 21.00748588888423, lng: 105.81175424160796 }} /> */}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCheckinModalOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleConfirmCheckin}>
              Xác nhận check-in
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Footer />
    </>
  );
};

export default VolunteerTaskList;