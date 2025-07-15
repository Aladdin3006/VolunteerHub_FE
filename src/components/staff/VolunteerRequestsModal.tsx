import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import { Volunteer, getCampaignVolunteers, acceptVolunteer, rejectVolunteer } from "../../apis/staff";
import CreatePhaseModal from "../../components/staff/CreatePhaseModal";
import ManageTask from "../../components/staff/ManageTask";
import DepartmentManager from "../../components/staff/DepartmentManager";

interface VolunteerRequestsModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  selectedCampaign: { name: string };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const VolunteerRequestsModal: React.FC<VolunteerRequestsModalProps> = ({
  open,
  onClose,
  campaignId,
  selectedCampaign,
}) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptingVolunteers, setAcceptingVolunteers] = useState<Set<string>>(new Set());
  const [rejectingVolunteers, setRejectingVolunteers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(3); // Default to Volunteers tab

  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!campaignId) return;
      try {
        setLoading(true);
        const data = await getCampaignVolunteers(campaignId);
        setVolunteers(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch volunteers. Please try again.");
        console.error("Error fetching volunteers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchVolunteers();
    }
  }, [campaignId, open]);

  const handleAcceptVolunteer = async (userId: string) => {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      setError("Invalid user ID. Please try again or contact support.");
      return;
    }

    try {
      setAcceptingVolunteers((prev) => new Set(prev).add(userId));
      await acceptVolunteer(campaignId, userId);
      setVolunteers((prev) =>
        prev.map((v) =>
          v.user._id === userId ? { ...v, status: "approved" } : v
        )
      );
      setError(null);
    } catch (error) {
      console.error("Error accepting volunteer:", error);
      setError("Failed to accept volunteer. Please try again.");
    } finally {
      setAcceptingVolunteers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRejectVolunteer = async (userId: string) => {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      setError("Invalid user ID. Please try again or contact support.");
      return;
    }

    try {
      setRejectingVolunteers((prev) => new Set(prev).add(userId));
      await rejectVolunteer(campaignId, userId);
      setVolunteers((prev) =>
        prev.map((v) =>
          v.user._id === userId ? { ...v, status: "rejected" } : v
        )
      );
      setError(null);
    } catch (error) {
      console.error("Error rejecting volunteer:", error);
      setError("Failed to reject volunteer. Please try again.");
    } finally {
      setRejectingVolunteers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "pending": return "warning";
      case "rejected": return "error";
      default: return "default";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const pendingVolunteers = volunteers.filter((v) => v.status === "pending");
  const approvedVolunteers = volunteers.filter((v) => v.status === "approved");
  const rejectedVolunteers = volunteers.filter((v) => v.status === "rejected");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="management tabs">
          <Tab label="Phases" />
          <Tab label="Tasks" />
          <Tab label="Departments" />
          <Tab label="Volunteers" />
        </Tabs>
        <TabPanel value={activeTab} index={0}>
          <CreatePhaseModal campaignId={campaignId} open={activeTab === 0} onClose={onClose} selectedCampaign={selectedCampaign} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ManageTask campaignId={campaignId} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <DepartmentManager campaignId={campaignId} />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h6" gutterBottom>Volunteer Requests</Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ width: "100%", minHeight: 300 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "center" }}>
                  <Chip
                    label={`Pending: ${pendingVolunteers.length}`}
                    color="warning"
                    variant="outlined"
                  />
                  <Chip
                    label={`Approved: ${approvedVolunteers.length}`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`Rejected: ${rejectedVolunteers.length}`}
                    color="error"
                    variant="outlined"
                  />
                </Box>
                {volunteers.length === 0 ? (
                  <Alert severity="info">No volunteer requests found for this campaign.</Alert>
                ) : (
                  <Grid container spacing={3} direction="column">
                    <Grid>
                      <Typography variant="subtitle1" gutterBottom>
                        Pending Volunteers
                      </Typography>
                      <TableContainer component={Paper} sx={{ width: "100%" }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Registered At</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pendingVolunteers.map((volunteer) => (
                              <TableRow key={volunteer.user._id}>
                                <TableCell>{volunteer.user.fullName}</TableCell>
                                <TableCell>{volunteer.user.email}</TableCell>
                                <TableCell>{volunteer.user.phone}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={volunteer.status.toUpperCase()}
                                    color={getStatusColor(volunteer.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{formatDate(volunteer.registeredAt)}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() => handleAcceptVolunteer(volunteer.user._id)}
                                    disabled={acceptingVolunteers.has(volunteer.user._id)}
                                  >
                                    {acceptingVolunteers.has(volunteer.user._id) ? "Approving" : "Approve"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" gutterBottom>
                        Approved Volunteers
                      </Typography>
                      <TableContainer component={Paper} sx={{ width: "100%" }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Registered At</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {approvedVolunteers.map((volunteer) => (
                              <TableRow key={volunteer.user._id}>
                                <TableCell>{volunteer.user.fullName}</TableCell>
                                <TableCell>{volunteer.user.email}</TableCell>
                                <TableCell>{volunteer.user.phone}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={volunteer.status.toUpperCase()}
                                    color={getStatusColor(volunteer.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{formatDate(volunteer.registeredAt)}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={() => handleRejectVolunteer(volunteer.user._id)}
                                    disabled={rejectingVolunteers.has(volunteer.user._id)}
                                  >
                                    {rejectingVolunteers.has(volunteer.user._id) ? "Rejecting" : "Reject"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" gutterBottom>
                        Rejected Volunteers
                      </Typography>
                      <TableContainer component={Paper} sx={{ width: "100%" }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Registered At</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rejectedVolunteers.map((volunteer) => (
                              <TableRow key={volunteer.user._id}>
                                <TableCell>{volunteer.user.fullName}</TableCell>
                                <TableCell>{volunteer.user.email}</TableCell>
                                <TableCell>{volunteer.user.phone}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={volunteer.status.toUpperCase()}
                                    color={getStatusColor(volunteer.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{formatDate(volunteer.registeredAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerRequestsModal;