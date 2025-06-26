import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Save,
  Edit2,
  Building2,
} from "lucide-react";
import "./Profile.css";
import Header from "../../components/Header/Header";
import { updateUserAvatar } from "../../apis/profile";

interface UserProfile {
  id: string;
  fullName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  bio: string;
  avatar: string;
  department: string;
  skills: string[];
}

interface ProfileProps {
  loginData?: any; // Accept login data as prop
}

// Department skills mapping
type Department =
  | ""
  | "Planning & Coordination"
  | "Logistics"
  | "Communications"
  | "Human Resources (Volunteers)"
  | "Security & Health"
  | "Technical (Sound, lighting)";

type DepartmentSkillsMap = {
  [key in Department]: string[];
};

const DEPARTMENT_SKILLS: DepartmentSkillsMap = {
  "": [], // Default empty department
  "Planning & Coordination": [
    "Team leadership/management skills",
    "Planning and organization skills",
    "Problem solving ability",
    "Logical thinking and quick decision making",
    "Interdepartmental communication and coordination",
    "Skills in using Google Sheets, Trello, Notion, etc."
  ],
  "Logistics": [
    "Thinking about arrangement and organization",
    "Ability to work with hands, withstand pressure",
    "Know how to use/check items (speakers, wires, banners...)",
    "Meticulous, careful",
    "Negotiation and purchasing skills (priority)"
  ],
  "Communications": [
    "Write communication content (content)",
    "Basic design (Canva, Photoshop)",
    "Take photos, shoot videos",
    "Edit videos, edit photos (Premiere, CapCut, Lightroom...)",
    "Manage social networks (Facebook, Instagram, TikTok, etc.)",
    "External communication, reply inbox/email"
  ],
  "Human Resources (Volunteers)": [
    "Good communication, friendly",
    "Ability to present and guide groups",
    "Teamwork, motivation",
    "Personnel management and monitoring",
    "Know how to use forms (Google Form, Excel)"
  ],
  "Security & Health": [
    "Basic first aid skills",
    "Know how to monitor the health of participants",
    "Skills to handle emergency situations",
    "Can control and coordinate crowds",
    "Know how to stay calm, good observation"
  ],
  "Technical (Sound, lighting)": [
    "Know how to use speakers, microphones, mixers, wires,...",
    "Install / check technical equipment",
    "Basic knowledge of electricity and sound",
    "Work in a pressured environment (setup, technical problems)",
    "Be careful, know how to check and maintain equipment"
  ]
};

const DEPARTMENTS = Object.keys(DEPARTMENT_SKILLS).filter(dept => dept !== "");

const Profile: React.FC<ProfileProps> = ({ loginData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const createProfileFromLoginData = (apiData: any): UserProfile => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const department = (apiData.department || "") as Department;
    const skills = apiData.skills || DEPARTMENT_SKILLS[department] || [];

    return {
      id: apiData.id || "",
      fullName: apiData.fullName || "",
      email: apiData.email || "",
      phone: apiData.phone || "",
      dateOfBirth: formatDate(apiData.date_of_birth) || "",
      address: apiData.address || "",
      bio:
        apiData.bio || "Tình nguyện viên chăm chỉ vì một thế giới tốt đẹp hơn.",
      avatar: apiData.avatar || "user-default.png",
      department: department,
      skills: skills,
    };
  };

  // Initialize with empty data
  const [profileData, setProfileData] = useState<UserProfile>({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    bio: "",
    avatar: "user-default.png",
    department: "",
    skills: [],
  });

  const [tempData, setTempData] = useState<UserProfile>(profileData);
  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from loginData prop or from stored login response
  useEffect(() => {
    if (loginData) {
      const userData = createProfileFromLoginData(loginData);
      setProfileData(userData);
      setTempData(userData);
    } else {
      // Try to get from localStorage using the same key as Header component
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Stored user data:", parsedUser);
          const userData = createProfileFromLoginData(parsedUser);
          setProfileData(userData);
          setTempData(userData);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }
    }
  }, [loginData]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Debug logs
    console.log("File selected:", file);
    console.log("Profile ID:", profileData.id);
    console.log("Token:", token);

    if (!file) {
      console.log("No file selected");
      return;
    }

    if (!profileData.id) {
      console.error("No user ID available");
      alert("User ID not found. Please try logging in again.");
      return;
    }

    if (!token) {
      console.error("No authentication token available");
      alert("Authentication token not found. Please try logging in again.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);

      // Upload to server
      setAvatarUploading(true);

      const response = await updateUserAvatar(profileData.id, file, token);

      // Use server-returned avatar URL
      const newAvatarUrl = response.user?.result.avatar;

      if (newAvatarUrl) {
        setTempData((prev) => ({ ...prev, avatar: newAvatarUrl }));
        setProfileData((prev) => ({ ...prev, avatar: newAvatarUrl }));

        // Update localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.avatar = newAvatarUrl;
          localStorage.setItem("user", JSON.stringify(user));
        }

        console.log("Avatar updated successfully");
        alert("Avatar updated successfully!");
      } else {
        throw new Error("No avatar URL returned from server");
      }
    } catch (error) {
      alert(
        `Avatar upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // Revert to previous avatar on error
      setTempData((prev) => ({ ...prev, avatar: profileData.avatar }));
    } finally {
      setAvatarUploading(false);

      // Clear the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDepartmentChange = (department: string) => {
    setTempData((prev) => ({ 
      ...prev, 
      department: department,
      skills: [] // Clear skills when department changes
    }));
  };

  const addSkillFromDropdown = (skill: string) => {
    if (skill && !tempData.skills.includes(skill)) {
      setTempData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare data for API update - convert back to API format
      const updateData = {
        fullName: tempData.fullName,
        email: tempData.email,
        phone: tempData.phone,
        date_of_birth: tempData.dateOfBirth,
        address: tempData.address,
        bio: tempData.bio,
        avatar: tempData.avatar,
        department: tempData.department,
        skills: tempData.skills,
      };

      setProfileData(tempData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !tempData.skills.includes(newSkill.trim())) {
      setTempData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setTempData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const currentData = isEditing ? tempData : profileData;

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-cover"></div>
          <div className="profile-info">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <img
                  src={currentData.avatar}
                  alt="Profile"
                  className="profile-avatar"
                />
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="avatar-edit-btn"
                    disabled={loading || avatarUploading}
                  >
                    {avatarUploading ? (
                      <span className="loading-dots">Uploading</span>
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="file-input"
                />
              </div>
              <div className="profile-details">
                <h1 className="profile-name">{currentData.fullName}</h1>
                <p className="profile-bio">
                  {currentData.bio || "Welcome to your profile!"}
                </p>
                {currentData.department && (
                  <p className="profile-department">
                    Department: {currentData.department}
                  </p>
                )}
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <Edit2 size={16} />
                    {loading ? "Loading..." : "Edit Profile"}
                  </button>
                ) : (
                  <div className="action-buttons">
                    <button
                      onClick={handleSave}
                      className="btn btn-success"
                      disabled={loading}
                    >
                      <Save size={16} />
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* Personal Information */}
          <div className="main-content">
            <div className="card">
              <h2 className="card-title">Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <div className="form-display">
                      <User size={16} className="form-icon" />
                      <span>{currentData.fullName || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={currentData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <div className="form-display">
                      <Mail size={16} className="form-icon" />
                      <span>{currentData.email}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <div className="form-display">
                      <Phone size={16} className="form-icon" />
                      <span>{currentData.phone}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={currentData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <div className="form-display">
                      <Calendar size={16} className="form-icon" />
                      <span>
                        {currentData.dateOfBirth
                          ? new Date(
                              currentData.dateOfBirth
                            ).toLocaleDateString()
                          : "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <div className="form-display">
                      <MapPin size={16} className="form-icon" />
                      <span>{currentData.address || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  {isEditing ? (
                    <select
                      value={currentData.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="form-input"
                      disabled={loading}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="form-display">
                      <Building2 size={16} className="form-icon" />
                      <span>{currentData.department || "Not assigned"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Bio</label>
                {isEditing ? (
                  <textarea
                    value={currentData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="form-textarea"
                    placeholder="Tell us about yourself..."
                    disabled={loading}
                  />
                ) : (
                  <p className="bio-text">
                    {currentData.bio || "No bio provided yet."}
                  </p>
                )}
              </div>
            </div>
          </div>

            {/* Department and Skills */}
            <div className="sidebar">
            {/* Department */}
            <div className="card">
              <h3 className="card-subtitle">Department Investor</h3>
              <div className="tags-container">
              {currentData.department ? (
                <span className="tag tag-department">
                {currentData.department}
                {isEditing && (
                  <button
                  onClick={() => handleDepartmentChange("")}
                  className="tag-remove"
                  disabled={loading}
                  >
                  ×
                  </button>
                )}
                </span>
              ) : (
                <span className="tag tag-placeholder">
                Choice your department investor by editing profile.
                </span>
              )}
              </div>
              {isEditing && (
              <div className="add-tag-container">
                <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                  handleDepartmentChange(e.target.value);
                  }
                }}
                className="add-tag-input"
                disabled={loading}
                >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                  {dept}
                  </option>
                ))}
                </select>
              </div>
              )}
            </div>

            {/* Skills - Dynamic based on department */}
            <div className="card">
              <h3 className="card-subtitle">Skills</h3>
              <div className="tags-container">
              {currentData.skills.length > 0 ? (
                currentData.skills.map((skill, index) => (
                <span key={index} className="tag tag-skills">
                  {skill}
                  {isEditing && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="tag-remove"
                    disabled={loading}
                  >
                    ×
                  </button>
                  )}
                </span>
                ))
              ) : (
                isEditing && (
                <p className="skills-note">
                  <small>Please select department first to add skills.</small>
                </p>
                )
              )}
              {isEditing && currentData.department && (
                <div className="add-tag-container">
                <select
                  value=""
                  onChange={(e) => {
                  if (e.target.value) {
                    addSkillFromDropdown(e.target.value);
                  }
                  }}
                  className="add-tag-input"
                  disabled={loading}
                >
                  <option value="">Add Skill</option>
                  {(DEPARTMENT_SKILLS[currentData.department as Department] || [])
                  .filter((skill: string) => !currentData.skills.includes(skill))
                  .map((skill: string) => (
                    <option key={skill} value={skill}>
                    {skill}
                    </option>
                  ))}
                </select>
                </div>
              )}
              </div>
            </div>

            {/* Volunteer Stats - Hardcoded as requested */}
            <div className="card">
              <h3 className="card-subtitle">Volunteer Stats</h3>
              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-label">Hours Volunteered</span>
                  <span className="stat-value stat-blue">245</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Projects Completed</span>
                  <span className="stat-value stat-green">12</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value stat-purple">2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Profile };
export default Profile;