import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/Authentication.service";
import "./AdminHeader.css";

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
          <button className="notification-btn">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-3.5-7L15 17zm-8-3l1.5-3L7 14l1.5-3L10 17H4l3.5-7zM19 4v3h-3V4h3zM7 4v3H4V4h3z"
              />
            </svg>
          </button>

          <div className="user-menu" ref={dropdownRef}>
            <div className="user-info-header">
              <p className="user-name">{user?.name || "AdminAd"}</p>
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
