import React, { useState } from "react";
import { loginUser } from "../../apis/login"; // Adjust the path as needed
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState(
    () => localStorage.getItem("rememberedEmail") || ""
  );
  const [keepLoggedIn, setKeepLoggedIn] = useState(
    () => !!localStorage.getItem("rememberedEmail")
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(null);
      const result = await loginUser({ email, password });

      if (!result.user) {
        console.error("Login succeeded but result.user is missing!");
        return;
      }

      localStorage.setItem("user", JSON.stringify(result.user));
      if (keepLoggedIn) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/");
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="loginPage">
      <Link to="/">
        <img src="/logo-remove-bg.png" alt="Logo" className="logo" />
      </Link>

      <div className="loginBox">
        <h2>Sign in</h2>

        <button className="socialButton">
          <img src="/google-icon.png" alt="Google" />
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <input
          type="text"
          placeholder="Email or phone"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="passwordWrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="showLink"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <div className="checkboxWrapper">
          <a href="/forgot-password" className="forgot">
            Forgot password?
          </a>
          <input
            type="checkbox"
            id="keepLoggedIn"
            checked={keepLoggedIn}
            onChange={(e) => {
              const checked = e.target.checked;
              setKeepLoggedIn(checked);
              if (!checked) {
                localStorage.removeItem("rememberedEmail");
              }
            }}
          />
          <label htmlFor="keepLoggedIn">Keep me logged in</label>
        </div>

        {error && (
          <div className="errorContainer">
            <p className="errorText">{error}</p>
          </div>
        )}

        <button className="signInButton" onClick={handleLogin}>
          Sign in
        </button>

        <p className="joinNow">
          New to VolunteerHub Ha Tinh? <a href="/register">Register now</a>
        </p>
      </div>

      <footer className="footer">
        <span>VolunteerHub Ha Tinh © 2025</span>
        <a href="#">User Agreement</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Community Guidelines</a>
        <a href="#">Cookie Policy</a>
        <a href="#">Copyright Policy</a>
        <a href="#">Send Feedback</a>
        <a href="#">Language</a>
      </footer>
    </div>
  );
};

export default Login;
