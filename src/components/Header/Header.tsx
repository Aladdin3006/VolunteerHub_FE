import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Grow,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItem,
  ListItemText,
  Badge,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserEdit,
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaDesktop,
  FaSignOutAlt,
  FaBars,
  FaTasks,
} from "react-icons/fa";
import { keyframes } from "@emotion/react";
import authService from "../../services/Authentication.service";
import EmergencyButton from "./EmergencyButton";
import NotificationBell from "../Notification/NotificationBell";
import StormInfoModal from "../storm/StormInfoModal";

interface User {
  fullName: string;
  avatar?: string;
}

const bounceGlow = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(25, 118, 210, 0); }
  50% { transform: scale(1.05); box-shadow: 0 0 10px rgba(25, 118, 210, 0.5); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(25, 118, 210, 0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const pulseEmergency = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
`;

const shakeSlight = keyframes`
  0% { transform: translate(0px, 0px); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(3px, -1px); }
  60% { transform: translate(-1px, 2px); }
  80% { transform: translate(2px, -1px); }
  100% { transform: translate(0px, 0px); }
`;

const dropdownEnter = keyframes`
  0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [stormModalOpen, setStormModalOpen] = useState(false);
  const [hasActiveStorm, setHasActiveStorm] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    try {
      const storedUser = authService.getUser();
      if (storedUser) setUser(storedUser);
    } catch (error) {
      console.error("Lỗi khi load user từ localStorage", error);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleStormModalOpen = () => {
    setStormModalOpen(true);
  };

  const menuItems = [
    {
      label: "Chỉnh sửa hồ sơ",
      icon: <FaUserEdit />,
      action: () => navigate("/profile"),
      requiresLogin: true,
    },
    {
      label: "Nhiệm vụ trong tháng",
      icon: <FaTasks />,
      action: () => navigate("/myTask"),
      requiresLogin: true,
    },
    {
      label: "Chiến Dịch của tôi",
      icon: <FaDesktop />,
      action: () => navigate("/myCampaign"),
      requiresLogin: true,
    },
    { label: "Đăng xuất", icon: <FaSignOutAlt />, action: handleLogout },
  ].filter((item) => !item.requiresLogin || (item.requiresLogin && user));

  const navLinks = [
    { label: "Trang Chủ", path: "/", requiresLogin: false },
    { label: "Chiến Dịch", path: "/campaigns", requiresLogin: false },
    { label: "Quyên góp", path: "/donations", requiresLogin: false },
    { label: "Chiến dịch của tôi", path: "/myCampaign", requiresLogin: true },
    { label: "Cộng đồng", path: "/news", requiresLogin: false },
  ].filter((item) => !item.requiresLogin || (item.requiresLogin && user));

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: isScrolled ? "85%" : "90%",
          py: isScrolled ? 0.5 : 1,
          borderRadius: "16px",
          backdropFilter: "blur(16px)",
          background: "rgba(255, 255, 255, 0.75)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          zIndex: 1300,
          transition: "all 0.3s ease",
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{ background: "transparent" }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box
              component={Link}
              to="/"
              display="flex"
              alignItems="center"
              gap={0}
              sx={{ textDecoration: "none", "& img": { display: "block" } }}
            >
              <Box
                component="img"
                src="/logo-remove-bg.png"
                alt="Logo"
                sx={{ height: 60, mr: -3 }}
              />
              <Box>
                <Typography variant="h6" fontWeight={700} color="#1976d2">
                  VolunteerHub
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "1rem" }}
                >
                  Hà Tĩnh
                </Typography>
              </Box>
            </Box>

            {isMobile ? (
              <>
                <IconButton onClick={() => setDrawerOpen(true)}>
                  <FaBars />
                </IconButton>
                <Drawer
                  sx={{ zIndex: 1800 }}
                  anchor="right"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  ModalProps={{ keepMounted: true }}
                  container={
                    typeof window !== "undefined"
                      ? () => window.document.body
                      : undefined
                  }
                >
                  <List onClick={() => setDrawerOpen(false)}>
                    {navLinks.map((item) => (
                      <ListItem disablePadding key={item.path}>
                        <ListItemButton component={Link} to={item.path}>
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <ListItem disablePadding>
                      <ListItemButton component={Link} to="/login">
                        <ListItemText primary="Đăng nhập" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Drawer>
              </>
            ) : (
              <Box display="flex" alignItems="center" gap={3}>
                {navLinks.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: "#333",
                      fontWeight: 500,
                      textTransform: "none",
                      fontSize: 15,
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        width: "0%",
                        height: "2px",
                        left: 0,
                        bottom: 0,
                        backgroundColor: "#1976d2",
                        transition: "all 0.3s ease-in-out",
                      },
                      "&:hover::after": {
                        width: "100%",
                      },
                      "&:hover": { color: "#1976d2" },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                {user && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <NotificationBell color="black" />

                    <Typography
                      variant="body2"
                      color="#1976d2"
                      fontWeight={500}
                    >
                      Xin chào, {user.fullName.split(" ")[0]} 👋
                    </Typography>
                    <Box onClick={handleMenuOpen} sx={{ cursor: "pointer" }}>
                      <Avatar
                        className="glow-avatar"
                        src={user.avatar || "user-default.png"}
                        sx={{
                          width: 36,
                          height: 36,
                          animation: `${pulse} 2.5s infinite ease-in-out`,
                          transition: "transform 0.3s",
                          "&:hover": {
                            transform: "scale(1.08)",
                          },
                        }}
                      />
                    </Box>

                    {/* Storm Alert Icon */}
                    <EmergencyButton onClick={handleStormModalOpen} />
                  </Box>
                )}
                {!user && (
                  <Button component={Link} to="/login" sx={{ color: "#333" }}>
                    Đăng Nhập
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Grow}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 220,
              p: 1,
              animation: `${dropdownEnter} 0.25s ease forwards`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              background: "#fff",
            },
          }}
        >
          {menuItems.map((item, idx) => (
            <MenuItem
              key={idx}
              onClick={() => {
                item.action();
                handleMenuClose();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f0f4ff",
                },
              }}
            >
              {item.icon} {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Storm Info Modal */}
      <StormInfoModal
        open={stormModalOpen}
        onClose={() => setStormModalOpen(false)}
      />
    </>
  );
};

export default Header;
