import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/Authentication.service";
import "./Header.css";

interface User {
  fullName: string;
  avatar?: string;
}

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Remove this block - it's causing infinite re-renders
  /*
  const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }

  if (storedUser) {
    try {
      console.log("Parsed user:", user);
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
    }
  } else {
    console.log("user null");
  }
  */

  useEffect(() => {
    // Only get user from authService once on mount
    try {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
        console.log("Parsed user:", storedUser); // Log the storedUser directly
      } else {
        console.log("user null");
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }

    // Close dropdown when clicking outside
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
  }, []); // Empty dependency array - runs only once

  const handleLogout = () => {
    authService.logout();
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
          <Link to="/campagin" className="nav-link">
            Chiến Dịch
          </Link>
          <Link to="/about-us" className="nav-link">
            Về Chúng Tôi
          </Link>
          <Link to="/news" className="nav-link">
            Cộng đồng
          </Link>

          {user ? (
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
                  <div
                    className="dropdown-item"
                    onClick={() => navigate("/profile")}
                  >
                    Profile
                  </div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Đăng Nhập
              </Link>
            </>
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
