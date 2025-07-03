import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/Authentication.service";
import "./AdminHeader.css";
import NotificationBell from "../Notification/NotificationBell";

const AdminHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
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
    <header className="admin-header">
      <div className="header-content">
        <div className="header-left">{/* Breadcrumb or title */}</div>

        <div className="header-right">
          <div className="notification-bell-wrapper">
            <NotificationBell/>
          </div>

          <div className="user-menu" ref={dropdownRef}>
            <div className="user-info-header">
              <p className="user-name">{user?.fullName || "AdminAd"}</p>
              <p className="user-role">{user?.role || "Administrator"}</p>
            </div>

            <div
              className="user-avatar-header"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{(user?.name || "A").charAt(0).toUpperCase()}</span>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
