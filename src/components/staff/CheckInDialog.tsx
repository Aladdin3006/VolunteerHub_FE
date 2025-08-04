// CheckInDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
  Paper,
  Box,
  Breadcrumbs,
  Link,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  createManualCheckin,
  getCheckinListByPhaseDay,
  getPhasesByCampaignId,
  Phase,
  PhaseDay,
} from "../../apis/staff";
import CreatePhaseModal from "./CreatePhaseModal";
import ManageTask from "./ManageTask";
import DepartmentManager from "./DepartmentManager";
import VolunteerRequestsModal from "./VolunteerRequestsModal";
import IssueDialog from "./IssueDialog";

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  phase?: Phase | null;
  phaseDay?: PhaseDay | null;
  onPhaseSelect: (phase: Phase | null) => void;
  onPhaseDaySelect: (phaseDay: PhaseDay | null) => void;
  title?: string;
  selectedCampaign?: { name: string }; // Added to match CreatePhaseModal
  onTabChange?: (tabIndex: number) => void;
}

interface CheckInStatus {
  userId: string;
  fullName: string;
  checkin: boolean;
  method?: string;
  checkinAt?: Date;
}

const TabPanel: React.FC<{
  children?: React.ReactNode;
  index: number;
  value: number;
}> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const CheckInDialog: React.FC<CheckInDialogProps> = ({
  open,
  onClose,
  campaignId,
  phase,
  phaseDay,
  onPhaseSelect,
  onPhaseDaySelect,
  title = "Check-In Management",
  selectedCampaign = { name: "Campaign" },
  onTabChange,
}) => {
  const [checkins, setCheckins] = useState<CheckInStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [phaseDays, setPhaseDays] = useState<PhaseDay[]>([]);
  const [activeTab, setActiveTab] = useState(2); // Default to CheckIn tab

  useEffect(() => {
    if (open && campaignId) {
      fetchPhases();
    }
  }, [open, campaignId]);

  useEffect(() => {
    if (phase) {
      setPhaseDays(phase.phaseDays);
    }
  }, [phase]);

  useEffect(() => {
    if (phaseDay) {
      fetchCheckins();
    }
  }, [phaseDay]);

  const fetchPhases = async () => {
    try {
      setLoading(true);
      const data = await getPhasesByCampaignId(campaignId);
      setPhases(data);
    } catch (error) {
      console.error("Error fetching phases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckins = async () => {
    if (!phaseDay) return;
    try {
      setLoading(true);
      const data = await getCheckinListByPhaseDay(phaseDay._id);
      setCheckins(data);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (userId: string) => {
    if (!phaseDay) return;
    try {
      await createManualCheckin({
        userId,
        campaignId,
        phaseId: phaseDay.phaseId,
        phasedayId: phaseDay._id,
      });
      fetchCheckins();
    } catch (error) {
      console.error("Error creating check-in:", error);
    }
  };

  const goBackToPhases = () => {
    onPhaseSelect(null as any);
    onPhaseDaySelect(null as any);
  };

  const goBackToPhaseDays = () => {
    onPhaseDaySelect(null as any);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (onTabChange && newValue !== 2) {
      onTabChange(newValue);
      onClose();
    }
  };

  // Render when no phase is selected
  if (!phase) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
          Manage "{selectedCampaign.name}" - "
          {
            {
              0: "Phases",
              1: "Tasks",
              2: "CheckIn",
              3: "Departments",
              4: "Volunteers",
              5: "Issues",
            }[activeTab]
          }
          "
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="campaign management tabs"
            sx={{ mt: 2 }}
          >
            <Tab label="Phases" />
            <Tab label="Tasks" />
            <Tab label="CheckIn" />
            <Tab label="Departments" />
            <Tab label="Volunteers" />
            <Tab label="Issues" />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          <TabPanel value={activeTab} index={0}>
            <CreatePhaseModal
              campaignId={campaignId}
              open={activeTab === 0}
              onClose={onClose}
              selectedCampaign={selectedCampaign}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <ManageTask campaignId={campaignId} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper>
                <List>
                  {phases.map((p) => (
                    <ListItemButton
                      key={p._id}
                      onClick={() => onPhaseSelect(p)}
                      divider
                    >
                      <ListItemText
                        primary={p.name}
                        secondary={`${new Date(
                          p.startDate
                        ).toLocaleDateString()} - ${new Date(
                          p.endDate
                        ).toLocaleDateString()}`}
                      />
                    </ListItemButton>
                  ))}
                  {phases.length === 0 && (
                    <Typography p={2} color="textSecondary">
                      No phases available
                    </Typography>
                  )}
                </List>
              </Paper>
            )}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <DepartmentManager campaignId={campaignId} />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <VolunteerRequestsModal
              open={true}
              onClose={onClose}
              campaignId={campaignId}
              selectedCampaign={selectedCampaign}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <IssueDialog
              open={activeTab === 5}
              onClose={onClose}
              campaignId={campaignId}
              selectedCampaign={{ name: selectedCampaign.name || "Campaign" }}
            />
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Render when no phase day is selected
  if (!phaseDay) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
          Manage "{selectedCampaign.name}" - "
          {
            {
              0: "Phases",
              1: "Tasks",
              2: "CheckIn",
              3: "Departments",
              4: "Volunteers",
              5: "Issues",
            }[activeTab]
          }
          "
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="campaign management tabs"
            sx={{ mt: 2 }}
          >
            <Tab label="Phases" />
            <Tab label="Tasks" />
            <Tab label="CheckIn" />
            <Tab label="Departments" />
            <Tab label="Volunteers" />
            <Tab label="Issues" />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          <TabPanel value={activeTab} index={0}>
            <CreatePhaseModal
              campaignId={campaignId}
              open={activeTab === 0}
              onClose={onClose}
              selectedCampaign={selectedCampaign}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <ManageTask campaignId={campaignId} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <Breadcrumbs sx={{ mb: 1 }}>
              <Link component="button" onClick={goBackToPhases}>
                Phases
              </Link>
              <Typography>{phase.name}</Typography>
            </Breadcrumbs>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <IconButton onClick={goBackToPhases} size="small" sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6">{title}</Typography>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper>
                <List>
                  {phaseDays.map((day) => (
                    <ListItemButton
                      key={day._id}
                      onClick={() => onPhaseDaySelect(day)}
                      divider
                    >
                      <ListItemText
                        primary={new Date(day.date).toLocaleDateString()}
                        secondary={day.checkinLocation?.address}
                      />
                    </ListItemButton>
                  ))}
                  {phaseDays.length === 0 && (
                    <Typography p={2} color="textSecondary">
                      No phase days available
                    </Typography>
                  )}
                </List>
              </Paper>
            )}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <DepartmentManager campaignId={campaignId} />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <VolunteerRequestsModal
              open={true}
              onClose={onClose}
              campaignId={campaignId}
              selectedCampaign={selectedCampaign}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <IssueDialog
              open={activeTab === 5}
              onClose={onClose}
              campaignId={campaignId}
              selectedCampaign={{ name: selectedCampaign.name || "Campaign" }}
              onTabChange={(tabIndex) => {
                setActiveTab(tabIndex);
              }}
            />
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Render when phase and phase day are selected
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="campaign management tabs"
          sx={{ mt: 2 }}
        >
          <Tab label="Phases" />
          <Tab label="Tasks" />
          <Tab label="CheckIn" />
          <Tab label="Departments" />
          <Tab label="Volunteers" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        <TabPanel value={activeTab} index={0}>
          <CreatePhaseModal
            campaignId={campaignId}
            open={activeTab === 0}
            onClose={onClose}
            selectedCampaign={selectedCampaign}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ManageTask campaignId={campaignId} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Breadcrumbs sx={{ mb: 1 }}>
            <Link component="button" onClick={goBackToPhases}>
              Phases
            </Link>
            <Link component="button" onClick={goBackToPhaseDays}>
              {phase.name}
            </Link>
            <Typography>
              {new Date(phaseDay.date).toLocaleDateString()}
            </Typography>
          </Breadcrumbs>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <IconButton onClick={goBackToPhaseDays} size="small" sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">{title}</Typography>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper>
              <List>
                {checkins.map((checkin) => (
                  <ListItemButton key={checkin.userId} divider>
                    <ListItemText
                      primary={checkin.fullName}
                      secondary={
                        checkin.checkin
                          ? `Checked in at ${new Date(
                              checkin.checkinAt!
                            ).toLocaleTimeString()} (${checkin.method})`
                          : "Not checked in"
                      }
                    />
                    <Button
                      variant="contained"
                      color={checkin.checkin ? "success" : "primary"}
                      disabled={checkin.checkin}
                      onClick={() => handleCheckIn(checkin.userId)}
                      sx={{ minWidth: 120 }}
                    >
                      {checkin.checkin ? "Checked In" : "Check In"}
                    </Button>
                  </ListItemButton>
                ))}
                {checkins.length === 0 && (
                  <Typography p={2} color="textSecondary">
                    No volunteers available for check-in
                  </Typography>
                )}
              </List>
            </Paper>
          )}
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <DepartmentManager campaignId={campaignId} />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <VolunteerRequestsModal
            open={true}
            onClose={onClose}
            campaignId={campaignId}
            selectedCampaign={selectedCampaign}
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckInDialog;
