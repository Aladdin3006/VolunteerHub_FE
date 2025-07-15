import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import {
  Department,
  CreateDepartmentPayload,
  Volunteer,
} from "../../apis/staff";
import { getSkillsVolunteer } from "../../apis/profile";

interface DepartmentCRUDModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (department: CreateDepartmentPayload) => void;
  onUpdate: (department: Partial<Department>) => void;
  editingDepartment: Department | null;
  campaignId: string;
  volunteers: Volunteer[];
  onAddMember: (departmentId: string, userId: string) => void;
  onRemoveMember: (departmentId: string, userId: string) => void;
}

const DepartmentCRUDModal: React.FC<DepartmentCRUDModalProps> = ({
  open,
  onClose,
  onCreate,
  onUpdate,
  editingDepartment,
  campaignId,
  volunteers,
  onAddMember,
  onRemoveMember,
}) => {
  const [formData, setFormData] = React.useState({
    id: "",
    name: "",
    description: "",
    maxMembers: 10,
  });

  // Add local state to track department members
  const [localMembers, setLocalMembers] = React.useState<string[]>([]);
  const [volunteerSkills, setVolunteerSkills] = React.useState<
    Record<string, string[]>
  >({});

  // Initialize local members from editingDepartment
  React.useEffect(() => {
    if (editingDepartment) {
      setFormData({
        id: editingDepartment._id,
        name: editingDepartment.name || "",
        description: editingDepartment.description || "",
        maxMembers: editingDepartment.maxMembers || 10,
      });

      // Initialize local members state
      setLocalMembers([...editingDepartment.memberIds]);
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        maxMembers: 10,
      });
      setLocalMembers([]);
    }
  }, [editingDepartment, open]);

  React.useEffect(() => {
    if (!open) return;

    const fetchSkills = async () => {
      const skillsMap: Record<string, string[]> = {};
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      for (const volunteer of volunteers) {
        try {
          const response = await getSkillsVolunteer(
            volunteer.user._id,
            user.token
          );
          skillsMap[volunteer.user._id] = response.data || [];
        } catch (error) {
          console.error(
            `Error fetching skills for volunteer ${volunteer.user._id}:`,
            error
          );
          skillsMap[volunteer.user._id] = [];
        }
      }

      setVolunteerSkills(skillsMap);
    };

    fetchSkills();
  }, [open, volunteers]);

  const approvedVolunteers = volunteers.filter((v) => v.status === "approved");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxMembers" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (editingDepartment) {
      onUpdate({
        name: formData.name,
        description: formData.description,
        maxMembers: formData.maxMembers,
      });
    } else {
      onCreate({
        ...formData,
        campaignId,
      });
    }
  };

  // Enhanced add member handler
  const handleAddMember = (departmentId: string, userId: string) => {
    // Update local state immediately
    setLocalMembers((prev) => [...prev, userId]);

    // Call parent handler
    onAddMember(departmentId, userId);
  };

  // Enhanced remove member handler
  const handleRemoveMember = (departmentId: string, userId: string) => {
    // Update local state immediately
    setLocalMembers((prev) => prev.filter((id) => id !== userId));

    // Call parent handler
    onRemoveMember(departmentId, userId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingDepartment ? "Edit Department" : "Create New Department"}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          name="name"
          label="Department Name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          name="maxMembers"
          label="Maximum Members"
          type="number"
          value={formData.maxMembers}
          onChange={handleChange}
          margin="normal"
          required
          inputProps={{ min: 1, max: 100 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name.trim() || formData.maxMembers < 1}
        >
          {editingDepartment ? "Update" : "Create"}
        </Button>
      </DialogActions>
      {editingDepartment && (
        <Box sx={{ mt: 3, p: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="h6" gutterBottom>
            Assign Volunteers
          </Typography>
          {approvedVolunteers.length === 0 ? (
            <Alert severity="info">No approved volunteers available</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                     <TableCell>Skills</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvedVolunteers.map((volunteer) => {
                    const isMember = localMembers.includes(volunteer.user._id);
                     const skills = volunteerSkills[volunteer.user._id] || [];
                    return (
                      <TableRow key={volunteer.user._id}>
                        <TableCell>{volunteer.user.fullName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {skills.length > 0 ? (
                              skills.map((skill, index) => (
                                <Chip key={index} label={skill} size="small" />
                              ))
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No skills listed
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {isMember ? (
                            <Button
                              color="error"
                              size="small"
                              onClick={() =>
                                handleRemoveMember(
                                  editingDepartment._id,
                                  volunteer.user._id
                                )
                              }
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              color="primary"
                              size="small"
                              onClick={() =>
                                handleAddMember(
                                  editingDepartment._id,
                                  volunteer.user._id
                                )
                              }
                              disabled={
                                localMembers.length >= formData.maxMembers
                              }
                            >
                              Add to Dept
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {localMembers.length} of {formData.maxMembers} members assigned
          </Typography>
        </Box>
      )}
    </Dialog>
  );
};

export default DepartmentCRUDModal;
