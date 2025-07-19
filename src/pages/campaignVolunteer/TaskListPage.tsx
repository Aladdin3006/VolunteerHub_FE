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
import { fetchTasksByCampaignId, submitTaskApi } from '../../apis/phase';
import TaskActionModal from './TaskActionModal';

interface Task {
  taskId: string;
  title: string;
  description: string;
  phaseDay: {
    date: string;
    phaseName: string;
  };
  submission: {
    status: string;
  };
}

const TaskListPage: React.FC = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'complete' | 'report'>('complete');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hoàn thành':
        return 'success';
      case 'đang chờ':
        return 'warning';
      case 'bị tỮ chối':
        return 'error';
      case 'chưa nộp':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleSubmitTaskAction = async (content: string, images: File[]) => {
    const userString = localStorage.getItem('user');
    const token = userString ? JSON.parse(userString).token : null;
    if (!token || !selectedTaskId) return;

    try {
      if (modalMode === 'complete') {
        await submitTaskApi(selectedTaskId, content, images, token);
      } else {
        // await reportTaskIssueApi(selectedTaskId, content, images, token);
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
    const getTasks = async () => {
      if (!campaignId) return;
      const userString = localStorage.getItem('user');
      const token = userString ? JSON.parse(userString).token : null;
      if (!token) {
        setError('Token không tồn tại. Vui lòng đăng nhập lại.');
        return;
      }

      setLoading(true);
      try {
        const data = await fetchTasksByCampaignId(campaignId, token);
        setTasks(data);

        const grouped: Record<string, Task[]> = {};
        data.forEach((task: Task) => {
          const key = task.phaseDay.phaseName;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(task);
        });
        setGroupedTasks(grouped);
        if (Object.keys(grouped).length > 0) {
          setExpandedPhase(Object.keys(grouped)[0]);
        }
      } catch (err) {
        setError('Không thể tải danh sách nhiệm vụ.');
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [campaignId]);

  return (
    <Container maxWidth="md" sx={{ mb: 5, mt: 20 }}>
      <Header />
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Nhiệm vụ của bạn trong chiến dịch
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <List>
        {Object.entries(groupedTasks).map(([phaseName, tasks]) => (
          <Box key={phaseName} sx={{ mb: 3 }}>
            <ListItem
              sx={{
                bgcolor: expandedPhase === phaseName ? 'primary.light' : 'grey.100',
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {phaseName} ({tasks.length} nhiệm vụ)
                  </Typography>
                }
              />
              <Button onClick={() => setExpandedPhase(phaseName === expandedPhase ? null : phaseName)}>
                {expandedPhase === phaseName ? <ExpandLess /> : <ExpandMore />}
              </Button>
            </ListItem>

            <Collapse in={expandedPhase === phaseName} timeout="auto" unmountOnExit>
              <List dense sx={{ pl: 2, pr: 0, pt: 1 }}>
                {tasks.map((task) => (
                  <Card key={task.taskId} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {task.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Ngày: {formatDate(task.phaseDay.date)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Chip
                            label={task.submission.status}
                            color={getStatusColor(task.submission.status)}
                            size="small"
                            sx={{ alignSelf: 'flex-end' }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedTaskId(task.taskId);
                                setModalMode('complete');
                                setModalOpen(true);
                              }}
                            >
                              Hoàn thành
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedTaskId(task.taskId);
                                setModalMode('report');
                                setModalOpen(true);
                              }}
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
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}
      </List>

      <TaskActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        onSubmit={handleSubmitTaskAction}
      />
    </Container>
  );
};

export default TaskListPage;
