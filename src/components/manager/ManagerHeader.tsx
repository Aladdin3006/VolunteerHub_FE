import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/Authentication.service";
import { Avatar, Box, Button, Typography } from "@mui/material";
import NotificationBell from "../Notification/NotificationBell";
import StormTrigger from "../storm/admin_storm/StormTriggerAndModal";

const ManagerHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogoClick = () => {
    navigate("/manager/campaigns");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "#1E3A8A",
        color: "white",
        p: 1,
      }}
    >
      <Box sx={{ pl: 4, pr: 2 }}>
        <Avatar
          src="/logo.png"
          alt="Logo"
          sx={{
            width: 40,
            height: 40,
            mr: 1.5,
            bgcolor: "rgba(255, 255, 255, 0.2)",
            cursor: "pointer", // Add cursor pointer to indicate it's clickable
          }}
          onClick={handleLogoClick} // Add onClick handler
        >
          CN
        </Avatar>
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ flexGrow: 1 }}
        onClick={handleLogoClick}
      >
        Manager Portal
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ mr: 2, color: "white" }}>
          <NotificationBell color="white" />
        </Box>
        <Box ref={dropdownRef} sx={{ position: "relative", pr: 4 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={toggleDropdown}
          >
            <Avatar sx={{ bgcolor: "grey.300" }}>
              {(user?.name || "S").charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2">
                {user?.fullName || "ManagerAd"}
              </Typography>
              <Typography variant="body2">{user?.role || "Manager"}</Typography>
            </Box>
          </Box>
          {isDropdownOpen && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                right: 0,
                bgcolor: "white",
                color: "black",
                mt: 1,
                borderRadius: 1,
                boxShadow: 3,
                zIndex: 1000,
                minWidth: 120,
              }}
            >
              <Button
                variant="text"
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  p: 1,
                  textTransform: "none",
                  color: "black",
                  "&:hover": { bgcolor: "grey.200" },
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Box>
        <StormTrigger />
      </Box>
    </Box>
  );
};

export default ManagerHeader;
