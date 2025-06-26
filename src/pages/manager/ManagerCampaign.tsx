// src/pages/manager/ManagerCampaign.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Stack,
  Badge,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn,
  DateRange,
  People,
  Category,
  Timeline,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Phase {
  name: string;
  start: Date;
  end: Date;
  description?: string;
}

interface Volunteer {
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
  evaluation: 'excellent' | 'good' | 'average' | 'poor';
  feedback?: string;
}

interface Category {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface Campaign {
  _id: string;
  name: string;
  description: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  startDate: Date;
  endDate: Date;
  image?: string;
  phases: Phase[];
  volunteers: Volunteer[];
  categories: Category[];
  status: 'upcoming' | 'in-progress' | 'completed';
  certificatesIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
  requiredVolunteers?: number;
}

const ManagerCampaign: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'in-progress' | 'completed'>('upcoming');

  // Enhanced sample campaign data
  const sampleCampaign: Campaign = {
    _id: '1',
    name: 'Beach Cleanup Initiative 2024',
    description: 'Join us for a comprehensive beach cleanup campaign to protect marine life and preserve our coastal environment. This multi-phase initiative will involve community engagement, environmental education, and hands-on conservation work.',
    location: {
      coordinates: [21.0278, 105.8342], // [lat, lng] format for Leaflet
      address: 'Hoan Kiem Lake, Hanoi, Vietnam'
    },
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-20'),
    image: '/api/placeholder/400/200',
    requiredVolunteers: 50,
    phases: [
      {
        name: 'Registration Phase',
        start: new Date('2024-06-01'),
        end: new Date('2024-07-10'),
        description: 'Open registration for volunteers and community outreach'
      },
      {
        name: 'Preparation Phase',
        start: new Date('2024-07-11'),
        end: new Date('2024-07-14'),
        description: 'Equipment preparation, volunteer briefing, and team formation'
      },
      {
        name: 'Cleanup Phase',
        start: new Date('2024-07-15'),
        end: new Date('2024-07-18'),
        description: 'Main cleanup activities across multiple beach sections'
      },
      {
        name: 'Wrap-up Phase',
        start: new Date('2024-07-19'),
        end: new Date('2024-07-20'),
        description: 'Data collection, final cleanup, and certificate distribution'
      }
    ],
    volunteers: [
      {
        user: { _id: '1', name: 'Nguyen Van A', avatar: '/api/placeholder/32/32' },
        status: 'approved',
        registeredAt: new Date('2024-06-15'),
        evaluation: 'excellent',
        feedback: 'Outstanding leadership and commitment'
      },
      {
        user: { _id: '2', name: 'Tran Thi B', avatar: '/api/placeholder/32/32' },
        status: 'approved',
        registeredAt: new Date('2024-06-18'),
        evaluation: 'good',
        feedback: 'Reliable and hardworking'
      },
      {
        user: { _id: '3', name: 'Le Van C', avatar: '/api/placeholder/32/32' },
        status: 'pending',
        registeredAt: new Date('2024-06-20'),
        evaluation: 'average'
      },
      {
        user: { _id: '4', name: 'Pham Thi D', avatar: '/api/placeholder/32/32' },
        status: 'approved',
        registeredAt: new Date('2024-06-22'),
        evaluation: 'good'
      },
      {
        user: { _id: '5', name: 'Hoang Van E', avatar: '/api/placeholder/32/32' },
        status: 'rejected',
        registeredAt: new Date('2024-06-25'),
        evaluation: 'poor',
        feedback: 'Did not meet requirements'
      },
      {
        user: { _id: '6', name: 'Vu Thi F', avatar: '/api/placeholder/32/32' },
        status: 'pending',
        registeredAt: new Date('2024-06-26'),
        evaluation: 'average'
      }
    ],
    categories: [
      { _id: '1', name: 'Environmental', color: '#4CAF50', icon: '🌱' },
      { _id: '2', name: 'Community Service', color: '#2196F3', icon: '🤝' },
      { _id: '3', name: 'Marine Conservation', color: '#00BCD4', icon: '🌊' },
      { _id: '4', name: 'Education', color: '#FF9800', icon: '📚' }
    ],
    status: 'in-progress',
    certificatesIssued: false,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-23')
  };

  const campaigns = [sampleCampaign];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'warning';
      case 'in-progress': return 'success';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getVolunteerStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" />;
      case 'pending': return <Pending color="warning" />;
      case 'rejected': return <Cancel color="error" />;
      default: return null;
    }
  };

  const getCurrentPhase = (phases: Phase[]) => {
    const now = new Date();
    return phases.find(phase => 
      new Date(phase.start) <= now && new Date(phase.end) >= now
    ) || phases[phases.length - 1];
  };

  const getVolunteersByStatus = (volunteers: Volunteer[]) => {
    return {
      joining: volunteers.filter(v => v.status === 'approved'),
      registered: volunteers.filter(v => v.status === 'pending'),
      rejected: volunteers.filter(v => v.status === 'rejected')
    };
  };

  const filteredCampaigns = campaigns.filter(campaign => campaign.status === activeTab);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue as 'upcoming' | 'in-progress' | 'completed');
  };

  return (
    <Box sx={{ 
      marginLeft: '280px', 
      padding: '30px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, marginTop: '40px' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Campaign Management
        </Typography>
        <Button variant="contained" color="primary" size="large">
          + Post A Campaign
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab 
            label={`Upcoming (${campaigns.filter(c => c.status === 'upcoming').length})`} 
            value="upcoming" 
          />
          <Tab 
            label={`In-progress (${campaigns.filter(c => c.status === 'in-progress').length})`} 
            value="in-progress" 
          />
          <Tab 
            label={`Completed (${campaigns.filter(c => c.status === 'completed').length})`} 
            value="completed" 
          />
        </Tabs>
      </Paper>

      {/* Campaign Cards */}
      {filteredCampaigns.map((campaign) => {
        const currentPhase = getCurrentPhase(campaign.phases);
        const volunteerGroups = getVolunteersByStatus(campaign.volunteers);
        
        return (
          <Card key={campaign._id} sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Campaign Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    {campaign.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip 
                      label={campaign.status.replace('-', ' ').toUpperCase()}
                      color={getStatusColor(campaign.status) as any}
                      variant="filled"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Updated {formatDate(campaign.updatedAt)}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" component="p">
                    {campaign.description}
                  </Typography>
                </Box>
              </Box>

              {/* Campaign Details Grid */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Location with Map */}
                <Grid>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Location</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {campaign.location.address}
                    </Typography>
                    <Box sx={{ height: 200, mt: 2, borderRadius: 1, overflow: 'hidden' }}>
                      <MapContainer 
                        center={campaign.location.coordinates} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={campaign.location.coordinates}>
                          <Popup>
                            <div>
                              <strong>{campaign.name}</strong><br/>
                              {campaign.location.address}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Campaign Info */}
                <Grid>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {/* Duration */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <DateRange color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">Duration</Typography>
                        </Box>
                        <Typography variant="body2">
                          {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                        </Typography>
                      </Box>

                      {/* Current Phase */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Timeline color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">Current Phase</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {currentPhase?.name || 'No active phase'}
                        </Typography>
                        {currentPhase && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(currentPhase.start)} - {formatDate(currentPhase.end)}
                          </Typography>
                        )}
                      </Box>

                      {/* Volunteer Progress */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <People color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">Volunteer Progress</Typography>
                        </Box>
                        <Typography variant="body2">
                          {volunteerGroups.joining.length} / {campaign.requiredVolunteers || 'Unlimited'} volunteers joined
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip size="small" label={`${volunteerGroups.joining.length} Joined`} color="success" />
                          <Chip size="small" label={`${volunteerGroups.registered.length} Pending`} color="warning" />
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Categories */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Category color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Categories</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {campaign.categories.map(category => (
                    <Chip
                      key={category._id}
                      label={`${category.icon || ''} ${category.name}`}
                      sx={{ 
                        backgroundColor: category.color || '#e0e0e0',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Volunteers Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    👥 Volunteers ({campaign.volunteers.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {/* Volunteers Joining Campaign */}
                    <Grid>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          <Badge badgeContent={volunteerGroups.joining.length} color="success">
                            Volunteers Joining Campaign
                          </Badge>
                        </Typography>
                        <List dense>
                          {volunteerGroups.joining.map((volunteer, index) => (
                            <ListItem key={index}>
                              <ListItemAvatar>
                                <Avatar src={volunteer.user.avatar} alt={volunteer.user.name}>
                                  {volunteer.user.name.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={volunteer.user.name}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getVolunteerStatusIcon(volunteer.status)}
                                    <Chip size="small" label={volunteer.evaluation} />
                                    <Typography variant="caption">
                                      Joined {formatDate(volunteer.registeredAt)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                          {volunteerGroups.joining.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                              No volunteers have joined yet
                            </Typography>
                          )}
                        </List>
                      </Paper>
                    </Grid>

                    {/* Volunteers Registered */}
                    <Grid>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          <Badge badgeContent={volunteerGroups.registered.length} color="warning">
                            Volunteers Registered
                          </Badge>
                        </Typography>
                        <List dense>
                          {volunteerGroups.registered.map((volunteer, index) => (
                            <ListItem key={index}>
                              <ListItemAvatar>
                                <Avatar src={volunteer.user.avatar} alt={volunteer.user.name}>
                                  {volunteer.user.name.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={volunteer.user.name}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getVolunteerStatusIcon(volunteer.status)}
                                    <Typography variant="caption">
                                      Registered {formatDate(volunteer.registeredAt)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                          {volunteerGroups.registered.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                              No pending registrations
                            </Typography>
                          )}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Rejected Volunteers (if any) */}
                  {volunteerGroups.rejected.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Rejected Applications ({volunteerGroups.rejected.length})
                      </Typography>
                      <List dense>
                        {volunteerGroups.rejected.map((volunteer, index) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <Avatar src={volunteer.user.avatar} alt={volunteer.user.name}>
                                {volunteer.user.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={volunteer.user.name}
                              secondary={
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getVolunteerStatusIcon(volunteer.status)}
                                    <Typography variant="caption">
                                      {formatDate(volunteer.registeredAt)}
                                    </Typography>
                                  </Box>
                                  {volunteer.feedback && (
                                    <Typography variant="caption" color="error">
                                      {volunteer.feedback}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Phases Timeline */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    📋 Campaign Phases ({campaign.phases.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 2 }}>
                    {campaign.phases.map((phase, index) => (
                      <Box key={index} sx={{ display: 'flex', mb: 3, position: 'relative' }}>
                        <Box sx={{ 
                          minWidth: 20, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          mr: 2
                        }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: phase === currentPhase ? 'primary.main' : 'grey.400',
                            mb: 1
                          }} />
                          {index < campaign.phases.length - 1 && (
                            <Box sx={{ 
                              width: 2, 
                              height: 40, 
                              backgroundColor: 'grey.300' 
                            }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={phase === currentPhase ? 'bold' : 'normal'}
                            color={phase === currentPhase ? 'primary.main' : 'text.primary'}
                          >
                            {phase.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(phase.start)} - {formatDate(phase.end)}
                          </Typography>
                          {phase.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {phase.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Campaign Stats */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {campaign.volunteers.length}
                      </Typography>
                      <Typography variant="caption">Total Applications</Typography>
                    </Box>
                  </Grid>
                  <Grid>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {volunteerGroups.joining.length}
                      </Typography>
                      <Typography variant="caption">Approved</Typography>
                    </Box>
                  </Grid>
                  <Grid>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">
                        {campaign.phases.length}
                      </Typography>
                      <Typography variant="caption">Phases</Typography>
                    </Box>
                  </Grid>
                  <Grid>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color={campaign.certificatesIssued ? 'success.main' : 'text.secondary'}>
                        {campaign.certificatesIssued ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="caption">Certificates</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {filteredCampaigns.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No {activeTab.replace('-', ' ')} campaigns found.
          </Typography>
        </Paper>
      )}

      {/* View All Button */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button variant="outlined" size="large">
          View All Campaigns
        </Button>
      </Box>
    </Box>
  );
};

export default ManagerCampaign;