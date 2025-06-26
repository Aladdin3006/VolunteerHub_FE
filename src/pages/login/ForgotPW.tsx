import React, { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../apis/forgot-pw";
import "./ForgotPW.css";

const ForgotPW: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      await resetPassword({ email });

      setSuccess("Password reset link has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgotPWPage">
      <Link to="/">
        <img src="/logo-remove-bg.png" alt="Logo" className="logo" />
      </Link>

      <div className="forgotBox">
        <h2>Forgot Password</h2>
        <p className="forgotInfo">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <div className="errorContainer"><p className="errorText">{error}</p></div>}
        {success && <div className="successContainer"><p className="successText">{success}</p></div>}

        <input
          type="email"
          className="input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="signInButton" onClick={handleReset} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="joinNow">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPW;
