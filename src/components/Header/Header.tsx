import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/Authentication.service";
import {
  FaUserEdit,
  FaBell,
  FaCog,
  FaShieldAlt,
  FaQuestionCircle,
  FaDesktop,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Header.css";
import NotificationBell from "../Notification/NotificationBell";

interface User {
  fullName: string;
  avatar?: string;
}

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
        console.log("Parsed user:", storedUser);
      } else {
        console.log("user null");
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }

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

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNavClick = (section: string) => {
    console.log(`Navigating to ${section}`);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="site-logo" />
          <span className="logo-text">
            VolunteerHub
            <br />
            <span>Hà Tĩnh</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="navigation">
          <Link to="/" className="nav-link">
            Trang Chủ
          </Link>
          <Link to="/campaigns" className="nav-link">
            Chiến Dịch
          </Link>
          <Link to="/about-us" className="nav-link">
            Về Chúng Tôi
          </Link>
          <Link to="/news" className="nav-link">
            Cộng đồng
          </Link>

          {user ? (
            <>             
              <div className="nav-user" ref={dropdownRef}>
                <img
                  src={user.avatar || "user-default.png"}
                  alt="User"
                  className="user-avatar"
                  onClick={toggleDropdown}
                />
                <span className="user-fullname" onClick={toggleDropdown}>
                  {user.fullName}
                </span>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => navigate("/profile")}>
                      <FaUserEdit className="dropdown-icon" />
                      <span>Chỉnh sửa hồ sơ</span>
                    </div>

                    <div className="dropdown-item" >
                      <NotificationBell />
                      <span>Thông báo</span>
                    </div>

                    <div className="dropdown-item" onClick={() => navigate("/settings")}>
                      <FaCog className="dropdown-icon" />
                      <span>Cài đặt & bảo mật</span>
                    </div>

                    <div className="dropdown-item" onClick={() => navigate("/help")}>
                      <FaQuestionCircle className="dropdown-icon" />
                      <span>Trợ giúp & hỗ trợ</span>
                    </div>

                    <div className="dropdown-item" onClick={() => navigate("/myCampaign")}>
                      <FaDesktop className="dropdown-icon" />
                      <span>Chiến Dịch của tôi</span>
                    </div>

                    <div className="dropdown-item" onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Đăng xuất</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Đăng Nhập
            </Link>
          )}

          <button
            className="contact-btn"
            onClick={() => handleNavClick("contact")}
            type="button"
          >
            Liên Hệ ngay
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;