import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { loginUser } from "../../apis/login";

// MUI Components
import {
  Container, Box, Grid, TextField, Button, Typography, Checkbox,
  FormControlLabel, Link, IconButton, InputAdornment, Divider,
  Alert, CircularProgress, Paper, Avatar, Fade
} from "@mui/material";

// MUI Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
      setError(err.message || "Email hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 4 },
        py: 4,
        // Background image với vị trí điều chỉnh
        backgroundImage: 'url("https://images.pexels.com/photos/6591149/pexels-photo-6591149.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'right 50px bottom 50px', // SỬA: Căn ảnh sang phải
        backgroundRepeat: 'no-repeat',
        // Lớp phủ gradient để tăng độ tương phản
        background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("https://images.pexels.com/photos/6591149/pexels-photo-6591149.jpeg")',
      }}
    >
      <Grid container spacing={4} alignItems="center" justifyContent="center">
        {/* Form đăng nhập */}
        <Grid item xs={12} md={6} lg={5}>
          <Fade in timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 4 },
                borderRadius: 4,
                maxWidth: 400,
                mx: "auto",
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <RouterLink to="/">
                  <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
                    <img src="/logo-remove-bg.png" alt="VolunteerHub Logo" style={{ width: '70%' }} />
                  </Avatar>
                </RouterLink>

                <Typography component="h1" variant="h5" sx={{ fontWeight: "bold", mb: 1, color: 'primary.dark' }}>
                  Đăng nhập
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
                  Chào mừng trở lại VolunteerHub Hà Tĩnh!
                </Typography>

                <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ mb: 2, textTransform: "none", fontSize: "1rem", borderColor: "grey.400" }} disabled={loading}>
                  Tiếp tục với Google
                </Button>

                <Divider sx={{ width: "100%", my: 2 }}>HOẶC</Divider>

                <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
                  <TextField
                    margin="normal" required fullWidth id="email" label="Email hoặc số điện thoại" name="email"
                    autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      sx: { color: 'text.primary' },
                      startAdornment: (
                        <InputAdornment position="start">
                           <EmailOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.87)' }} />

                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal" required fullWidth name="password" label="Mật khẩu"
                    type={showPassword ? "text" : "password"} id="password" autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
                    InputProps={{
                      sx: { color: 'text.primary' },
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon  sx={{ color: 'text.primary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 2 }}>
                    <FormControlLabel control={<Checkbox checked={keepLoggedIn} onChange={(e) => setKeepLoggedIn(e.target.checked)} color="primary" disabled={loading}/>} label="Ghi nhớ"/>
                    <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ textDecoration: "none" }}>
                      Quên mật khẩu?
                    </Link>
                  </Box>

                  {error && (<Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>)}

                  <Button type="submit" fullWidth variant="contained" disabled={loading}
                    sx={{
                      py: 1.5, fontSize: "1rem", fontWeight: 'bold', textTransform: 'none',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 4px 15px 0 rgba(0, 123, 255, 0.4)',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px 0 rgba(0, 123, 255, 0.6)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
                  </Button>

                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                    Chưa có tài khoản?{" "}
                    <Link component={RouterLink} to="/register" variant="body2" sx={{ textDecoration: "none", color: "primary.main", fontWeight: 'bold' }}>
                      Đăng ký ngay
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;