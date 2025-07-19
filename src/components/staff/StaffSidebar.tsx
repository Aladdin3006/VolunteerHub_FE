import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Divider,
} from "@mui/material";
import {
  Home as HiHome,
  Add as HiPlus,
  CardGiftcard as HiGift,
  CalendarToday as HiCalendar,
  Business as HiOfficeBuilding,
  ListAlt as HiClipboardList,
  Person as HiUser,
  Menu as HiMenu,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import authService from "../../services/Authentication.service"; // Adjust path as needed
import NotificationBell from "../Notification/NotificationBell"; // Adjust path as needed

const SidebarContainer = styled(Box)(({ theme }) => ({
  background: "linear-gradient(180deg, #4bc816 0%, #18ae0a 100%)",
  color: theme.palette.common.white,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(1),
  gap: theme.spacing(1),
}));

const SidebarItem = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1.5, 2),
  color: "rgba(255, 255, 255, 0.8)",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.1)",
    color: theme.palette.common.white,
    transform: "translateX(2px)",
  },
  ...(selected && {
    background: "rgba(255, 255, 255, 0.2)",
    color: theme.palette.common.white,
    fontWeight: 600,
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: 3,
      height: "70%",
      background: theme.palette.common.white,
      borderRadius: "0 2px 2px 0",
    },
  }),
}));

const StaffSidebar: React.FC = () => {
  const location = useLocation();
  const user = authService.getUser(); // Fetch user data

  const menuItems = [
    {
      path: "/staff/campaigns",
      label: "campaigns",
      icon: <HiHome />,
    },
    {
      path: "/staff/campaigns/new",
      label: "Create Campaign",
      icon: <HiPlus />,
      badge: "New",
    },
    {
      path: "/staff/donations/new",
      label: "Create Donation",
      icon: <HiGift />,
      badge: "New",
    },
    {
      path: "/staff/phase-campaigns",
      label: "Create Phase Campaign",
      icon: <HiCalendar />,
    },
    {
      path: "/staff/departments",
      label: "Department Management",
      icon: <HiOfficeBuilding />,
    },
    {
      path: "/staff/tasks",
      label: "Task Management",
      icon: <HiClipboardList />,
    },
  ];

  const SidebarContent = () => (
    <SidebarContainer>
      <SidebarHeader>
        <Box display="flex" alignItems="center">
          <Avatar
            src="/logo.png"
            alt="Logo"
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              bgcolor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            CN
          </Avatar>
          <Typography variant="h6" fontWeight={700}>
            Staff Portal
          </Typography>
        </Box>
        <UserInfo sx={{ pl: 7 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {user?.fullName || "Staff Member"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user?.role || "Staff"}
            </Typography>
          </Box>
          <NotificationBell />
        </UserInfo>
      </SidebarHeader>

      <List sx={{ flex: 1, overflowY: "auto", p: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <SidebarItem selected={location.pathname === item.path}>
              <Link
                to={item.path}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
                {item.badge && (
                  <Badge
                    badgeContent={item.badge}
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontSize: "0.75rem",
                        height: 18,
                        minWidth: 18,
                      },
                    }}
                  />
                )}
              </Link>
            </SidebarItem>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />
      <Box p={2}>
        <SidebarItem selected={location.pathname === "/staff/profile"}>
          <Link
            to="/staff/profile"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              <HiUser />
            </ListItemIcon>
            <ListItemText
              primary="My Profile"
              primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
            />
          </Link>
        </SidebarItem>
      </Box>
    </SidebarContainer>
  );

  return (
    <>
      {/* Mobile Sidebar (Drawer) */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1400,
        }}
      >
        <Drawer
          anchor="left"
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              bgcolor: "transparent",
              boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
        <IconButton
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
          }}
        >
          <HiMenu />
        </IconButton>
      </Box>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: 280,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <SidebarContent />
      </Box>
    </>
  );
};

export default StaffSidebar;
