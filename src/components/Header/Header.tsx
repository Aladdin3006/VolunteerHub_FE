import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import authService from "../../services/Authentication.service";
import NotificationBell from "../Notification/NotificationBell";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  Button,
  Box,
  Stack,
  Link,
  Grow,
  Paper,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuList,
} from "@mui/material";
import {
  FaUserEdit,
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaDesktop,
  FaSignOutAlt,
} from "react-icons/fa";

interface User {
  fullName: string;
  avatar?: string;
}

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser) setUser(storedUser);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: <FaUserEdit />, label: "Chỉnh sửa hồ sơ", path: "/profile" },
    { icon: <FaBell />, label: "Thông báo", path: "/notifications" },
    { icon: <FaCog />, label: "Cài đặt & bảo mật", path: "/settings" },
    { icon: <FaQuestionCircle />, label: "Trợ giúp", path: "/help" },
    { icon: <FaDesktop />, label: "Trợ năng", path: "/accessibility" },
  ];

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      color="text.primary"
      sx={{
        fontWeight: 500,
        px: 1,
        py: 0.5,
        borderRadius: 1.5,
        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: "rgba(0,0,0,0.04)",
          color: "primary.main",
        },
      }}
    >
      {label}
    </Link>
  );

  return (
    <AppBar position="sticky" color="inherit" elevation={2}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Link
          component={RouterLink}
          to="/"
          underline="none"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Avatar src="/logo.png" sx={{ mr: 1 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary">
              VolunteerHub
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hà Tĩnh
            </Typography>
          </Box>
        </Link>

        {/* Navigation */}
        <Stack direction="row" spacing={2} alignItems="center">
          <NavLink to="/" label="Trang Chủ" />
          <NavLink to="/campaigns" label="Chiến Dịch" />
          <NavLink to="/about-us" label="Về Chúng Tôi" />
          <NavLink to="/news" label="Cộng đồng" />

          {user ? (
            <>
              <NotificationBell />

              <IconButton onClick={handleMenuOpen}>
                <Avatar src={user.avatar || "/user-default.png"} alt={user.fullName} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                TransitionComponent={Grow}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 220,
                    p: 1,
                  },
                }}
              >
                <MenuList autoFocusItem={false}>
                  {menuItems.map((item, idx) => (
                    <MenuItem
                      key={idx}
                      onClick={() => {
                        navigate(item.path);
                        handleMenuClose();
                      }}
                      sx={{
                        borderRadius: 1.5,
                        px: 2,
                        py: 1,
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.06)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>{item.icon}</ListItemIcon>
                      <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <MenuItem
                    onClick={() => {
                      handleLogout();
                      handleMenuClose();
                    }}
                    sx={{
                      borderRadius: 1.5,
                      px: 2,
                      py: 1,
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(255, 0, 0, 0.08)",
                        color: "error.main",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <FaSignOutAlt />
                    </ListItemIcon>
                    <ListItemText>Đăng xuất</ListItemText>
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <NavLink to="/login" label="Đăng Nhập" />
          )}

          <Button
            variant="contained"
            color="error"
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 500 }}
            onClick={() => navigate("/contact")}
          >
            Liên Hệ ngay
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
