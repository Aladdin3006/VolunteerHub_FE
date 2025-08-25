import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Grid,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Badge,
} from '@mui/material';
import {
  EmojiEvents,
  VolunteerActivism,
  MonetizationOn,
  TrendingUp,
  Star,
  Favorite,
  AccessTime,
  Group,
} from '@mui/icons-material';

interface Volunteer {
  id: number;
  name: string;
  avatar: string;
  points: number;
  activitiesCompleted: number;
  hoursVolunteered: number;
  specialty: string;
  joinedDate: string;
  badgeColor: 'gold' | 'silver' | 'bronze' | 'default';
}

interface Donor {
  id: number;
  name: string;
  avatar: string;
  totalDonated: number;
  donationCount: number;
  lastDonation: string;
  donationType: string;
  streak: number;
  badgeColor: 'gold' | 'silver' | 'bronze' | 'default';
}

const mockVolunteers: Volunteer[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    points: 2850,
    activitiesCompleted: 47,
    hoursVolunteered: 156,
    specialty: 'Community Outreach',
    joinedDate: '2023-01-15',
    badgeColor: 'gold',
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    points: 2640,
    activitiesCompleted: 42,
    hoursVolunteered: 134,
    specialty: 'Education Support',
    joinedDate: '2023-02-20',
    badgeColor: 'silver',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    points: 2420,
    activitiesCompleted: 38,
    hoursVolunteered: 112,
    specialty: 'Environmental Care',
    joinedDate: '2023-03-10',
    badgeColor: 'bronze',
  },
  {
    id: 4,
    name: 'David Park',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    points: 2180,
    activitiesCompleted: 35,
    hoursVolunteered: 98,
    specialty: 'Senior Care',
    joinedDate: '2023-04-05',
    badgeColor: 'default',
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    points: 1950,
    activitiesCompleted: 31,
    hoursVolunteered: 87,
    specialty: 'Youth Mentoring',
    joinedDate: '2023-05-12',
    badgeColor: 'default',
  },
];

const mockDonors: Donor[] = [
  {
    id: 1,
    name: 'Robert Williams',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    totalDonated: 15750,
    donationCount: 23,
    lastDonation: '2025-01-10',
    donationType: 'Monthly Recurring',
    streak: 12,
    badgeColor: 'gold',
  },
  {
    id: 2,
    name: 'Jennifer Thompson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    totalDonated: 12300,
    donationCount: 18,
    lastDonation: '2025-01-08',
    donationType: 'One-time',
    streak: 8,
    badgeColor: 'silver',
  },
  {
    id: 3,
    name: 'Mark Davis',
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    totalDonated: 9800,
    donationCount: 15,
    lastDonation: '2025-01-05',
    donationType: 'Quarterly',
    streak: 6,
    badgeColor: 'bronze',
  },
  {
    id: 4,
    name: 'Amanda Miller',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    totalDonated: 7650,
    donationCount: 12,
    lastDonation: '2025-01-03',
    donationType: 'Monthly Recurring',
    streak: 4,
    badgeColor: 'default',
  },
  {
    id: 5,
    name: 'James Wilson',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    totalDonated: 6200,
    donationCount: 9,
    lastDonation: '2024-12-28',
    donationType: 'One-time',
    streak: 3,
    badgeColor: 'default',
  },
];

const getBadgeColor = (color: string) => {
  switch (color) {
    case 'gold': return '#FFD700';
    case 'silver': return '#C0C0C0';
    case 'bronze': return '#CD7F32';
    default: return '#757575';
  }
};

const RankingCard = ({ 
  rank, 
  person, 
  type 
}: { 
  rank: number; 
  person: Volunteer | Donor; 
  type: 'volunteer' | 'donor' 
}) => {
  const isVolunteer = type === 'volunteer';
  const volunteer = person as Volunteer;
  const donor = person as Donor;

  return (
    <Card 
      sx={{ 
        mb: 2, 
        transition: 'all 0.3s ease',
        '&:hover': { 
          transform: 'translateY(-4px)', 
          boxShadow: 6 
        },
        border: rank <= 3 ? `2px solid ${getBadgeColor(person.badgeColor)}` : 'none'
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={person.avatar} 
              sx={{ 
                width: 64, 
                height: 64,
                border: `3px solid ${getBadgeColor(person.badgeColor)}`
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                left: -8,
                backgroundColor: getBadgeColor(person.badgeColor),
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            >
              {rank}
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {person.name}
            </Typography>
            
            {isVolunteer ? (
              <Stack spacing={1}>
                <Chip 
                  label={volunteer.specialty} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        {volunteer.points.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Points
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                        {volunteer.activitiesCompleted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Activities
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                        {volunteer.hoursVolunteered}h
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hours
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Chip 
                  label={donor.donationType} 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                        ${donor.totalDonated.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        {donor.donationCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Donations
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Badge badgeContent={donor.streak} color="error">
                        <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                          {donor.streak}
                        </Typography>
                      </Badge>
                      <Typography variant="caption" color="text.secondary">
                        Streak
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Box>
          
          <Box>
            {rank <= 3 && (
              <Tooltip title={`${rank === 1 ? 'Gold' : rank === 2 ? 'Silver' : 'Bronze'} Medal`}>
                <IconButton sx={{ color: getBadgeColor(person.badgeColor) }}>
                  <EmojiEvents />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const StatsCard = ({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) => (
  <Card sx={{ height: '100%', textAlign: 'center' }}>
    <CardContent>
      <Box sx={{ color, mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

const RankingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
          Community Rankings
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Celebrating our top volunteers and generous donors
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Group sx={{ fontSize: 40 }} />}
            title="Active Volunteers"
            value="247"
            subtitle="This month"
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<MonetizationOn sx={{ fontSize: 40 }} />}
            title="Total Donations"
            value="$52.8K"
            subtitle="This month"
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<AccessTime sx={{ fontSize: 40 }} />}
            title="Volunteer Hours"
            value="1,247"
            subtitle="This month"
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            title="Growth Rate"
            value="+23%"
            subtitle="vs last month"
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              minHeight: 60,
            }
          }}
        >
          <Tab
            icon={<VolunteerActivism />}
            iconPosition="start"
            label="Top Volunteers"
          />
          <Tab
            icon={<Favorite />}
            iconPosition="start"
            label="Top Donors"
          />
        </Tabs>
      </Paper>

      {/* Rankings */}
      <Box>
        {activeTab === 0 ? (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              🏆 Volunteer Rankings
            </Typography>
            {mockVolunteers.map((volunteer, index) => (
              <RankingCard
                key={volunteer.id}
                rank={index + 1}
                person={volunteer}
                type="volunteer"
              />
            ))}
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'success.main' }}>
              💝 Donor Rankings
            </Typography>
            {mockDonors.map((donor, index) => (
              <RankingCard
                key={donor.id}
                rank={index + 1}
                person={donor}
                type="donor"
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default RankingDashboard;