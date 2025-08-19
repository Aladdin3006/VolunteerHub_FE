import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Paper, // Thêm Paper để tạo nền cho Tabs
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getCampaignVolunteer, CampaignVolunteer } from "../../apis/campaign";
import VolunteerCard from "./VolunteerCard";
import { MoodBad } from "@mui/icons-material"; // Icon cho trạng thái trống

const CampaignHome: React.FC = () => {
  const [volunteerCampaigns, setVolunteerCampaigns] = useState<CampaignVolunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"in-progress" | "completed">("in-progress");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCampaignVolunteer();
        const approvedCampaigns = Array.isArray(data)
          ? data.filter((c) => c.acceptStatus === "approved")
          : [];
        setVolunteerCampaigns(approvedCampaigns);
      } catch (err) {
        console.error("Fetch campaigns error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: "in-progress" | "completed") => {
    setSelectedTab(newValue);
  };

  // Nâng cấp Banner: Thêm gradient và mô tả
  const Banner = () => (
    <Box
      sx={{
        height: 360, // Tăng chiều cao một chút
        backgroundImage: "url(https://images.pexels.com/photos/6646921/pexels-photo-6646921.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        textAlign: "center",
        mb: 6, // Tăng khoảng cách dưới
      }}
    >
      {/* Lớp phủ gradient để tạo chiều sâu */}
      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6))" }} />
      <Box sx={{ position: "relative", px: 2 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Chung tay hành động
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 300 }}>
          Tìm kiếm và tham gia các dự án tình nguyện ý nghĩa cùng chúng tôi.
        </Typography>
      </Box>
    </Box>
  );

  const filteredCampaigns = volunteerCampaigns.filter(
    (c) => c.status === selectedTab && c.acceptStatus === "approved"
  );

  // Component cho trạng thái trống
  const EmptyState = () => (
    <Box textAlign="center" py={10}>
      <MoodBad sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Không tìm thấy dự án nào
      </Typography>
      <Typography color="text.secondary">
        Hiện tại không có dự án nào trong mục này. Vui lòng quay lại sau nhé!
      </Typography>
    </Box>
  );

  // Style chung cho các Tab để tránh lặp code
  const tabStyle = {
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    flexGrow: 1,
    minWidth: 0,
    color: "text.primary",
    '&.Mui-selected': {
      color: 'primary.main', // Màu cho tab được chọn
    },
  };

  return (
    <>
      <Header />
      <Banner />

      <Container maxWidth="xl" sx={{ mb: 8 }}>
        {/* Nâng cấp Tabs: Đặt trong Paper để nổi bật hơn */}
        <Paper
          elevation={2}
          sx={{
            maxWidth: 600,
            mx: "auto",
            mb: 6, // Tăng khoảng cách
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            TabIndicatorProps={{
              style: {
                height: "3px",
                borderRadius: "2px",
              },
            }}
          >
            <Tab label="Dự án đang diễn ra" value="in-progress" sx={tabStyle} />
            <Tab label="Dự án đã kết thúc" value="completed" sx={tabStyle} />
          </Tabs>
        </Paper>

        {/* Grid hoặc loader */}
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <CircularProgress size={50} />
          </Box>
        ) : filteredCampaigns.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 370px)", // Chiều rộng cố định mỗi card
              gap: 5, // khoảng cách giữa các card
              justifyContent: "center", // căn giữa toàn bộ grid
            }}
          >
            {filteredCampaigns.map((c) => (
              <VolunteerCard
                key={c._id}
                campaign={c}
                style={{ width: "370px", height: "100%" }}
              />
            ))}
          </Box>

        ) : (
          <EmptyState /> // Hiển thị trạng thái trống
        )}
      </Container>

      <Footer />
    </>
  );
};

export default CampaignHome;