
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Collapse,
  Divider,
  ListItemSecondaryAction,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

interface PhaseDay {
  _id: string;
  date: string;
  checkinLocation: {
    address: string;
  };
  status: string;
}

interface Phase {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  phaseDays: PhaseDay[];
}

interface Task {
  _id: string;
  phaseDayId: string;
  title: string;
  description: string;
  status: {
    code: string; // ví dụ: "in_progress", "completed"
    label: string; // ví dụ: "Đang thực hiện"
  };
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  status: 'ongoing' | 'upcoming' | 'ended';
  imageUrl?: string;
  category: string[];
  registrationDate: Date | null;
  location: {
    address: string;
    coordinates: [number, number];
  };
  gallery?: string[];
}

interface CampaignDetailsModalProps {
  open: boolean;
  onClose: () => void;
  campaign: Campaign;
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ open, onClose, campaign }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedPhaseDayId, setSelectedPhaseDayId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Lấy danh sách phases từ campaignId
  useEffect(() => {
    const fetchPhases = async () => {
      if (!open || !campaign?.id) return;
      try {
        const userString = localStorage.getItem('user');
        const token = userString ? JSON.parse(userString).token : null;
        if (!token) throw new Error('No token found');

        const res = await fetch(`http://localhost:4000/phase/${campaign.id}/phases`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch phases');
        const data = await res.json();
        setPhases(data.data || []);
      } catch (err: any) {
        setError('Lỗi khi tải phases');
        console.error('Lỗi lấy phase:', err);
      }
    };

    fetchPhases();
  }, [campaign, open]);

  // Lấy tasks từ phaseDayId
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedPhaseDayId || !campaign.id) return;
      setLoadingTasks(true);
      setError(null);
      try {
        const userString = localStorage.getItem('user');
        const token = userString ? JSON.parse(userString).token : null;
        if (!token) throw new Error('No token found');

        const res = await fetch(
          `http://localhost:4000/phase/${selectedPhaseDayId}/taskss?campaignId=${campaign.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        setTasks(data.data || []);
      } catch (err: any) {
        setError('Lỗi khi tải tasks');
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [selectedPhaseDayId, campaign.id]);

  // Placeholder cho Check-in
  const handleCheckin = (phaseDayId: string) => {
    alert(`Check-in cho PhaseDay ${phaseDayId} (API chưa được triển khai)`);
  };

  // Placeholder cho Hoàn thành task
  const handleCompleteTask = (taskId: string) => {
    alert(`Hoàn thành task ${taskId} (API chưa được triển khai)`);
  };

  // Placeholder cho Báo cáo sự cố
  const handleReportIssue = (taskId: string) => {
    const issueDescription = prompt('Vui lòng nhập mô tả sự cố:');
    if (issueDescription) {
      alert(`Báo cáo sự cố cho task ${taskId}: ${issueDescription} (API chưa được triển khai)`);
    }
  };

  const handlePhaseClick = (phaseId: string) => {
    setSelectedPhaseId(phaseId === selectedPhaseId ? null : phaseId);
    setSelectedPhaseDayId(null); // Reset phaseDay và tasks khi chọn phase mới
    setTasks([]);
  };

  const handlePhaseDayClick = (phaseDayId: string) => {
    setSelectedPhaseDayId(phaseDayId === selectedPhaseDayId ? null : phaseDayId);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Chi tiết chiến dịch: {campaign.name}
          </Typography>

          <Typography variant="h6" sx={{ mb: 1 }}>Giai đoạn (Phases)</Typography>
          {phases.length === 0 && !error && (
            <Typography color="text.secondary">Không có giai đoạn nào.</Typography>
          )}
          {error && <Typography color="error">{error}</Typography>}
          <List>
            {phases.map(phase => (
              <Box key={phase._id}>
                <ListItem
                  button
                  onClick={() => handlePhaseClick(phase._id)}
                  sx={{
                    bgcolor: selectedPhaseId === phase._id ? 'primary.light' : 'inherit',
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemText
                    primary={phase.name}
                    secondary={`${phase.description} (${formatDate(phase.startDate)} - ${formatDate(
                      phase.endDate
                    )})`}
                  />
                  {selectedPhaseId === phase._id ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={selectedPhaseId === phase._id} timeout="auto" unmountOnExit>
                  <Box sx={{ ml: 4, mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Ngày hoạt động (Phase Days)
                    </Typography>
                    {phase.phaseDays.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Không có ngày hoạt động
                      </Typography>
                    ) : (
                      <List dense>
                        {phase.phaseDays.map(day => (
                          <Box key={day._id}>
                            <ListItem
                              button
                              onClick={() => handlePhaseDayClick(day._id)}
                              sx={{
                                bgcolor: selectedPhaseDayId === day._id ? 'action.selected' : 'inherit',
                                borderRadius: 1,
                                mb: 0.5,
                              }}
                            >
                              <ListItemText
                                primary={`Ngày: ${formatDate(day.date)}`}
                                secondary={`Địa điểm: ${day.checkinLocation.address} | Trạng thái: ${day.status}`}
                              />
                              <ListItemSecondaryAction sx={{ right: 40 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleCheckin(day._id)}
                                  disabled={day.status === 'checked_in'}
                                >
                                  Check-in
                                </Button>
                              </ListItemSecondaryAction>
                              {selectedPhaseDayId === day._id ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                            <Collapse in={selectedPhaseDayId === day._id} timeout="auto" unmountOnExit>
                              <Box sx={{ ml: 4, mt: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Nhiệm vụ (Tasks)
                                </Typography>
                                {loadingTasks ? (
                                  <Typography>Đang tải...</Typography>
                                ) : error ? (
                                  <Typography color="error">{error}</Typography>
                                ) : tasks.length === 0 ? (
                                  <Typography>Không có nhiệm vụ nào.</Typography>
                                ) : (
                                  <List dense>
                                    {tasks.map(task => (
                                      <ListItem key={task._id}>
                                        <ListItemText
                                          primary={task.title}
                                          secondary={`Mô tả: ${task.description} | Trạng thái: ${task.status.label}`}
                                        />
                                        <ListItemSecondaryAction>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleCompleteTask(task._id)}
                                            disabled={task.status.code === 'completed'}
                                            sx={{ mr: 1 }}
                                          >
                                            Hoàn thành
                                          </Button>
                                          <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleReportIssue(task._id)}
                                          >
                                            Báo cáo
                                          </Button>
                                        </ListItemSecondaryAction>
                                      </ListItem>
                                    ))}
                                  </List>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        ))}
                      </List>
                    )}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={onClose}>
              Đóng
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CampaignDetailsModal;
