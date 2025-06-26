import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

interface User {
  fullName: string;
  avatarUrl?: string;
}

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      console.log("Parsed user:", user);
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
    }
  } else {
    console.log("user null");
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user"); // optional: clean invalid entry
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
    window.location.reload(); // optional, force UI refresh
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
          <img src="/logo.png" alt="Logo" className="logo-image" />
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
          <Link to="/forum" className="nav-link">
            Diễn Đàn
          </Link>

          {user ? (
            <div className="nav-user" ref={dropdownRef}>
              <img
                src={user.avatarUrl || "user-default.png"}
                alt="User"
                className="logo-image"
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
