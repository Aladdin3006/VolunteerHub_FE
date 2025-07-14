import React from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import CountUp from "react-countup";
import { FaUsers, FaHandsHelping, FaDonate } from "react-icons/fa";

const stats = [
  {
    icon: <FaUsers size={40} color="#1976d2" />,
    label: "Tình nguyện viên",
    value: 1250,
  },
  {
    icon: <FaHandsHelping size={40} color="#1976d2" />,
    label: "Chiến dịch đã thực hiện",
    value: 85,
  },
  {
    icon: <FaDonate size={40} color="#1976d2" />,
    label: "Số tiền đã quyên góp (VNĐ)",
    value: 970000000,
    isCurrency: true,
  },
];

const StatsSection: React.FC = () => {
  const theme = useTheme();

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
