import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Divider,
  Container,
  Button,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { fetchPhasesByCampaignId, fetchTasksByCampaignId, submitTaskApi } from '../../apis/phase';
import TaskActionModal from './TaskActionModal';
import { getCampaignVolunteerDetail } from '../../apis/campaign';

interface Task {
  _id: string;
  title: string;
  description: string;
  submission?: {
    status: string;
  };
  phaseDay: {
    _id: string;
    date: string;
  };
}

interface PhaseDay {
  _id: string;
  date: string;
  tasks: Task[];
}

interface Phase {
  _id: string;
  name: string;
  phaseDays: PhaseDay[];
}

const TaskListPage: React.FC = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();

  const [phases, setPhases] = useState<Phase[]>([]);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedPhaseDay, setExpandedPhaseDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'complete' | 'report'>('complete');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState<string>('');
  const [campaignImageUrl, setCampaignImageUrl] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hoàn thành':
        return 'success';
      case 'đang chờ':
        return 'warning';
      case 'bị từ chối':
        return 'error';
      case 'chưa nộp':
        return 'info';
      default:
        return 'default';
    }
  };

  const openModalWithTaskId = (taskId: string, mode: 'complete' | 'report') => {
    setSelectedTaskId(taskId);
    setModalMode(mode);
    setTimeout(() => {
      console.log('Task đã được chọn:', taskId);
      setModalOpen(true);
    }, 3);
  };

  const handleCheckIn = (phaseDayId: string) => {
    console.log('Check-in cho PhaseDay:', phaseDayId);
    // Placeholder cho logic API sau này
  };

  const handleSubmitTaskAction = async (taskId: string, content: string, images: File[]) => {
    const userString = localStorage.getItem('user');
    const token = userString ? JSON.parse(userString).token : null;

    if (!token || !taskId) {
      alert('Thiếu token hoặc taskId!');
      return;
    }

    try {
      if (modalMode === 'complete') {
        await submitTaskApi(taskId, content, images, token);
      }
      alert('Gửi thành công');
    } catch (err) {
      alert('Thất bại khi gửi');
      console.error(err);
    } finally {
      setModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      const userString = localStorage.getItem('user');
      const token = userString ? JSON.parse(userString).token : null;
      if (!token || !campaignId) {
        setError('Token không tồn tại hoặc campaignId không hợp lệ');
        return;
      }

      setLoading(true);
      try {
        const campaignDetail = await getCampaignVolunteerDetail(campaignId);
        setCampaignName(campaignDetail.name);
        setCampaignImageUrl(campaignDetail.image || null);

        const phaseRes = await fetchPhasesByCampaignId(campaignId, token);
        const fetchedPhases = phaseRes.data.phases;

        const fetchedTasks: Task[] = await fetchTasksByCampaignId(campaignId, token);

        for (const phase of fetchedPhases) {
          for (const day of phase.phaseDays) {
            day.tasks = fetchedTasks.filter((task) =>
              task.phaseDay &&
              task.phaseDay.date === day.date &&
              task.phaseDay.phaseName === phase.name
            );
          }
        }

        setPhases(fetchedPhases);
        if (fetchedPhases.length > 0) setExpandedPhase(fetchedPhases[0]._id);
      } catch (err) {
        console.error(err);
        setError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [campaignId]);

  return (
    <Container maxWidth="md" sx={{ mb: 5, mt: 20 }}>
      <Header />
      <Box sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Nhiệm vụ trong chiến dịch:{' '}
              <span style={{ color: '#4699ddff' }}>{campaignName}</span>
            </Typography>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {campaignImageUrl && (
              <img
                src={campaignImageUrl}
                alt={campaignName}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '250px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  marginBottom: '16px',
                }}
              />
            )}
          </CardContent>
        </Card>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </Box>

      {loading && <Typography>Đang tải dữ liệu...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <List>
        {phases.map((phase) => (
          <Box key={phase._id} sx={{ mb: 2 }}>
            <ListItem
              button
              onClick={() =>
                setExpandedPhase(phase._id === expandedPhase ? null : phase._id)
              }
              sx={{
                bgcolor: expandedPhase === phase._id ? 'primary.light' : 'grey.100',
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" fontWeight="bold">
                    {phase.name}
                  </Typography>
                }
              />
              {expandedPhase === phase._id ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={expandedPhase === phase._id} timeout="auto" unmountOnExit>
              <List dense sx={{ pl: 2 }}>
                {phase.phaseDays.map((day) => (
                  <Box key={day._id}>
                    <ListItem
                      button
                      onClick={() =>
                        setExpandedPhaseDay(day._id === expandedPhaseDay ? null : day._id)
                      }
                      sx={{
                        bgcolor: expandedPhaseDay === day._id ? 'secondary.light' : 'grey.50',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="medium">
                              Ngày: {formatDate(day.date)}
                            </Typography>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            color="info"
                            onClick={() => handleCheckIn(day._id)}
                          >
                            Check-in
                          </Button>
                          {expandedPhaseDay === day._id ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      </Box>
                    </ListItem>

                    <Collapse in={expandedPhaseDay === day._id} timeout="auto" unmountOnExit>
                      <List dense sx={{ pl: 3 }}>
                        {day.tasks.length === 0 && (
                          <Typography variant="body2" sx={{ pl: 2 }}>
                            Không có nhiệm vụ nào.
                          </Typography>
                        )}

                        {day.tasks.map((task) => (
                          <Card key={task._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {task.title}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'start',
                                  flexWrap: 'wrap',
                                  gap: 1,
                                }}
                              >
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {task.description}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Chip
                                    label={task.submission?.status || 'chưa nộp'}
                                    color={getStatusColor(task.submission?.status || 'chưa nộp')}
                                    size="small"
                                    sx={{ alignSelf: 'flex-end' }}
                                  />
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      color="success"
                                      onClick={() => openModalWithTaskId(task._id, 'complete')}
                                    >
                                      Hoàn thành
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="error"
                                      onClick={() => openModalWithTaskId(task._id, 'report')}
                                    >
                                      Báo cáo
                                    </Button>
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                ))}
              </List>
            </Collapse>
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}
      </List>

      <TaskActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        taskId={selectedTaskId}
        onSubmit={handleSubmitTaskAction}
      />
    </Container>
  );
};

export default TaskListPage;