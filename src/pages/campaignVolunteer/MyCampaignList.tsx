import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Card,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShareIcon from '@mui/icons-material/Share';
import axios from 'axios';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from 'react-router-dom';
import TaskListModal from './TaskListModal'; // Import component mới

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  backgroundColor: '#fff',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
  maxWidth: 1050,
  margin: '0 auto',
  minHeight: 150,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    minHeight: 'auto',
  },
}));

const CampaignContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#F5F5F5',
  minHeight: '100vh',
}));

const CardImage = styled(Box)(({ theme }) => ({
  width: 235,
  height: 235,
  flexShrink: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '8px 0 0 8px',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: 150,
    borderRadius: '8px 8px 0 0',
  },
}));

const CardContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: 'calc(100% - 100px)',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

// Component Campaign
const Campaign = ({ title, date, time, location, description, status, image, onViewDetail, onOpenTaskList, campaignId }) => (
  <StyledCard sx={{ mb: 4 }}>
    {image && <CardImage style={{ backgroundImage: `url(${image})` }} />}
    <CardContentWrapper>
      <Box>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#333', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box>
          <InfoBox>
            <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
          </InfoBox>
          <InfoBox>
            <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
            <Typography variant="body2" color="text.secondary">
              {date} | {time}
            </Typography>
          </InfoBox>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <IconButton aria-label="share" size="small">
          <ShareIcon />
        </IconButton>
        <Box>
          {status === 'finished' ? (
            <Button variant="contained" color="warning" size="medium" sx={{ textTransform: 'none' }}>
              Campaign Finished
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              size="medium"
              sx={{ textTransform: 'none' }}
              onClick={() => onOpenTaskList(campaignId)}
            >
              TaskList
            </Button>
          )}
          <Button
            variant="text"
            size="medium"
            sx={{ ml: 1, color: 'text.secondary', textTransform: 'none' }}
            onClick={onViewDetail}
          >
            View Detail
          </Button>
        </Box>
      </Box>
    </CardContentWrapper>
  </StyledCard>
);

// Main Component
const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          console.error("Không tìm thấy thông tin người dùng");
          return;
        }

        const user = JSON.parse(userString);
        const token = user.token;

        if (!token) {
          console.error("Token không tồn tại trong user");
          return;
        }

        const response = await axios.get('http://localhost:4000/campaigns/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const list = response.data?.result?.listCampaign || [];
        setCampaigns(list);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chiến dịch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleOpenTaskList = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCampaignId(null);
  };

  return (
    <>
      <Header />
      <CampaignContainer>
        <Typography
          variant="h4"
          align="left"
          sx={{
            color: '#4CAF50',
            mb: 4,
            fontWeight: 'bold',
            pl: 52,
          }}
        >
          My Campaign List
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          campaigns.map((campaign) => {
            const startDate = new Date(campaign.startDate);
            const endDate = new Date(campaign.endDate);

            return (
              <Campaign
                key={campaign._id}
                title={campaign.name}
                date={startDate.toLocaleDateString()}
                time={`${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`}
                location={campaign.location?.address || 'Unknown location'}
                description={campaign.description}
                status={campaign.status === 'completed' ? 'finished' : 'active'}
                image={campaign.image || campaign.gallery?.[0]}
                campaignId={campaign._id}
                onViewDetail={() => navigate(`/volunteer/${campaign._id}`)}
                onOpenTaskList={handleOpenTaskList}
              />
            );
          })
        )}
      </CampaignContainer>

      {/* Sử dụng TaskListModal */}
      <TaskListModal
        campaignId={selectedCampaignId}
        open={openModal}
        onClose={handleCloseModal}
      />

      <Footer />
    </>
  );
};

export default CampaignList;