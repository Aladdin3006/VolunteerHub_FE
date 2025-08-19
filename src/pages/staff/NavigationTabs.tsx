
import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Campaign, MonetizationOn } from "@mui/icons-material";

interface NavigationTabsProps {
  activeLink: "ongoing" | "finished";
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeLink }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Định nghĩa các tab
  const tabs = [
    {
      label: "Quản lý Chiến dịch",
      value: 0,
      path: "/staff/campaigns",
      icon: <Campaign />,
    },
    {
      label: "Quản lý Quyên góp",
      value: 1,
      path: "/staff/donations",
      icon: <MonetizationOn />,
    },
  ];

  // Xác định tab đang active dựa trên URL hoặc activeLink
  const getActiveTab = () => {
    const currentTab = tabs.find((tab) => location.pathname === tab.path);
    if (currentTab) return currentTab.value;
    return activeLink === "ongoing" ? 0 : 1;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const selectedTab = tabs.find((tab) => tab.value === newValue);
    if (selectedTab?.path) {
      navigate(selectedTab.path);
    }
  };

  return (
    <Box sx={{ mb: 3, bgcolor: "#ffffff", borderRadius: 2, p: 1, boxShadow: 1 }}>
      <Tabs
        value={getActiveTab()}
        onChange={handleTabChange}
        variant="fullWidth" // Hoặc "scrollable" cho mobile
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            color: "#555",
            padding: "12px 16px",
            borderRadius: 1,
            transition: "all 0.3s ease",
            "&.Mui-selected": {
              color: "#1976d2",
              bgcolor: "#e3f2fd",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            },
            "&:hover": {
              bgcolor: "#f5f5f5",
              color: "#1976d2",
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#1976d2",
            height: 3,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default NavigationTabs;
