import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Chip,
  IconButton,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardActions,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add as AddIcon, 
  ExpandMore as ExpandMoreIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Campaign as CampaignIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Mock data interfaces
interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'pending';
}

interface Department {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  volunteers: Volunteer[];
  createdDate: Date;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive' | 'completed';
  departments: Department[];
}

const DepartmentManager: React.FC = () => {
  // Mock campaigns data
  const [campaigns] = useState<Campaign[]>([
    {
      id: 'campaign-1',
      name: 'Environmental Awareness Campaign 2024',
      description: 'A comprehensive campaign to raise environmental awareness',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      status: 'active',
      departments: [
        {
          id: 'dept-1',
          name: 'Marketing Team',
          description: 'Handle social media, content creation, and promotional activities',
          maxMembers: 10,
          createdDate: new Date('2024-01-15'),
          volunteers: [
            {
              id: 'vol-1',
              name: 'John Smith',
              email: 'john.smith@email.com',
              phone: '+1 234 567 8901',
              registrationDate: new Date('2024-01-16'),
              status: 'active'
            },
            {
              id: 'vol-2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 234 567 8902',
              registrationDate: new Date('2024-01-17'),
              status: 'active'
            }
          ]
        },
        {
          id: 'dept-2',
          name: 'Field Operations',
          description: 'On-ground activities, event management, and logistics',
          maxMembers: 15,
          createdDate: new Date('2024-01-16'),
          volunteers: [
            {
              id: 'vol-3',
              name: 'Mike Wilson',
              email: 'mike.wilson@email.com',
              phone: '+1 234 567 8903',
              registrationDate: new Date('2024-01-18'),
              status: 'active'
            }
          ]
        }
      ]
    },
    {
      id: 'campaign-2',
      name: 'Youth Education Initiative 2024',
      description: 'Educational programs and workshops for youth development',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-11-30'),
      status: 'active',
      departments: [
        {
          id: 'dept-3',
          name: 'Content Development',
          description: 'Creating educational materials and curriculum',
          maxMembers: 8,
          createdDate: new Date('2024-02-05'),
          volunteers: [
            {
              id: 'vol-7',
              name: 'Dr. Amanda Chen',
              email: 'amanda.chen@email.com',
              phone: '+1 234 567 8907',
              registrationDate: new Date('2024-02-06'),
              status: 'active'
            }
          ]
        }
      ]
    },
    {
      id: 'campaign-3',
      name: 'Community Health Outreach 2023',
      description: 'Health awareness and medical camps in rural areas',
      startDate: new Date('2023-03-01'),
      endDate: new Date('2023-12-31'),
      status: 'completed',
      departments: [
        {
          id: 'dept-4',
          name: 'Medical Team',
          description: 'Doctors and nurses for medical camps',
          maxMembers: 12,
          createdDate: new Date('2023-03-05'),
          volunteers: []
        }
      ]
    }
  ]);

  // Available volunteers not yet assigned to any department (global pool)
  const [availableVolunteers] = useState<Volunteer[]>([
    {
      id: 'vol-4',
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+1 234 567 8904',
      registrationDate: new Date('2024-01-19'),
      status: 'pending'
    },
    {
      id: 'vol-5',
      name: 'Alex Brown',
      email: 'alex.brown@email.com',
      phone: '+1 234 567 8905',
      registrationDate: new Date('2024-01-20'),
      status: 'pending'
    },
    {
      id: 'vol-6',
      name: 'Lisa Garcia',
      email: 'lisa.garcia@email.com',
      phone: '+1 234 567 8906',
      registrationDate: new Date('2024-01-21'),
      status: 'pending'
    }
  ]);

  // State management
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Dialog states
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');

  // Form states
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    maxMembers: 10
  });

  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Campaign selection
  const selectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDepartments(campaign.departments);
  };

  const goBackToCampaigns = () => {
    setSelectedCampaign(null);
    setDepartments([]);
    closeDepartmentDialog();
    closeVolunteerDialog();
  };

  // Department CRUD operations
  const openDepartmentDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setDepartmentForm({
        name: department.name,
        description: department.description,
        maxMembers: department.maxMembers
      });
    } else {
      setEditingDepartment(null);
      setDepartmentForm({
        name: '',
        description: '',
        maxMembers: 10
      });
    }
    setDepartmentDialogOpen(true);
  };

  const closeDepartmentDialog = () => {
    setDepartmentDialogOpen(false);
    setEditingDepartment(null);
    setDepartmentForm({ name: '', description: '', maxMembers: 10 });
  };

  const saveDepartment = () => {
    if (editingDepartment) {
      // Update existing department
      setDepartments(departments.map(dept => 
        dept.id === editingDepartment.id 
          ? { ...dept, ...departmentForm }
          : dept
      ));
    } else {
      // Create new department
      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        ...departmentForm,
        volunteers: [],
        createdDate: new Date()
      };
      setDepartments([...departments, newDepartment]);
    }
    closeDepartmentDialog();
  };

  const deleteDepartment = (departmentId: string) => {
    if (window.confirm('Are you sure you want to delete this department? All volunteers will be unassigned.')) {
      setDepartments(departments.filter(dept => dept.id !== departmentId));
    }
  };

  // Volunteer CRUD operations
  const openVolunteerDialog = (departmentId?: string) => {
    setSelectedDepartmentId(departmentId || '');
    setVolunteerForm({ name: '', email: '', phone: '' });
    setVolunteerDialogOpen(true);
  };

  const closeVolunteerDialog = () => {
    setVolunteerDialogOpen(false);
    setVolunteerForm({ name: '', email: '', phone: '' });
    setSelectedDepartmentId('');
  };

  const addVolunteer = () => {
    const newVolunteer: Volunteer = {
      id: `vol-${Date.now()}`,
      ...volunteerForm,
      registrationDate: new Date(),
      status: 'active'
    };

    if (selectedDepartmentId) {
      // Add to specific department
      setDepartments(departments.map(dept => 
        dept.id === selectedDepartmentId 
          ? { ...dept, volunteers: [...dept.volunteers, newVolunteer] }
          : dept
      ));
    }
    closeVolunteerDialog();
  };

  const removeVolunteerFromDepartment = (departmentId: string, volunteerId: string) => {
    if (window.confirm('Are you sure you want to remove this volunteer from the department?')) {
      setDepartments(departments.map(dept => 
        dept.id === departmentId 
          ? { ...dept, volunteers: dept.volunteers.filter(vol => vol.id !== volunteerId) }
          : dept
      ));
    }
  };

  const assignVolunteerToDepartment = (volunteerId: string, departmentId: string) => {
    const volunteer = availableVolunteers.find(vol => vol.id === volunteerId);
    if (volunteer && departmentId) {
      const updatedVolunteer = { ...volunteer, status: 'active' as const };
      setDepartments(departments.map(dept => 
        dept.id === departmentId 
          ? { ...dept, volunteers: [...dept.volunteers, updatedVolunteer] }
          : dept
      ));
    }
  };

  // Utility functions
  const getTotalVolunteers = () => {
    return departments.reduce((total, dept) => total + dept.volunteers.length, 0);
  };

  const getAvailableSlots = (department: Department) => {
    return department.maxMembers - department.volunteers.length;
  };

  const getStatusColor = (status: Volunteer['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getCampaignStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getCampaignStats = (campaign: Campaign) => {
    const totalDepartments = campaign.departments.length;
    const totalVolunteers = campaign.departments.reduce((total, dept) => total + dept.volunteers.length, 0);
    const totalCapacity = campaign.departments.reduce((total, dept) => total + dept.maxMembers, 0);
    return { totalDepartments, totalVolunteers, totalCapacity };
  };

  // Campaign Selection View
  if (!selectedCampaign) {
    return (
      <Box sx={{ 
        marginLeft: '280px', 
        padding: '30px',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Box sx={{ mb: 4, marginTop: '40px' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Campaign Management
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Select a campaign to manage departments and volunteers
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {campaigns.map((campaign) => {
            const stats = getCampaignStats(campaign);
            return (
              <Grid key={campaign.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CampaignIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {campaign.name}
                      </Typography>
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

                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Duration:</strong> {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {stats.totalDepartments}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Departments
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main">
                            {stats.totalVolunteers}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Volunteers
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="info.main">
                            {stats.totalCapacity}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Capacity
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
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
            );
          })}
        </Grid>

        {campaigns.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No campaigns available
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create your first campaign to start managing departments and volunteers.
            </Typography>
          </Paper>
        )}
      </Box>
    );
  }

  // Department Management View (existing functionality)
  return (
    <Box sx={{ 
      marginLeft: '280px', 
      padding: '30px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2, marginTop: '40px' }}>
        <Link
          component="button"
          variant="body1"
          onClick={goBackToCampaigns}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <CampaignIcon sx={{ mr: 0.5 }} fontSize="small" />
          Campaigns
        </Link>
        <Typography color="text.primary">
          {selectedCampaign.name}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
            Department & Volunteer Management
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {selectedCampaign.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PersonAddIcon />}
            onClick={() => openVolunteerDialog()}
          >
            Add Volunteer
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

      {/* Campaign Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Campaign Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {departments.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Departments
              </Typography>
            </Box>
          </Grid>
          <Grid>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {getTotalVolunteers()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Volunteers
              </Typography>
            </Box>
          </Grid>
          <Grid>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {availableVolunteers.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Unassigned
              </Typography>
            </Box>
          </Grid>
          <Grid>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {departments.reduce((total, dept) => total + dept.maxMembers, 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Capacity
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Departments */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Departments ({departments.length})
          </Typography>
        </Box>

        {departments.map((department) => (
          <Accordion key={department.id} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {department.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {department.volunteers.length}/{department.maxMembers} members
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                  <Chip 
                    label={`${department.volunteers.length} volunteers`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`${getAvailableSlots(department)} slots available`} 
                    size="small" 
                    color={getAvailableSlots(department) > 0 ? 'success' : 'error'} 
                    variant="outlined"
                  />
                </Stack>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    openDepartmentDialog(department);
                  }}
                  sx={{ mr: 1 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDepartment(department.id);
                  }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid>
                  <Typography variant="subtitle2" gutterBottom>
                    Department Details
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {department.description || 'No description provided'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Created: {formatDate(department.createdDate)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Max Members: {department.maxMembers}
                  </Typography>
                </Grid>
                
                <Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">
                      Volunteers ({department.volunteers.length})
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => openVolunteerDialog(department.id)}
                      disabled={getAvailableSlots(department) <= 0}
                    >
                      Add Volunteer
                    </Button>
                  </Box>

                  {department.volunteers.length > 0 ? (
                    <List dense>
                      {department.volunteers.map((volunteer) => (
                        <ListItem key={volunteer.id} divider>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={volunteer.name}
                            secondary={
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                  <Typography variant="caption">
                                    {volunteer.email}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                  <Typography variant="caption">
                                    {volunteer.phone}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                  Joined: {formatDate(volunteer.registrationDate)}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip 
                                label={volunteer.status} 
                                size="small" 
                                color={getStatusColor(volunteer.status)}
                                variant="outlined"
                              />
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => removeVolunteerFromDepartment(department.id, volunteer.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      No volunteers assigned to this department yet.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {departments.length === 0 && (
          <Alert severity="info">
            No departments created yet. Click "Create Department" to get started.
          </Alert>
        )}
      </Paper>

      {/* Unassigned Volunteers */}
      {availableVolunteers.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Unassigned Volunteers ({availableVolunteers.length})
          </Typography>
          <Grid container spacing={2}>
            {availableVolunteers.map((volunteer) => (
              <Grid key={volunteer.id}>
                <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        {volunteer.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {volunteer.email}
                      </Typography>
                    </Box>
                    <Chip 
                      label={volunteer.status} 
                      size="small" 
                      color={getStatusColor(volunteer.status)}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {volunteer.phone}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Assign to Department</InputLabel>
                    <Select
                      label="Assign to Department"
                      onChange={(e) => assignVolunteerToDepartment(volunteer.id, e.target.value as string)}
                    >
                      {departments
                        .filter(dept => getAvailableSlots(dept) > 0)
                        .map(dept => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name} ({getAvailableSlots(dept)} slots available)
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Department Dialog */}
      <Dialog open={departmentDialogOpen} onClose={closeDepartmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDepartment ? 'Edit Department' : 'Create New Department'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Department Name"
            value={departmentForm.name}
            onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={departmentForm.description}
            onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Maximum Members"
            type="number"
            value={departmentForm.maxMembers}
            onChange={(e) => setDepartmentForm({ ...departmentForm, maxMembers: parseInt(e.target.value) || 0 })}
            margin="normal"
            required
            inputProps={{ min: 1, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDepartmentDialog}>Cancel</Button>
          <Button 
            onClick={saveDepartment} 
            variant="contained"
            disabled={!departmentForm.name.trim() || departmentForm.maxMembers < 1}
          >
            {editingDepartment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Volunteer Dialog */}
      <Dialog open={volunteerDialogOpen} onClose={closeVolunteerDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Volunteer</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={volunteerForm.name}
            onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={volunteerForm.email}
            onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={volunteerForm.phone}
            onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
            margin="normal"
            required
          />
          {selectedDepartmentId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This volunteer will be assigned to: {departments.find(d => d.id === selectedDepartmentId)?.name}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVolunteerDialog}>Cancel</Button>
          <Button 
            onClick={addVolunteer} 
            variant="contained"
            disabled={!volunteerForm.name.trim() || !volunteerForm.email.trim() || !volunteerForm.phone.trim()}
          >
            Add Volunteer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManager;