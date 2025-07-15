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
} from "lucide-react";
import Slider from "react-slick";
import "./Profile.css";
import Header from "../../components/Header/Header";
import { updateUserAvatar, addSkillsToUser, updateSkillsOfUser } from "../../apis/profile";
import ImageGallery from "../../components/image/ImageGallery";
import RegisterFaceModal from "../../components/image/uploadFaceRecognize/FaceRegisterForm.js";
import CheckinFaceModal from "../../components/image/uploadFaceRecognize/CheckinFace.js";
import { suggestedSkills } from "@/configs/constant.js";

interface UserProfile {
  id: string;
  fullName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  bio: string;
  avatar: string;
  skills: string[];
  certificates: string[];
}

interface ProfileProps {
  loginData?: any;
}

const Profile: React.FC<ProfileProps> = ({ loginData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const sliderRef = useRef<Slider>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProfileFromLoginData = (apiData: any): UserProfile => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    return {
      id: apiData.id || "",
      fullName: apiData.fullName || "",
      email: apiData.email || "",
      phone: apiData.phone || "",
      dateOfBirth: formatDate(apiData.date_of_birth) || "",
      address: apiData.address || "",
      bio: apiData.bio || "Tình nguyện viên chăm chỉ vì một thế giới tốt đẹp hơn.",
      avatar: apiData.avatar || "user-default.png",
      skills: apiData.skills || [],
      certificates: [
        "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
        "https://img.freepik.com/free-vector/gradient-elegant-certificate-template_23-2148973721.jpg?w=740",
      ],
    };
  };

  const [profileData, setProfileData] = useState<UserProfile>({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    bio: "",
    avatar: "user-default.png",
    skills: [],
    certificates: [],
  });

  const [tempData, setTempData] = useState<UserProfile>(profileData);

  useEffect(() => {
    if (loginData) {
      const userData = createProfileFromLoginData(loginData);
      setProfileData(userData);
      setTempData(userData);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Stored user data:", parsedUser);
          const userData = createProfileFromLoginData(parsedUser);
          setProfileData(userData);
          setTempData(userData);
          setToken(parsedUser.token || null);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }
    }
  }, [loginData]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
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

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      setAvatarUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);

      const response = await updateUserAvatar(profileData.id, file, token);
      const newAvatarUrl = response.user?.result.avatar;

      if (newAvatarUrl) {
        setTempData((prev) => ({ ...prev, avatar: newAvatarUrl }));
        setProfileData((prev) => ({ ...prev, avatar: newAvatarUrl }));

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
        `Avatar upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setTempData((prev) => ({ ...prev, avatar: profileData.avatar }));
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = async () => {
    if (newSkill.trim() && !tempData.skills.includes(newSkill.trim())) {
      if (tempData.skills.length >= 5) {
        alert("You can only have up to 5 skills.");
        return;
      }

      const newSkills = [...tempData.skills, newSkill.trim()];
      try {
        setLoading(true);
        const response = await addSkillsToUser(profileData.id, [newSkill.trim()], token!);
        setTempData((prev) => ({
          ...prev,
          skills: response.data.skills,
        }));
        setProfileData((prev) => ({
          ...prev,
          skills: response.data.skills,
        }));
        setNewSkill("");
      } catch (error) {
        alert(
          `Failed to add skill: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    const newSkills = tempData.skills.filter((skill) => skill !== skillToRemove);
    try {
      setLoading(true);
      const response = await updateSkillsOfUser(profileData.id, newSkills, token!);
      setTempData((prev) => ({
        ...prev,
        skills: response.data.skills,
      }));
      setProfileData((prev) => ({
        ...prev,
        skills: response.data.skills,
      }));
    } catch (error) {
      alert(
        `Failed to remove skill: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSelect = (skill: string) => {
    if (!tempData.skills.includes(skill) && tempData.skills.length < 5) {
      setNewSkill(skill);
      addSkill();
    } else if (tempData.skills.includes(skill)) {
      alert("Skill already added.");
    } else {
      alert("You can only have up to 5 skills.");
    }
  };

  const goToPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const goToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        fullName: tempData.fullName,
        email: tempData.email,
        phone: tempData.phone,
        date_of_birth: tempData.dateOfBirth,
        address: tempData.address,
        bio: tempData.bio,
        avatar: tempData.avatar,
        skills: tempData.skills,
      };

      const response = await updateSkillsOfUser(profileData.id, tempData.skills, token!);
      setProfileData(tempData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(
        `Failed to save profile: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
    setNewSkill("");
  };

  const currentData = isEditing ? tempData : profileData;

  // Flatten suggested skills from all departments for the dropdown
  const allSuggestedSkills: string[] = Array.from(
    new Set(
      Object.values(suggestedSkills).flat() as string[]
    )
  );

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
        <RegisterFaceModal />
        <p>testcheckin: </p>
        <CheckinFaceModal />
        <div className="profile-content">
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
          <div className="card card-certificates">
            <h2 className="card-title">Certificates</h2>
            <div className="certificates-container">
              {currentData.certificates.length > 0 ? (
                <ImageGallery
                  images={currentData.certificates}
                />
              ) : (
                <p className="no-certificates">No certificates available</p>
              )}
            </div>
          </div>
          <div className="card-half-row reduced-spacing">
            <div className="card card-half">
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
                  <p className="skills-note">
                    <small>No skills added yet.</small>
                  </p>
                )}
                {isEditing && (
                  <div className="add-tag-container">
                    <select
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="form-input"
                      disabled={loading}
                    >
                      <option value="">Select a skill or type below</option>
                      {allSuggestedSkills.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Or type custom skill"
                      className="add-tag-input"
                      disabled={loading}
                    />
                    <button
                      onClick={addSkill}
                      className="add-tag-btn"
                      disabled={loading || !newSkill.trim() || tempData.skills.length >= 5}
                    >
                      Add
                    </button>
                  </div>
                )}
                {isEditing && (
                  <p className="skills-note">
                    <small>
                      {tempData.skills.length}/5 skills added
                      {tempData.skills.length >= 5 && " (Maximum reached)"}
                    </small>
                  </p>
                )}
              </div>
            </div>

            <div className="card card-half">
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