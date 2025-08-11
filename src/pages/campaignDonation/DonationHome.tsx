import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import FundraisingCard from "./DonationCard";
import { getCampaigns, Campaign } from "../../apis/campaign";

const DonationHome: React.FC = () => {
  const [fundraisingCampaigns, setFundraisingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"active" | "completed">("active");

  // Fetch fundraising campaigns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCampaigns();
        setFundraisingCampaigns(data);
      } catch (err) {
        console.error("Fetch campaigns error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Banner
  const Banner = () => (
    <Box
      sx={{
        height: 220,
        backgroundImage:
          "url(https://images.pexels.com/photos/6646921/pexels-photo-6646921.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        mb: 4,
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,.4)" }} />
      <Box
        sx={{
          position: "relative",
          height: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3" sx={{ color: "#fff", fontWeight: 700 }}>
          Quyên góp
        </Typography>
      </Box>
    </Box>
  );

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: "active" | "completed") => {
    setSelectedTab(newValue);
  };

  // Render grid
  const renderGrid = (): JSX.Element => {
    const filtered = fundraisingCampaigns.filter((c) => {
    if (selectedTab === "active") {
      // Dự án đang gây quỹ
      return c.approvalStatus === "approved" && c.status === "draft";
    }
    // Dự án đã kết thúc
    return c.approvalStatus === "approved" && c.status === "completed";
  });
    return (
      <Grid container spacing={3}>
        {filtered.map((c) => (
          <Grid item key={c._id} xs={12} sm={6} md={4}>
            <FundraisingCard campaign={c} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Header />
      <Banner />

      <Container maxWidth="xl" sx={{ mb: 8 }}>
        {/* Tabs */}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Box
            sx={{
              maxWidth: 600,
              mx: "auto",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              TabIndicatorProps={{
                style: {
                  height: "4px",
                  backgroundColor: "#1976d2", // xanh nước biển
                  borderRadius: "2px",
                },
              }}
              sx={{
                width: "100%",
              }}
            >
              <Tab
                label="Dự án đang gây quỹ"
                value="active"
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  textTransform: "none",
                  flexGrow: 1,
                  minWidth: 0,
                  color: "#000",
                }}
              />
              <Tab
                label="Dự án đã kết thúc"
                value="completed"
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  textTransform: "none",
                  flexGrow: 1,
                  minWidth: 0,
                  color: "#000",
                }}
              />
            </Tabs>
          </Box>
        </Box>




        {/* Section Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {selectedTab === "active" ? "Các dự án đang gây quỹ" : "Các dự án đã kết thúc"}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Hãy lựa chọn dự án trong lĩnh vực mà bạn đang quan tâm nhất
          </Typography>
        </Box>

        {/* Grid or loader */}
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderGrid()
        )}
      </Container>

      <Footer />
    </>
  );
};

export default DonationHome;
