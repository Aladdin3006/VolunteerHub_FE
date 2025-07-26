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
  IconButton,
} from '@mui/material';
import { ExpandMore, ExpandLess, Minimize, Maximize } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { fetchPhasesByCampaignId, submitTaskApi } from '../../apis/phase';
import TaskActionModal from './TaskActionModal';
import { getCampaignVolunteerDetail } from '../../apis/campaign';
import CampaignChatModal from '../../components/chat/CampaignChat';
import { reportIssueApi } from '../../apis/issue';
import FaceCheckinModal from './FaceCheckinModal';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: {
    status: string;
  };
  assignedUsers: {
    userId: string;
    submission?: {
      content: string;
      images: string[];
      submittedAt: string;
      submittedBy: string;
    };
    review?: {
      status: string;
      evaluation?: string;
      staffComment?: string;
      reviewedBy?: string;
      reviewedAt?: string;
    };
  }[];
}

interface PhaseDay {
  _id: string;
  date: string;
  tasks: Task[];
  checkinLocation: {
    coordinates: [number, number];
    address: string;
  };
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
  const [modalMode, setModalMode] = useState<'complete' | 'search'>('complete');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState<string>('');
  const [campaignImageUrl, setCampaignImageUrl] = useState<string | null>(null);
  const [checkedInPhaseDays, setCheckedInPhaseDays] = useState<string[]>([]);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [selectedPhaseDayId, setPhaseDayId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedCheckinLocation, setSelectedCheckinLocation] = useState<{ coordinates: [number, number] } | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('checkedInPhaseDays');
    if (saved) {
      try {
        setCheckedInPhaseDays(JSON.parse(saved));
      } catch (err) {
        console.error('Error parsing localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('checkedInPhaseDays', JSON.stringify(checkedInPhaseDays));
  }, [checkedInPhaseDays]);

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

  const openModalWithTaskId = (taskId: string, mode: 'complete' | 'search') => {
    setSelectedTaskId(taskId);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleCheckIn = (
    phaseId: string,
    phaseDayId: string,
    checkinLocation: { coordinates: [number, number]; address: string }
  ) => {
    setSelectedPhaseId(phaseId);
    setPhaseDayId(phaseDayId);
    setSelectedCheckinLocation(checkinLocation);
    setCheckinModalOpen(true);
  };

  const handleCheckinSuccess = (phaseDayId: string) => {
    const idStr = String(phaseDayId);
    setCheckedInPhaseDays((prev) => {
      if (prev.includes(idStr)) {
        return prev;
      }
      const updated = [...prev, idStr];
      console.log("📝 Updated checkedInPhaseDays:", updated);
      return updated;
    });
    setCheckinModalOpen(false);
  };

  const handleSubmitTaskAction = async (taskId: string, content: string, images: File[]) => {
    console.log('Đã submit:', { taskId, content, images, mode: modalMode });
    const userString = localStorage.getItem('user');
    const token = userString ? JSON.parse(userString).token : null;

    if (!token || !taskId) {
      alert('Thiếu token hoặc taskId!');
      return;
    }

    try {
      if (modalMode === 'complete') {
        await submitTaskApi(taskId, content, images, token);
        alert('Gửi hoàn thành nhiệm vụ thành công');
      } else if (modalMode === 'search') {
        const [title, ...descParts] = content.trim().split('\n');
        const description = descParts.join('\n') || 'Không có mô tả chi tiết';
        await reportIssueApi(title || 'Không có tiêu đề', description, taskId, token);
        alert('Gửi báo cáo sự cố thành công');
      }
    } catch (err) {
      alert('Bạn đã nộp submission cho task này');
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
                        setExpandedPhaseDay(String(day._id) === String(expandedPhaseDay) ? null : String(day._id))
                      }
                      sx={{
                        bgcolor: '#ffffff',
                        border: '1px solid',
                        borderColor: 'grey.200',
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
                          {(() => {
                            const isCheckedIn = checkedInPhaseDays.includes(String(day._id));
                            const toggleIcon = expandedPhaseDay === day._id ? <ExpandLess /> : <ExpandMore />;

                            return (
                              <>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color={isCheckedIn ? "success" : "info"}
                                  disabled={isCheckedIn}
                                  onClick={() => handleCheckIn(phase._id, day._id, day.checkinLocation)}
                                >
                                  {isCheckedIn ? "✅ Đã check-in" : "Check-in"}
                                </Button>
                                {toggleIcon}
                              </>
                            );
                          })()}
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
                                    label={task.submission?.status || 'Đã nộp'}
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
                                      onClick={() => openModalWithTaskId(task._id, 'search')}
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

      <Box
        sx={{
          position: 'fixed',
          bottom: 76,
          right: 16,
          width: { xs: '90%', sm: 360 },
          height: isChatMinimized ? 48 : 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 6,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'primary.main',
            color: 'white',
            p: 1,
            cursor: 'move',
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Chat chiến dịch: {campaignName}
          </Typography>
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setIsChatMinimized(!isChatMinimized)}
          >
            {isChatMinimized ? <Maximize /> : <Minimize />}
          </IconButton>
        </Box>
        {!isChatMinimized && (
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            <CampaignChatModal campaignId={campaignId || ''} />
          </Box>
        )}
      </Box>

      <TaskActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        taskId={selectedTaskId}
        onSubmit={handleSubmitTaskAction}
      />

      {checkinModalOpen && selectedPhaseId && selectedPhaseDayId && selectedCheckinLocation && (
        <>
          {console.log("🔍 Sending to Modal:", {
            selectedPhaseDayId,
            selectedPhaseId,
            selectedCheckinLocation,
          })}
          <FaceCheckinModal
            open={checkinModalOpen}
            onClose={() => setCheckinModalOpen(false)}
            campaignId={campaignId || ""}
            phaseId={selectedPhaseId}
            phaseDayId={selectedPhaseDayId}
            checkinLocation={selectedCheckinLocation}
            onCheckinSuccess={handleCheckinSuccess}
          />
        </>
      )}
    </Container>
  );
};

export default TaskListPage;