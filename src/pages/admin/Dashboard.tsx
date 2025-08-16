import React, { useEffect, useState } from "react";
import { usersService, DashboardStats } from "../../apis/admin";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAdditionalData();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await usersService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to load dashboard stats");
      console.error("Fetch dashboard stats error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const [campaignData, donationData, userData] = await Promise.all([
        usersService.getAllCampaigns(),
        usersService.getAllDonations(),
        usersService.getAllUsers(),
      ]);
      setCampaigns(campaignData);
      setDonations(donationData);
      setUsers(userData);
    } catch (err) {
      console.error("Error fetching additional data:", err);
    }
  };

  const roleData = stats
    ? {
        labels: ["Managers", "Staff", "Users"],
        datasets: [
          {
            data: [
              Math.floor(stats.totalUsers * 0.2),
              Math.floor(stats.totalUsers * 0.3),
              Math.floor(stats.totalUsers * 0.5),
            ],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            hoverOffset: 4,
          },
        ],
      }
    : { labels: [], datasets: [{ data: [], backgroundColor: [] }] };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "User Roles Distribution",
      },
    },
  };

  return (
    <Box
      sx={{
        ml: "310px",
        p: 4,
        mt: "80px",
        minHeight: "80vh",
        background: "linear-gradient(135deg, #e0f7fa 0%, #f0f4f8 100%)",
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        sx={{ color: "#2c3e50", fontWeight: "bold", textAlign: "center" }}
      >
        Dashboard Overview
      </Typography>

      {error && (
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="60vh"
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : stats ? (
        <Grid container spacing={4}>
          {/* Total Users Card */}
          <Grid>
            <Card
              sx={{
                height: "100%",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ color: "#3498db", fontWeight: "bold" }}
                >
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary"></Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Campaigns Card */}
          <Grid>
            <Card
              sx={{
                height: "100%",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Campaigns
                </Typography>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ color: "#2ecc71", fontWeight: "bold" }}
                >
                  {stats.totalCampaigns}
                </Typography>
                <Typography variant="body2" color="text.secondary"></Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Donations Card */}
          <Grid>
            <Card
              sx={{
                height: "100%",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Donations
                </Typography>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ color: "#e74c3c", fontWeight: "bold" }}
                >
                  {stats.totalDonations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pie Chart Card */}
          <Grid>
            <Card
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                p: 3,
              }}
            >
              <CardContent>
                <Pie data={roleData} options={pieOptions} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default Dashboard;
