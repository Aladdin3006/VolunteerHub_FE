import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Paper,
  DialogActions,
  Button,
} from "@mui/material";
import { Campaign, getStaffCampaigns } from "../../apis/staff";
import CreatePhaseModal from "../../components/staff/CreatePhaseModal";
import ManageTask from "../../components/staff/ManageTask";
import DepartmentManager from "../../components/staff/DepartmentManager";
import VolunteerRequestsModal from "../../components/staff/VolunteerRequestsModal";
import OverViewCampaign from "../../components/staff/OverViewCampaign";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ManagerCampaignStaff: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [overviewModalOpen, setOverviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getStaffCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleOpenModal = (campaign: Campaign, tabIndex: number = 0) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
    setActiveTab(tabIndex);
  };

  const handleOpenOverviewModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setOverviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setOverviewModalOpen(true);
  };

  const handleCloseOverviewModal = () => {
    setOverviewModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: { xs: 2, sm: 3 },
        backgroundColor: "#f5f5f5",
        position: "relative",
        left: 0,
        top: 0,
      }}
    >
      <Box sx={{ mb: 4, marginTop: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Campaign Management
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : campaigns.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No campaigns available
          </Typography>
          <Typography variant="body2" color="textSecondary">
            You haven't been assigned to any campaigns yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map((campaign) => (
            <Grid key={campaign._id}>
              <Card
                className="campaign-card"
                onClick={() => handleOpenOverviewModal(campaign)}
              >
                <CardContent>
                  <Box
                    component="img"
                    src={
                      campaign.image || "https://via.placeholder.com/300x150"
                    }
                    alt={campaign.name}
                    sx={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {campaign.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Management Modal */}
      {selectedCampaign && (
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            Manage "{selectedCampaign.name}" - "
            {
              {
                0: "Phases",
                1: "Tasks",
                2: "Departments",
                3: "Volunteers",
              }[activeTab]
            }
            "
          </DialogTitle>
          <DialogContent>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="campaign management tabs"
            >
              <Tab label="Phases" />
              <Tab label="Tasks" />
              <Tab label="Departments" />
              <Tab label="Volunteers" />
            </Tabs>
            <TabPanel value={activeTab} index={0}>
              <CreatePhaseModal
                campaignId={selectedCampaign._id}
                open={activeTab === 0}
                onClose={handleCloseModal}
                selectedCampaign={selectedCampaign}
              />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <ManageTask campaignId={selectedCampaign._id} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <DepartmentManager campaignId={selectedCampaign._id} />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <VolunteerRequestsModal
                open={true}
                onClose={handleCloseModal}
                campaignId={selectedCampaign._id}
                selectedCampaign={{ name: selectedCampaign.name }}
              />
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Overview Modal */}
      {selectedCampaign && (
        <OverViewCampaign
          campaign={selectedCampaign}
          open={overviewModalOpen}
          onClose={() => {
            handleCloseOverviewModal();
            setModalOpen(false); // Ensure management modal is also closed
          }}
          onOpenManagement={(tabIndex) => {
            handleCloseOverviewModal();
            handleOpenModal(selectedCampaign, tabIndex);
          }}
        />
      )}
    </Box>
  );
};

export default ManagerCampaignStaff;
