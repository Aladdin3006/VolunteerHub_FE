import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPasswordFinal } from "../../apis/forgot-pw";
import "./ResetPW.css";

const ResetPW: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await resetPasswordFinal({ token, newPassword });

      setSuccess("Your password has been reset successfully. You can now log in.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resetPWPage">
      <Link to="/">
        <img src="/logo-remove-bg.png" alt="Logo" className="logo" />
      </Link>

      <div className="resetBox">
        <h2>Reset Your Password</h2>

        {error && (
          <div className="errorContainer">
            <p className="errorText">{error}</p>
          </div>
        )}
        {success && (
          <div className="successContainer">
            <p className="successText">{success}</p>
          </div>
        )}

        <div className="passwordWrapper">
          <input
            type={showNewPassword ? "text" : "password"}
            className="input"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <span
            className="showLink"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? "Hide" : "Show"}
          </span>
        </div>

        <div className="passwordWrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="input"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className="showLink"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button className="signInButton" onClick={handleResetPassword} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="joinNow">
          Back to <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPW;
