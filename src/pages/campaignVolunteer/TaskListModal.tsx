import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  TextField,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import { getCampaignVolunteerDetail, CampaignVolunteer } from '../../apis/campaign';

// Định nghĩa kiểu dữ liệu
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: {
    status: 'todo' | 'doing' | 'done';
  };
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

interface TaskListModalProps {
  campaignId: string | null;
  open: boolean;
  onClose: () => void;
}

// API giả lập
const mockCheckInPhaseDay = async (phaseDayId: string): Promise<boolean> => {
  // Giả lập kiểm tra vị trí (luôn thành công)
  return true;
};

const mockSubmitTaskReport = async (formData: FormData): Promise<void> => {
  // Giả lập gửi báo cáo
  console.log('Form data:', Object.fromEntries(formData));
};

// Component chính
const TaskListModal: React.FC<TaskListModalProps> = ({ campaignId, open, onClose }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [selectedPhaseDayId, setSelectedPhaseDayId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formMode, setFormMode] = useState<'complete' | 'issue'>('complete');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId || !open) {
      setPhases([]);
      setError(null);
      return;
    }

    const fetchPhases = async () => {
      setLoading(true);
      setError(null);
      try {
        const campaign: CampaignVolunteer = await getCampaignVolunteerDetail(campaignId);
        setPhases(campaign.phases ?? []);
      } catch (err) {
    console.error('Lỗi khi tải campaign:', err);
    setError('Không thể tải danh sách giai đoạn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhases();
  }, [campaignId, open]);

  const handleOpenCheckin = (phaseDayId: string) => {
    setSelectedPhaseDayId(phaseDayId);
    setCheckinModalOpen(true);
  };

  const handleConfirmCheckin = async () => {
    if (!selectedPhaseDayId) {
      setMessage('Không có ngày được chọn.');
      return;
    }
    try {
      const isWithinRange = await mockCheckInPhaseDay(selectedPhaseDayId);
      if (isWithinRange) {
        setMessage(`Check-in thành công cho ngày ${dayjs().format('DD/MM/YYYY')}!`);
        setCheckinModalOpen(false);
      } else {
        setMessage('Bạn không ở trong bán kính 100m từ điểm tập kết!');
      }
    } catch (err) {
      setMessage('Lỗi khi check-in. Vui lòng thử lại.');
    }
  };

  const handleOpenReportForm = (task: Task, mode: 'complete' | 'issue') => {
    setSelectedTask(task);
    setFormMode(mode);
    setReportModalOpen(true);
  };

  const handleCloseReportForm = () => {
    setReportModalOpen(false);
    setSelectedTask(null);
    setImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setImage(file);
    } else {
      setMessage('Vui lòng chọn file ảnh dưới 5MB.');
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedTask) {
      setMessage('Không có nhiệm vụ được chọn.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('taskId', selectedTask._id);
      formData.append('mode', formMode);
      formData.append(
        'description',
        (document.getElementById('report-description') as HTMLInputElement)?.value || ''
      );
      if (image) formData.append('image', image);

      await mockSubmitTaskReport(formData);
      setMessage(
        `Đã gửi ${formMode === 'complete' ? 'báo cáo hoàn thành' : 'báo sự cố'} cho nhiệm vụ: ${selectedTask.title}`
      );
      handleCloseReportForm();
    } catch (err) {
      setMessage('Lỗi khi gửi báo cáo. Vui lòng thử lại.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Danh sách giai đoạn</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : phases.length === 0 ? (
          <Typography color="text.secondary">
            Không có giai đoạn nào cho chiến dịch này.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {phases.map((phase) => (
              <Accordion
                key={phase._id}
                defaultExpanded={phase.phaseDays.length > 0}
                disableGutters
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      🧭 {phase.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      (Từ {dayjs(phase.startDate).format('DD/MM/YYYY')} đến{' '}
                      {dayjs(phase.endDate).format('DD/MM/YYYY')})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {phase.description && (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2, whiteSpace: 'pre-line' }}
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
                      {phase.phaseDays.map((day) => (
                        <Box key={day._id}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            sx={{ mb: 1 }}
                          >
                            <Typography fontWeight={600}>
                              📅 {dayjs(day.date).format('DD/MM/YYYY')}
                            </Typography>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleOpenCheckin(day._id)}
                            >
                              Check-in
                            </Button>
                          </Stack>
                          {day.tasks.length === 0 ? (
                            <Typography color="text.secondary" sx={{ ml: 2 }}>
                              Không có nhiệm vụ.
                            </Typography>
                          ) : (
                            <Stack spacing={1} sx={{ ml: 2, mt: 1 }}>
                              {day.tasks.map((task) => (
                                <Stack
                                  key={task._id}
                                  direction={{ xs: 'column', sm: 'row' }}
                                  justifyContent="space-between"
                                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                                  spacing={2}
                                >
                                  <Typography variant="body2">
                                    🔧 {task.title} ({task.status.status})
                                  </Typography>
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => handleOpenReportForm(task, 'complete')}
                                    >
                                      Hoàn thành
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="warning"
                                      onClick={() => handleOpenReportForm(task, 'issue')}
                                    >
                                      Báo sự cố
                                    </Button>
                                  </Stack>
                                </Stack>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>

      {/* Modal Check-in PhaseDay */}
      <Dialog open={checkinModalOpen} onClose={() => setCheckinModalOpen(false)}>
        <DialogTitle>Check-in ngày hoạt động</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Bạn cần đứng gần điểm tập kết trong bán kính <strong>100m</strong> để check-in. Vui lòng kiểm tra vị trí của bạn!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckinModalOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleConfirmCheckin}>
            Xác nhận check-in
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Báo cáo Task */}
      <Dialog open={reportModalOpen} onClose={handleCloseReportForm} fullWidth maxWidth="sm">
        <DialogTitle>{formMode === 'complete' ? 'Báo cáo hoàn thành' : 'Báo sự cố'}</DialogTitle>
        <DialogContent>
          {selectedTask ? (
            <Typography mb={2}>
              <strong>Nhiệm vụ: {selectedTask.title}</strong> –{' '}
              {selectedTask.description || 'Không có mô tả'}
            </Typography>
          ) : (
            <Typography color="error">Không có nhiệm vụ được chọn.</Typography>
          )}
          {formMode === 'complete' ? (
            <>
              <TextField
                id="report-description"
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
              id="report-description"
              fullWidth
              multiline
              rows={3}
              label="Lý do không thể thực hiện"
              placeholder="Ví dụ: Thiết bị hỏng, cần hỗ trợ thêm..."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportForm}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmitReport}>
            Gửi
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
    </Dialog>
  );
};

export default TaskListModal;