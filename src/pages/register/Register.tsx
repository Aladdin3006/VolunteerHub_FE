import React, { useState } from 'react';
import { registerUser } from '../../apis/register';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  Link,
  Paper,
  Avatar,
  Fade,
  ThemeProvider,
  createTheme,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    body2: {
      fontSize: '0.9rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
});

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    date_of_birth: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên.';
    if (!formData.email.trim()) errors.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email không hợp lệ.';
    if (!formData.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
    else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Số điện thoại không hợp lệ.';
    if (!formData.date_of_birth) errors.date_of_birth = 'Vui lòng chọn ngày sinh.';
    if (!formData.password) errors.password = 'Vui lòng nhập mật khẩu.';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Mật khẩu không khớp.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        date_of_birth: formData.date_of_birth,
      };
      const response = await registerUser(submitData);
      alert(response.message || 'Đăng ký thành công. Vui lòng xác thực email.');
      setFormData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', date_of_birth: '' });
      setFormErrors({});
    } catch (err: any) {
      alert(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          backgroundImage: 'url("/bg-login.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        <Container
          component="main"
          maxWidth="sm"
          sx={{
            py: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1, // Đảm bảo nội dung nằm trên background
          }}
        >
          <Fade in timeout={600}>
            <Paper
              elevation={6}
              sx={{
                py: { xs: 4, md: 6 },
                px: { xs: 3, md: 5 },
                borderRadius: 4,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Avatar
                src="/logo-remove-bg.png"
                alt="VolunteerHub Logo"
                sx={{ width: 80, height: 80, mb: 3, boxShadow: 3 }}
              />
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                Tạo tài khoản
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Tham gia cộng đồng VolunteerHub Hà Tĩnh ngay hôm nay!
              </Typography>

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                <Grid container spacing={2} direction="column">
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      id="fullName"
                      label="Họ và Tên"
                      name="fullName"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={!!formErrors.fullName}
                      helperText={formErrors.fullName || 'Tên sẽ được dùng trên chứng nhận.'}
                      aria-describedby="fullName-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      id="phone"
                      label="Số điện thoại"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      aria-describedby="phone-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      id="email"
                      label="Địa chỉ Email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      aria-describedby="email-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      id="date_of_birth"
                      label="Ngày sinh"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      error={!!formErrors.date_of_birth}
                      helperText={formErrors.date_of_birth}
                      InputLabelProps={{ shrink: true }}
                      aria-describedby="date_of_birth-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      name="password"
                      label="Mật khẩu"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      aria-describedby="password-helper-text"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      name="confirmPassword"
                      label="Xác nhận mật khẩu"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      aria-describedby="confirmPassword-helper-text"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked id="keepLoggedIn" />}
                      label="Duy trì đăng nhập"
                      sx={{ color: 'text.secondary' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2, mt: 1 }}>
                      Bằng việc đăng ký, bạn đồng ý với{' '}
                      <Link href="#" underline="hover" color="primary.main">
                        Điều khoản Dịch vụ
                      </Link>{' '}
                      và{' '}
                      <Link href="#" underline="hover" color="primary.main">
                        Chính sách Bảo mật
                      </Link>{' '}
                      của chúng tôi.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{
                        py: 1.5,
                        mt: 2,
                        fontSize: '1.1rem',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 6,
                        },
                        borderRadius: '8px',
                        minWidth: '100%',
                      }}
                    >
                      {isSubmitting ? 'Đang xử lý...' : 'Đăng Ký'}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
                      Đã có tài khoản?{' '}
                      <Link href="/login" underline="hover" color="primary.main" fontWeight="bold">
                        Đăng nhập ngay
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Fade>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              VolunteerHub Hà Tĩnh © 2025
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Register;