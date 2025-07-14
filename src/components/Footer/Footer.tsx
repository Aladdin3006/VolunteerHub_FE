// Footer.tsx
import React from "react";
import { Box, Typography, IconButton, Stack, Link as MuiLink } from "@mui/material";
import { FaFacebookF, FaInstagram, FaTwitter, FaHeart } from "react-icons/fa";
import { keyframes } from "@emotion/react";

const glow = keyframes`
  0% { text-shadow: 0 0 5px #1976d2, 0 0 10px #1976d2; }
  50% { text-shadow: 0 0 20px #1976d2, 0 0 30px #1976d2; }
  100% { text-shadow: 0 0 5px #1976d2, 0 0 10px #1976d2; }
`;

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0f172a",
        color: "#fff",
        mt: 8,
        py: 6,
        px: 4,
        textAlign: "center",
        borderTop: "4px solid #1976d2",
        position: "relative",
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
        <img src="/logo-remove-bg.png" alt="Logo" style={{ height: 40 }} />
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            animation: `${glow} 3s ease-in-out infinite`,
          }}
        >
          VolunteerHub Hà Tĩnh
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Kết nối – Hành động – Lan toả yêu thương 💙
      </Typography>

      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton
          component="a"
          href="https://facebook.com"
          target="_blank"
          sx={{ color: "#fff", transition: "0.3s", "&:hover": { color: "#1976d2" } }}
        >
          <FaFacebookF />
        </IconButton>
        <IconButton
          component="a"
          href="https://instagram.com"
          target="_blank"
          sx={{ color: "#fff", transition: "0.3s", "&:hover": { color: "#E1306C" } }}
        >
          <FaInstagram />
        </IconButton>
        <IconButton
          component="a"
          href="https://twitter.com"
          target="_blank"
          sx={{ color: "#fff", transition: "0.3s", "&:hover": { color: "#1DA1F2" } }}
        >
          <FaTwitter />
        </IconButton>
      </Stack>

      <Typography variant="body2" color="gray">
        © {new Date().getFullYear()} Được làm bằng <FaHeart color="red" style={{ verticalAlign: "middle" }} /> bởi trường đại học FPT.
      </Typography>

      <Stack
        direction="row"
        justifyContent="center"
        spacing={3}
        mt={2}
        sx={{ flexWrap: "wrap" }}
      >
        {[
          { label: "Trang chủ", href: "/" },
          { label: "Chiến dịch", href: "/campaigns" },
          { label: "Về chúng tôi", href: "/about-us" },
          { label: "Cộng đồng", href: "/news" },
          { label: "Liên hệ", href: "/contact" },
        ].map((link) => (
          <MuiLink
            key={link.href}
            href={link.href}
            underline="none"
            color="inherit"
            sx={{
              fontSize: 14,
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#1976d2",
                textDecoration: "underline",
              },
            }}
          >
            {link.label}
          </MuiLink>
        ))}
      </Stack>
    </Box>
  );
};

export default Footer;
