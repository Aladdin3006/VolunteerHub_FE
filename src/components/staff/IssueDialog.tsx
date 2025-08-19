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
  Alert,
  Snackbar,
} from "@mui/material";
import { ISSUE_API, Issue } from "../../apis/issue";
import CreatePhaseModal from "./CreatePhaseModal";
import ManageTask from "./ManageTask";
import DepartmentManager from "./DepartmentManager";
import CheckInDialog from "./CheckInDialog";
import { Phase, PhaseDay } from "@/apis/staff";
import VolunteerRequestsModal from "./VolunteerRequestsModal";
import { Campaign } from "@/pages/manager/ManagerCampaign";
import { managerCampaignService } from "@/apis/manager";
import axios from "axios";

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

interface VolunteerTask {
  _id: string;
  title: string;
  description: string;
  status: string;
  phaseDayDate: string;
  phaseName: string;
  campaignName: string;
  campaignId: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const fetchTasksByVolunteer = async (
  userId: string,
  year: number,
  month: number,
  token: string
): Promise<VolunteerTask[]> => {
  const response = await axios.get(`${API_BASE}/task/${userId}/volunteer`, {
    params: { year, month },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

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
                : issue.type === "campaign_withdrawal"
                ? "Campaign Withdrawal"
                : "Certificate Early"}
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
  const [issueTypeTab, setIssueTypeTab] = useState(0); // 0: task_issue, 1: campaign_withdrawal, 2: cert_issue
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<PhaseDay | null>(
    null
  );
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleOpenCheckInDialog = (phase: Phase, phaseDay: PhaseDay) => {
    setSelectedPhase(phase);
    setSelectedPhaseDay(phaseDay);
  };

  useEffect(() => {
    if (open && campaignId) {
      fetchIssues();
      fetchCampaignDetails();
    }
  }, [open, campaignId, issueTypeTab]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const type =
        issueTypeTab === 0
          ? "task_issue"
          : issueTypeTab === 1
          ? "campaign_withdrawal"
          : "cert_issue";

      // First, get all issues of the specific type
      const data = await ISSUE_API.getIssues({ type });

      // Filter issues by campaign ID
      const filteredIssues = await Promise.all(
        data.data.map(async (issue: Issue) => {
          if (issue.type === "task_issue") {
            // For task issues, get the campaign ID from the task
            try {
              const campaignResponse = await ISSUE_API.getCampaignByTaskId(
                issue.relatedEntity.entityId
              );
              return campaignResponse.data.campaignId === campaignId
                ? issue
                : null;
            } catch (error) {
              console.error("Error fetching campaign for task:", error);
              return null;
            }
          } else {
            // For cert_issue and campaign_withdrawal, check if entityId matches campaignId
            return issue.relatedEntity.entityId === campaignId ? issue : null;
          }
        })
      );

      // Remove null values and sort by createdAt in descending order
      const validIssues = filteredIssues
        .filter((issue): issue is Issue => issue !== null)
        .sort(
          (a: Issue, b: Issue) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setIssues(validIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async () => {
    try {
      const data = await managerCampaignService.getCampaignById(campaignId);
      setCampaign({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
    } catch (error) {
      console.error("Error fetching campaign details:", error);
    }
  };

  const calculateVolunteerStats = (volunteerId: string, campaign: Campaign) => {
    let taskCount = 0;
    let totalTaskScore = 0;
    let taskScoreCount = 0;
    let totalPeerScore = 0;
    let peerScoreCount = 0;

    campaign.phases?.forEach((phase) => {
      phase.phaseDays.forEach((phaseDay) => {
        phaseDay.tasks.forEach((task) => {
          // Count tasks participated
          if (task.assignedUsers.some((user) => user.userId === volunteerId)) {
            taskCount++;
            // Calculate average task score
            if (task.staffReview?.finalScore) {
              totalTaskScore += task.staffReview.finalScore;
              taskScoreCount++;
            }
            // Calculate average peer review score
            task.peerReviews.forEach((review) => {
              if (review.reviewee === volunteerId) {
                totalPeerScore += review.score;
                peerScoreCount++;
              }
            });
          }
        });
      });
    });

    return {
      taskCount,
      avgTaskScore:
        taskScoreCount > 0
          ? (totalTaskScore / taskScoreCount).toFixed(1)
          : "__",
      avgPeerScore:
        peerScoreCount > 0
          ? (totalPeerScore / peerScoreCount).toFixed(1)
          : "__",
    };
  };

  const handleClosedIssue = async (issue: Issue) => {
    try {
      if (issue.type === "cert_issue") {
        // Check for unfinished tasks
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

        const tasks = await fetchTasksByVolunteer(
          issue.reportedBy._id,
          year,
          month,
          user.token
        );

        // Filter tasks for current campaign and unfinished status
        const unfinishedTasks = tasks.filter(
          (task) =>
            task.campaignId === campaignId &&
            task.status !== "completed" &&
            task.status !== "cancelled"
        );

        if (unfinishedTasks.length > 0) {
          const taskTitles = unfinishedTasks
            .map((task) => `"${task.title}"`)
            .join(", ");
          setAlertMessage(
            `Tình nguyện viên này còn nhiệm vụ ${taskTitles} chưa hoàn thành.`
          );
          setAlertOpen(true);
          return;
        }

        // If no unfinished tasks, proceed with certificate issuance
        await ISSUE_API.requestCertificateEarly({
          campaignId: issue.relatedEntity.entityId,
          userId: issue.reportedBy._id,
          issuedDate: new Date().toISOString(),
        });
      }

      await ISSUE_API.updateIssue(issue._id, { status: "closed" });
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

  const handleCloseAlert = () => {
    setAlertOpen(false);
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
              <Tab label="Chứng chỉ" />
            </Tabs>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper elevation={3} sx={{ borderRadius: 2 }}>
                <List>
                  {issues.map((issue) => (
                    <ListItemButton key={issue._id} divider sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexGrow: 1,
                          gap: 2,
                          width: "100%",
                        }}
                      >
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar
                              src={
                                issue.reportedBy.avatar || "/default-avatar.png"
                              }
                              sx={{ width: 40, height: 40 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight="bold">
                                {issue.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="textSecondary">
                                Người gửi: {issue.reportedBy.fullName}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {issue.type === "cert_issue" && campaign && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {(() => {
                              const stats = calculateVolunteerStats(
                                issue.reportedBy._id,
                                campaign
                              );
                              return (
                                <>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Nhiệm vụ tham gia: {stats.taskCount}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Điểm NV TB: {stats.avgTaskScore}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Điểm đồng nghiệp đánh giá TB:{" "}
                                    {stats.avgPeerScore}
                                  </Typography>
                                </>
                              );
                            })()}
                          </Box>
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          ml: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          color={
                            issue.status === "closed" ? "success" : "primary"
                          }
                          disabled={issue.status === "closed"}
                          onClick={() => handleClosedIssue(issue)}
                          sx={{ minWidth: 160, borderRadius: 1 }}
                        >
                          {issue.status === "closed"
                            ? "Đã giải quyết"
                            : "Giải quyết"}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewDetails(issue)}
                          sx={{ minWidth: 160, borderRadius: 1 }}
                        >
                          Xem chi tiết
                        </Button>
                      </Box>
                    </ListItemButton>
                  ))}
                  {issues.length === 0 && (
                    <Typography p={2} color="textSecondary" textAlign="center">
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

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default IssueDialog;
