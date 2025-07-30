import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ManagerDonationStaff: React.FC = () => {
  const [activeLink, setActiveLink] = useState<"ongoing" | "finished">(
    "finished"
  );
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 2,
      }}
    >
      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeLink === "ongoing" ? 0 : 1}
          onChange={(_, newValue) => {
            const link = newValue === 0 ? "ongoing" : "finished";
            setActiveLink(link);
            if (link === "ongoing") {
              navigate("/staff/campaigns");
            }
          }}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#1976d2",
            },
          }}
        >
          <Tab
            label="Quản lý Chiến dịch"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            }}
          />
          <Tab
            label="Quản lý Quyên góp"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            }}
          />
        </Tabs>
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 1,
          p: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Quản lý Quyên góp
        </Typography>
        <Typography>This is the donation management page content.</Typography>
      </Box>
    </Box>
  );
};

export default ManagerDonationStaff;
