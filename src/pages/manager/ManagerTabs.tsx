
import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Campaign, MonetizationOn, FlashOn } from "@mui/icons-material";

type ManagerTabType = "campaigns" | "donations" | "storms";

interface TabItem {
  label: string;
  value: ManagerTabType;
  path: string;
  icon: JSX.Element;
}

interface ManagerTabsProps {
  activeTab: ManagerTabType;
  onTabChange: (value: ManagerTabType) => void;
}

const ManagerTabs: React.FC<ManagerTabsProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      label: "Quản lý Chiến dịch",
      value: "campaigns",
      path: "/manager/campaigns",
      icon: <Campaign />,
    },
    {
      label: "Quản lý Quyên Góp",
      value: "donations",
      path: "/manager/donations",
      icon: <MonetizationOn />,
    },
    {
      label: "Quản lý cảnh báo bão",
      value: "storms",
      path: "/manager/storms",
      icon: <FlashOn />,
    },
  ];

  // Xác định tab đang active dựa trên URL hiện tại
  const getActiveTab = () => {
    const currentTab = tabs.find((tab) => location.pathname === tab.path);
    return currentTab ? currentTab.value : activeTab;
  };

  return (
    <Box sx={{ mb: 3, bgcolor: "#ffffff", borderRadius: 2, p: 1, boxShadow: 1 }}>
      <Tabs
        value={getActiveTab()}
        onChange={(event, newValue) => {
          onTabChange(newValue);
          const selectedTab = tabs.find((tab) => tab.value === newValue);
          if (selectedTab?.path) navigate(selectedTab.path);
        }}
        variant="fullWidth"
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

export default ManagerTabs;
