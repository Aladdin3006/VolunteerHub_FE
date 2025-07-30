import React, { useState, useEffect, useRef } from "react";
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
  LinearProgress,
} from "@mui/material";
import {
  FiberManualRecord as FiberManualRecordIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  INewCampaignDialogRef,
  NewCampaignDialog,
} from "../../components/staff/NewCampaignDialog";
import {
  IUpdateCampaignDialogRef,
  UpdateCampaignDialog,
} from "../../components/staff/UpdateCampaignDialog";
import { Campaign, getStaffCampaigns, Phase, PhaseDay } from "../../apis/staff";
import CreatePhaseModal from "../../components/staff/CreatePhaseModal";
import ManageTask from "../../components/staff/ManageTask";
import DepartmentManager from "../../components/staff/DepartmentManager";
import VolunteerRequestsModal from "../../components/staff/VolunteerRequestsModal";
import CheckInDialog from "@/components/staff/CheckInDialog";

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
  const location = useLocation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(
    location.state?.tabIndex || 0
  );
  const newCampaignDialogRef = useRef<INewCampaignDialogRef | null>(null);
  const updateCampaignDialogRef = useRef<IUpdateCampaignDialogRef | null>(null);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<PhaseDay | null>(
    null
  );
  const [activeLink, setActiveLink] = useState<"ongoing" | "finished">(
    "ongoing"
  );
  const [filterStatus, setFilterStatus] = useState<string>("");
  const navigate = useNavigate();

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

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFilterStatus(["", "in-progress", "upcoming", "completed"][newValue]);
  };

  const handleAfterSubmit = async () => {
    try {
      const data = await getStaffCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error refreshing campaigns:", error);
    }
  };

  const handleOpenUpdateCampaign = (campaignId: string) => {
    updateCampaignDialogRef.current?.open(campaignId);
  };

  const getStatusCount = (status: string) => {
    return campaigns.filter((campaign) => campaign.status === status).length;
  };

  const getCompletedPhasesCount = (campaign: Campaign) => {
    return (
      campaign.phases?.filter((phase) => phase.status === "completed").length ||
      0
    );
  };

  const getTotalPhasesCount = (campaign: Campaign) => {
    return campaign.phases?.length || 0;
  };

  const getInProgressPhases = (campaign: Campaign) => {
    return (
      campaign.phases
        ?.filter((phase) => phase.status === "in-progress")
        .map((phase) => phase.name)
        .join(", ") || "No active phases"
    );
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    filterStatus ? campaign.status === filterStatus : true
  );

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
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeLink === "ongoing" ? 0 : 1}
          onChange={(_, newValue) => {
            const link = newValue === 0 ? "ongoing" : "finished";
            setActiveLink(link);
            if (link === "finished") {
              navigate("/staff/donations");
            }
          }}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#1976d2",
            },
          }}
        >
          <Tab
            label="Quản lý Chiến dịch"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            }}
          />
          <Tab
            label="Quản lý Quyên góp"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            }}
          />
        </Tabs>
      </Box>
      <Box
        sx={{
          mb: 4,
          marginTop: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Campaign Management
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="campaign status tabs"
          >
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <ListAltIcon sx={{ fontSize: "small", mr: 1 }} />
                  Tất cả ({campaigns.length})
                </Box>
              }
              value={0}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <FiberManualRecordIcon
                    sx={{ color: "green", fontSize: "small", mr: 1 }}
                  />
                  Đang diễn ra ({getStatusCount("in-progress")})
                </Box>
              }
              value={1}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <ScheduleIcon sx={{ fontSize: "small", mr: 1 }} />
                  Chưa diễn ra ({getStatusCount("upcoming")})
                </Box>
              }
              value={2}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ fontSize: "small", mr: 1 }} />
                  Đã kết thúc ({getStatusCount("completed")})
                </Box>
              }
              value={3}
            />
          </Tabs>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            newCampaignDialogRef.current?.open();
          }}
        >
          Create New Campaign
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredCampaigns.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No campaigns available
          </Typography>
          <Typography variant="body2" color="textSecondary">
            You haven't been assigned to any campaigns yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} justifyContent="flex-start">
          {filteredCampaigns.map((campaign) => (
            <Grid key={campaign._id}>
              <Link
                to={`/staff/campaigns/${campaign._id}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  className="campaign-card"
                  sx={{
                    transition: "box-shadow 0.3s ease",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    width: 300,
                    mx: "auto",
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Image section */}
                    <Box
                      component="img"
                      src={
                        campaign.image ||
                        "https://via.placeholder.com/300x150?text=No+Image"
                      }
                      alt={campaign.name}
                      sx={{
                        width: "100%",
                        height: 150,
                        objectFit: "cover",
                        backgroundColor: campaign.image
                          ? "transparent"
                          : "#f5f5f5",
                      }}
                    />
                    {/* Content section */}
                    <Box sx={{ p: 2, flex: 1 }}>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {campaign.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </Typography>
                      {campaign.status !== "completed" && (
                        <>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            mt={1}
                          >
                            Tiến độ tổng thể
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={100}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {getCompletedPhasesCount(campaign)}/
                            {getTotalPhasesCount(campaign)} Phases completed
                          </Typography>
                          <Box
                            sx={{
                              border: "1px solid #1976d2",
                              borderRadius: "4px",
                              p: 1,
                              mt: 1,
                            }}
                          >
                            <Typography variant="body2" color="textSecondary">
                              Giai đoạn hiện tại
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {getInProgressPhases(campaign)}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Link>
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
                2: "CheckIn",
                3: "Departments",
                4: "Volunteers",
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
              <Tab label="CheckIn" />
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
              <CheckInDialog
                open={activeTab === 2}
                onClose={handleCloseModal}
                campaignId={selectedCampaign?._id}
                phase={selectedPhase}
                phaseDay={selectedPhaseDay}
                onPhaseSelect={setSelectedPhase}
                onPhaseDaySelect={setSelectedPhaseDay}
              />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <DepartmentManager campaignId={selectedCampaign._id} />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <VolunteerRequestsModal
                open={activeTab === 4}
                onClose={handleCloseModal}
                campaignId={selectedCampaign._id}
                selectedCampaign={{
                  name: selectedCampaign?.name || "Campaign",
                }}
                onTabChange={(tabIndex) => {
                  setActiveTab(tabIndex);
                }}
              />
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* New Campaign Dialog */}
      <NewCampaignDialog
        ref={newCampaignDialogRef}
        afterSubmit={handleAfterSubmit}
      />

      {/* Update Campaign Dialog */}
      <UpdateCampaignDialog
        ref={updateCampaignDialogRef}
        afterSubmit={handleAfterSubmit}
      />
    </Box>
  );
};

export default ManagerCampaignStaff;
