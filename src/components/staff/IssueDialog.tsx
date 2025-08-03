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
  Tabs,
  Tab,
  DialogContentText,
  Avatar,
  ListItem,
  ListItemAvatar,
} from "@mui/material";
import { ISSUE_API, Issue } from "../../apis/issue";
import CreatePhaseModal from "./CreatePhaseModal";
import ManageTask from "./ManageTask";
import DepartmentManager from "./DepartmentManager";
import CheckInDialog from "./CheckInDialog";
import { Phase, PhaseDay } from "@/apis/staff";
import VolunteerRequestsModal from "./VolunteerRequestsModal";

interface IssueDialogProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  title?: string;
  selectedCampaign?: { name: string };
  onTabChange?: (tabIndex: number) => void;
}

interface DetailDialogProps {
  open: boolean;
  onClose: () => void;
  issueId: string | null;
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

const IssueDetailDialog: React.FC<DetailDialogProps> = ({
  open,
  onClose,
  issueId,
}) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && issueId) {
      const fetchIssue = async () => {
        try {
          setLoading(true);
          const response = await ISSUE_API.getIssueById(issueId);
          setIssue(response.data);
        } catch (error) {
          console.error("Error fetching issue details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchIssue();
    }
  }, [open, issueId]);

  if (!issue) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chi tiết Issue</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <DialogContentText>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                src={issue.reportedBy.avatar || "/default-avatar.png"}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography variant="body1">
                <strong>Người gửi:</strong> {issue.reportedBy.fullName}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Tiêu đề:</strong> {issue.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Loại:</strong>{" "}
              {issue.type === "task_issue"
                ? "Task Issue"
                : "Campaign Withdrawal"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Mô tả:</strong> {issue.description}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Trạng thái:</strong> {issue.status}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(issue.createdAt).toLocaleString("vi-VN")}
            </Typography>
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

const IssueDialog: React.FC<IssueDialogProps> = ({
  open,
  onClose,
  campaignId,
  title = "Quản lý Issues",
  selectedCampaign = { name: "Campaign" },
  onTabChange,
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(5); // Issues tab
  const [issueTypeTab, setIssueTypeTab] = useState(0); // 0: task_issue, 1: campaign_withdrawal
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<PhaseDay | null>(
    null
  );

  const handleOpenCheckInDialog = (phase: Phase, phaseDay: PhaseDay) => {
    setSelectedPhase(phase);
    setSelectedPhaseDay(phaseDay);
  };

  useEffect(() => {
    if (open && campaignId) {
      fetchIssues();
    }
  }, [open, campaignId, issueTypeTab]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const type = issueTypeTab === 0 ? "task_issue" : "campaign_withdrawal";
      const data = await ISSUE_API.getIssues(
        { type },
        {
          params: {
            "relatedEntity.entityId": campaignId,
          },
        }
      );
      setIssues(data.data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClosedIssue = async (issueId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("User context:", user); // Debug: Check user._id
      await ISSUE_API.updateIssue(issueId, { status: "closed" });
      fetchIssues(); // Refresh issues after resolving
    } catch (error) {
      console.error("Error resolving issue:", error);
    }
  };

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssueId(issue._id);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedIssueId(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (onTabChange && newValue !== 5) {
      onTabChange(newValue);
      onClose();
    }
  };

  const handleIssueTypeTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setIssueTypeTab(newValue);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
          Quản lý "{selectedCampaign.name}" - "
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
            <CheckInDialog
              campaignId={campaignId}
              open={activeTab === 2}
              onClose={onClose}
              selectedCampaign={selectedCampaign}
              onTabChange={onTabChange}
              phase={selectedPhase}
              phaseDay={selectedPhaseDay}
              onPhaseSelect={setSelectedPhase}
              onPhaseDaySelect={setSelectedPhaseDay}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <DepartmentManager campaignId={campaignId} />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <VolunteerRequestsModal
              open={activeTab === 4}
              onClose={onClose}
              campaignId={campaignId}
              selectedCampaign={{
                name: selectedCampaign.name || "Campaign",
              }}
              onTabChange={(tabIndex) => {
                setActiveTab(tabIndex);
              }}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <Tabs
              value={issueTypeTab}
              onChange={handleIssueTypeTabChange}
              aria-label="issue type tabs"
              variant="fullWidth"
              sx={{ mb: 2, width: "100%" }}
            >
              <Tab label="Nhiệm vụ" />
              <Tab label="Chiến dịch" />
            </Tabs>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper>
                <List>
                  {issues.map((issue) => (
                    <ListItemButton key={issue._id} divider>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexGrow: 1,
                        }}
                      >
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar
                              src={
                                issue.reportedBy.avatar || "/default-avatar.png"
                              }
                              sx={{ width: 32, height: 32, mr: 1 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={issue.title}
                            secondary={`Người gửi: ${issue.reportedBy.fullName}`}
                          />
                        </ListItem>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color={
                            issue.status === "closed" ? "success" : "primary"
                          }
                          disabled={issue.status === "closed"}
                          onClick={() => handleClosedIssue(issue._id)}
                          sx={{ minWidth: 120 }}
                        >
                          {issue.status === "closed"
                            ? "Đã giải quyết"
                            : "Giải quyết"}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewDetails(issue)}
                          sx={{ minWidth: 120 }}
                        >
                          Xem chi tiết
                        </Button>
                      </Box>
                    </ListItemButton>
                  ))}
                  {issues.length === 0 && (
                    <Typography p={2} color="textSecondary">
                      Không có issues nào
                    </Typography>
                  )}
                </List>
              </Paper>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <IssueDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        issueId={selectedIssueId}
      />
    </>
  );
};

export default IssueDialog;
