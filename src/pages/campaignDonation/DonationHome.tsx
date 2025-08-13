import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Không dùng ở đây nhưng giữ nếu cần
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getCampaigns, Campaign } from "../../apis/campaign";
import FundraisingCard from "./DonationCard"; // Sửa tên import nếu cần (từ DonationCard sang FundraisingCard)
import { MoodBad } from "@mui/icons-material"; // Icon cho trạng thái trống

const DonationHome: React.FC = () => {
  const [fundraisingCampaigns, setFundraisingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCampaigns();
        // Lọc approved ngay từ đầu để đồng bộ
        const approvedCampaigns = Array.isArray(data)
          ? data.filter((c) => c.approvalStatus === "approved")
          : [];
        setFundraisingCampaigns(approvedCampaigns);
      } catch (err) {
        console.error("Fetch campaigns error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: "active" | "completed") => {
    setSelectedTab(newValue);
  };

  // Nâng cấp Banner: Thêm gradient và mô tả
  const Banner = () => (
    <Box
      sx={{
        height: 260, // Đồng bộ chiều cao
        backgroundImage:
          "url(https://images.pexels.com/photos/6646921/pexels-photo-6646921.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        textAlign: "center",
        mb: 6,
      }}
    >
      {/* Lớp phủ gradient */}
      <Box
        sx={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6))" }}
      />
      <Box sx={{ position: "relative", px: 2 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Quyên góp
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 300 }}>
          Hỗ trợ các dự án ý nghĩa bằng cách đóng góp tài chính cùng chúng tôi.
        </Typography>
      </Box>
    </Box>
  );

  const filteredCampaigns = fundraisingCampaigns.filter((c) => {
    if (selectedTab === "active") {
      // Giả sử "draft" là "in-progress", điều chỉnh nếu cần
      return c.status === "draft"; // Hoặc thay bằng "in-progress" để đồng bộ
    }
    return c.status === "completed";
  });

  // Component cho trạng thái trống
  const EmptyState = () => (
    <Box textAlign="center" py={10}>
      <MoodBad sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Không tìm thấy dự án nào
      </Typography>
      <Typography color="text.secondary">
        Hiện tại không có dự án nào trong mục này. Vui lòng quay lại sau nhé!
      </Typography>
    </Box>
  );

  // Style chung cho các Tab
  const tabStyle = {
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    flexGrow: 1,
    minWidth: 0,
    color: "text.primary",
    "&.Mui-selected": {
      color: "primary.main",
    },
  };

  return (
    <>
      <Header />
      <Banner />

      <Container maxWidth="xl" sx={{ mb: 8 }}>
        {/* Nâng cấp Tabs: Đặt trong Paper */}
        <Paper
          elevation={2}
          sx={{
            maxWidth: 600,
            mx: "auto",
            mb: 6,
            borderRadius: 2,
            overflow: "hidden",
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
            <Tab label="Dự án đang gây quỹ" value="active" sx={tabStyle} />
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
              gridTemplateColumns: "repeat(auto-fill, 370px)", // Đồng bộ chiều rộng card
              gap: 5,
              justifyContent: "center",
            }}
          >
            {filteredCampaigns.map((c) => (
              <FundraisingCard
                key={c._id}
                campaign={c}
                style={{ width: "370px", height: "100%" }}
              />
            ))}
          </Box>
        ) : (
          <EmptyState />
        )}
      </Container>

      <Footer />
    </>
  );
};

export default DonationHome;