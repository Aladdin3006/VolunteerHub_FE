import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarToday,
  Category,
  PlayArrow,
  Info,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  location: any;
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'ongoing' | 'upcoming' | 'ended';
  currentPhase?: {
    name: string;
    startDate: Date;
    endDate: Date;
    description: string;
  };
  phases: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    description: string;
  }[];
  imageUrl?: string;
  category: string;
  registrationDate: Date;
}

interface CampaignCardProps {
  campaign: Campaign;
  onClick?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'success';
      case 'upcoming':
        return 'warning';
      case 'ended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <PlayArrow />;
      case 'upcoming':
        return <Schedule />;
      case 'ended':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const calculateProgress = () => {
    if (campaign.status !== 'ongoing') return 0;
    
    const now = new Date();
    const start = campaign.startDate;
    const end = campaign.endDate;
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
  };

  const calculatePhaseProgress = () => {
    if (!campaign.currentPhase) return 0;
    
    const now = new Date();
    const start = campaign.currentPhase.startDate;
    const end = campaign.currentPhase.endDate;
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
  };

  const progress = calculateProgress();
  const phaseProgress = calculatePhaseProgress();

  return (
    <Card 
      onClick={onClick}
      sx={{ 
        width: 360,
        height: 450,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardMedia
        component="img"
        height="250"
        image={campaign.imageUrl || 'https://via.placeholder.com/450x250'}
        alt={campaign.name}
        sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2, minHeight: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, maxWidth: '70%' }}>
            {campaign.name}
          </Typography>
          <Chip
            icon={getStatusIcon(campaign.status)}
            label={campaign.status === 'ongoing' ? 'Đang diễn ra' : 
                   campaign.status === 'upcoming' ? 'Chưa diễn ra' : 'Đã kết thúc'}
            color={getStatusColor(campaign.status)}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <Category sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {campaign.location.address}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
          </Typography>
        </Box>

        {campaign.status === 'ongoing' && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Tiến độ tổng thể
              </Typography>
              <Box display="flex" alignItems="center">
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
            </Box>

            {campaign.currentPhase && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Giai đoạn hiện tại
                </Typography>
                <Box 
                  sx={{ 
                    backgroundColor: 'primary.light',
                    borderRadius: 2,
                    p: 2,
                    mb: 1
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    {campaign.currentPhase.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {formatDate(campaign.currentPhase.startDate)} - {formatDate(campaign.currentPhase.endDate)}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <LinearProgress 
                      variant="determinate" 
                      value={phaseProgress} 
                      sx={{ flex: 1, mr: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {phaseProgress}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}

        <Divider sx={{ mt: 2, mb: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Đăng ký: {formatDate(campaign.startDate)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;