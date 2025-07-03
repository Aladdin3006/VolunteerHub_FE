import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getStaffCampaigns } from '../../apis/staff';
import CreatePhaseModal from './CreatePhaseModal';

const CreatePhaseCampaign: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getStaffCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);

  const handleOpenModal = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setModalOpen(true);
  };

  return (
    <Box sx={{ 
      marginLeft: '280px', 
      padding: '30px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, marginTop: '40px' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Create Campaign Phases
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Approved Campaigns
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Select a campaign to create phases
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : campaigns.length === 0 ? (
          <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
            No approved campaigns found. Create a campaign first.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {campaigns.map((campaign) => (
              <Grid key={campaign._id}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {campaign.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {campaign.description.substring(0, 100)}...
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal(campaign._id)}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Create Phases
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <CreatePhaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        campaignId={selectedCampaign || ''}
      />
    </Box>
  );
};

export default CreatePhaseCampaign;