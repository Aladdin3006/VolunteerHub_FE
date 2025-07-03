import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Divider,
  Stack,
  Card,
  CardContent,
  CardActions,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Campaign as CampaignIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Import API functions and types
import {
  Campaign,
  Department,
  getStaffCampaigns,
  getDepartmentsByCampaignId,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  CreateDepartmentPayload,
  Volunteer,
  getCampaignVolunteers,
  addMemberToDepartment,
  acceptVolunteer,
  removeMemberFromDepartment,
} from "../../apis/staff";
import DepartmentCRUDModal from "./DepartmentCRUDModal";
import VolunteerRequestsModal from "./VolunteerRequestsModal";

const DepartmentManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteerRequestsOpen, setVolunteerRequestsOpen] = useState(false);

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

  useEffect(() => {
    const fetchDepartments = async () => {
      if (selectedCampaign) {
        try {
          setLoading(true);
          const data = await getDepartmentsByCampaignId(selectedCampaign._id);
          console.log("Fetched departments data:", data);

          // Debug each department
          data.forEach((dept, index) => {
            console.log(`Department ${index}:`, dept);
            console.log(`Department ${index} _id:`, dept._id);
            console.log(`Department ${index} keys:`, Object.keys(dept));
          });

          setDepartments(data);
        } catch (error) {
          console.error("Error fetching departments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDepartments();
  }, [selectedCampaign]);

  // Update this useEffect block:
  useEffect(() => {
    const fetchVolunteers = async () => {
      if (selectedCampaign) {
        try {
          const data = await getCampaignVolunteers(selectedCampaign._id);
          setVolunteers(data);
        } catch (error) {
          console.error("Error fetching volunteers:", error);
        }
      }
    };

    fetchVolunteers();
  }, [selectedCampaign]);

  const selectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const goBackToCampaigns = () => {
    setSelectedCampaign(null);
    setDepartments([]);
    setDepartmentDialogOpen(false);
  };

  // Add this to your openDepartmentDialog function in DepartmentManager.tsx
  const openDepartmentDialog = (department?: Department) => {
    console.log("openDepartmentDialog called with:", department);
    if (department) {
      console.log("Department _id:", department._id);
      console.log("Department object keys:", Object.keys(department));
    }
    setEditingDepartment(department || null);
    setDepartmentDialogOpen(true);
  };

  const closeDepartmentDialog = () => {
    setDepartmentDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleAcceptVolunteer = async (userId: string) => {
    if (!selectedCampaign) return;

    try {
      await acceptVolunteer(selectedCampaign._id, userId);
      setVolunteers((prev) =>
        prev.map((v) =>
          v.user._id === userId ? { ...v, status: "approved" } : v
        )
      );
    } catch (error) {
      console.error("Error accepting volunteer:", error);
    }
  };

  const handleVolunteerAccept = async (
    departmentId: string,
    userId: string // Now receives user ID
  ) => {
    try {
      const updatedDepartment = await addMemberToDepartment(
        departmentId,
        userId // Pass user ID to API
      );

      // Update local state
      setDepartments((prev) =>
        prev.map((dept) =>
          dept._id === updatedDepartment._id ? updatedDepartment : dept
        )
      );

      // Update volunteers list
      setVolunteers((prev) =>
        prev.map((vol) =>
          vol.user._id === userId
            ? {
                ...vol,
                departmentId: departmentId,
              }
            : vol
        )
      );
    } catch (error) {
      console.error("Error accepting volunteer:", error);
    }
  };

  

  const handleVolunteerRemove = async (departmentId: string, userId: string) => {
    try {
      // Call API to remove member
      const updatedDepartment = await removeMemberFromDepartment(
        departmentId, 
        userId
      );

      // Update departments state
      setDepartments(prev => 
        prev.map(dept => 
          dept._id === updatedDepartment._id ? updatedDepartment : dept
        )
      );

      // Update volunteers state
      setVolunteers((prev) =>
        prev.map((vol) =>
          vol.user._id === userId
            ? {
                ...vol,
                departmentId: departmentId,
              }
            : vol
        )
      );
    } catch (error) {
      console.error("Error removing volunteer:", error);
    }
  };

  const handleCreateDepartment = async (
    departmentData: CreateDepartmentPayload
  ) => {
    try {
      const newDepartment = await createDepartment(departmentData);
      setDepartments([...departments, newDepartment]);
      closeDepartmentDialog();
    } catch (error) {
      console.error("Error creating department:", error);
    }
  };

  const handleUpdateDepartment = async (
    departmentData: Partial<Department>
  ) => {
    if (!editingDepartment) return;

    try {
      const updatedDepartment = await updateDepartment(
        editingDepartment._id, // Use _id here
        departmentData
      );
      setDepartments(
        departments.map((dept) =>
          dept._id === updatedDepartment._id ? updatedDepartment : dept
        )
      );
      closeDepartmentDialog();
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(departmentId);
        setDepartments(departments.filter((dept) => dept._id !== departmentId));
      } catch (error) {
        console.error("Error deleting department:", error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  // Campaign Selection View
  if (!selectedCampaign) {
    return (
      <Box
        sx={{
          marginLeft: "280px",
          padding: "30px",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box sx={{ mb: 4, marginTop: "40px" }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Campaign Management
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Select a campaign to manage departments
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {campaigns.map((campaign) => (
              <Grid key={campaign._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CampaignIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography fontWeight="bold">{campaign.name}</Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph>
                      {campaign.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={campaign.status.toUpperCase()}
                        size="small"
                        color={getCampaignStatusColor(campaign.status)}
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      <strong>Duration:</strong>{" "}
                      {formatDate(campaign.startDate)} -{" "}
                      {formatDate(campaign.endDate)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<VisibilityIcon />}
                      onClick={() => selectCampaign(campaign)}
                    >
                      Manage Campaign
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && campaigns.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <CampaignIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No campaigns available
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You haven't been assigned to any campaigns yet.
            </Typography>
          </Paper>
        )}
      </Box>
    );
  }

  // Department Management View
  return (
    <Box
      sx={{
        marginLeft: "280px",
        padding: "30px",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2, marginTop: "40px" }}>
        <Link
          component="button"
          variant="body1"
          onClick={goBackToCampaigns}
          sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <CampaignIcon sx={{ mr: 0.5 }} fontSize="small" />
          Campaigns
        </Link>
        <Typography color="text.primary">{selectedCampaign.name}</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={goBackToCampaigns}
              sx={{ mr: 2 }}
            >
              Back to Campaigns
            </Button>
            <Chip
              label={selectedCampaign.status.toUpperCase()}
              size="small"
              color={getCampaignStatusColor(selectedCampaign.status)}
            />
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Department Management
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {selectedCampaign.name}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={() => setVolunteerRequestsOpen(true)}
          >
            Volunteer Requests
          </Button>
          <Button
            variant="contained"
            startIcon={<BusinessIcon />}
            onClick={() => openDepartmentDialog()}
          >
            Create Department
          </Button>
        </Box>
      </Box>

      {/* Departments */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">
            Departments ({departments.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {departments.map((department) => (
              <Paper key={department._id} sx={{ p: 3, mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {department.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {department.description}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Members: {department.memberIds.length}/
                      {department.maxMembers}
                    </Typography>
                    {/* <Typography variant="body2" color="textSecondary">
                      Created: {formatDate(department.createdAt)}
                    </Typography> */}
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => openDepartmentDialog(department)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDepartment(department._id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}

            {departments.length === 0 && (
              <Alert severity="info">
                No departments created yet. Click "Create Department" to get
                started.
              </Alert>
            )}
          </>
        )}
      </Paper>

      {volunteerRequestsOpen && (
        <VolunteerRequestsModal
          open={volunteerRequestsOpen}
          onClose={() => setVolunteerRequestsOpen(false)}
          volunteers={volunteers}
          onAcceptVolunteer={handleAcceptVolunteer}
        />
      )}
      <DepartmentCRUDModal
        open={departmentDialogOpen}
        onClose={closeDepartmentDialog}
        onCreate={handleCreateDepartment}
        onUpdate={handleUpdateDepartment}
        editingDepartment={editingDepartment}
        campaignId={selectedCampaign._id}
        volunteers={volunteers}
        onAddMember={handleVolunteerAccept}
        onRemoveMember={handleVolunteerRemove}
      />
    </Box>
  );
};

export default DepartmentManager;
