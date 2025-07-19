// DepartmentManager.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  Department,
  getDepartmentsByCampaignId,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  CreateDepartmentPayload,
  Volunteer,
  getCampaignVolunteers,
  addMemberToDepartment,
  removeMemberFromDepartment,
} from "../../apis/staff";
import DepartmentCRUDModal from "./DepartmentCRUDModal";

interface DepartmentManagerProps {
  campaignId: string;
}

const DepartmentManager: React.FC<DepartmentManagerProps> = ({ campaignId }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptData, volData] = await Promise.all([
          getDepartmentsByCampaignId(campaignId),
          getCampaignVolunteers(campaignId),
        ]);
        setDepartments(deptData);
        setVolunteers(volData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campaignId]);

  const openDepartmentDialog = (department?: Department) => {
    setEditingDepartment(department || null);
    setDepartmentDialogOpen(true);
  };

  const closeDepartmentDialog = () => {
    setDepartmentDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleCreateDepartment = async (departmentData: CreateDepartmentPayload) => {
    try {
      const newDepartment = await createDepartment(departmentData);
      setDepartments([...departments, newDepartment]);
      closeDepartmentDialog();
    } catch (error) {
      console.error("Error creating department:", error);
    }
  };

  const handleUpdateDepartment = async (departmentData: Partial<Department>) => {
    if (!editingDepartment) return;
    try {
      const updatedDepartment = await updateDepartment(editingDepartment._id, departmentData);
      setDepartments(departments.map((dept) => (dept._id === updatedDepartment._id ? updatedDepartment : dept)));
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

  const handleVolunteerAccept = async (departmentId: string, userId: string) => {
    try {
      const updatedDepartment = await addMemberToDepartment(departmentId, userId);
      setDepartments((prev) =>
        prev.map((dept) => (dept._id === updatedDepartment._id ? updatedDepartment : dept))
      );
      setVolunteers((prev) =>
        prev.map((vol) =>
          vol.user._id === userId ? { ...vol, departmentId } : vol
        )
      );
    } catch (error) {
      console.error("Error accepting volunteer:", error);
    }
  };

  const handleVolunteerRemove = async (departmentId: string, userId: string) => {
    try {
      const updatedDepartment = await removeMemberFromDepartment(departmentId, userId);
      setDepartments((prev) =>
        prev.map((dept) => (dept._id === updatedDepartment._id ? updatedDepartment : dept))
      );
      setVolunteers((prev) =>
        prev.map((vol) =>
          vol.user._id === userId ? { ...vol, departmentId: undefined } : vol
        )
      );
    } catch (error) {
      console.error("Error removing volunteer:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6">Department Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<BusinessIcon />}
            onClick={() => openDepartmentDialog()}
          >
            Create Department
          </Button>
        </Box>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3 }}>
          {departments.map((department) => (
            <Paper key={department._id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{department.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{department.description}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Members: {department.memberIds.length}/{department.maxMembers}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => openDepartmentDialog(department)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteDepartment(department._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
          {departments.length === 0 && (
            <Alert severity="info">No departments created yet. Click "Create Department" to get started.</Alert>
          )}
        </Paper>
      )}
      <DepartmentCRUDModal
        open={departmentDialogOpen}
        onClose={closeDepartmentDialog}
        onCreate={handleCreateDepartment}
        onUpdate={handleUpdateDepartment}
        editingDepartment={editingDepartment}
        campaignId={campaignId}
        volunteers={volunteers}
        onAddMember={handleVolunteerAccept}
        onRemoveMember={handleVolunteerRemove}
      />
    </Box>
  );
};

export default DepartmentManager;