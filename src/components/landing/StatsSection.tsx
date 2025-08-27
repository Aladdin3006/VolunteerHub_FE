import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import CountUp from "react-countup";
import { FaUsers, FaHandsHelping, FaDonate } from "react-icons/fa";

const StatsSection: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState([
    {
      icon: <FaUsers size={40} color="#1976d2" />,
      label: "Tình nguyện viên",
      value: 0,
    },
    {
      icon: <FaHandsHelping size={40} color="#1976d2" />,
      label: "Chiến dịch đã thực hiện",
      value: 0,
    },
    {
      icon: <FaDonate size={40} color="#1976d2" />,
      label: "Số tiền đã quyên góp (VNĐ)",
      value: 0,
      isCurrency: true,
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats([
          {
            icon: <FaUsers size={40} color="#1976d2" />,
            label: "Tình nguyện viên",
            value: data.totalUsers,
          },
          {
            icon: <FaHandsHelping size={40} color="#1976d2" />,
            label: "Chiến dịch đã thực hiện",
            value: data.totalCampaigns,
          },
          {
            icon: <FaDonate size={40} color="#1976d2" />,
            label: "Số tiền đã quyên góp (VNĐ)",
            value: data.totalDonationAmount,
            isCurrency: true,
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        bgcolor: "#f5faff",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          mb: 6,
          color: "#1976d2",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Những Con Số Ấn Tượng
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} {...({} as any)}>
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Box mb={2}>{stat.icon}</Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "#1976d2" }}
              >
                <CountUp
                  end={stat.value}
                  duration={2.5}
                  separator=","
                  prefix={stat.isCurrency ? "₫" : ""}
                />
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsSection;

// Assume getDashboardStats is defined elsewhere
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE}/dashboard/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add authorization token if required, e.g., from loginUser
      // "Authorization": `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch dashboard stats");
  }

  return result.result;
};
