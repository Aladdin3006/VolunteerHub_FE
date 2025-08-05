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
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getCampaignVolunteer, CampaignVolunteer } from "../../apis/campaign";
import VolunteerCard from "./VolunteerCard";

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
          Tình nguyện
        </Typography>
      </Box>
    </Box>
  );

  const filteredCampaigns = volunteerCampaigns.filter(
    (c) => c.status === selectedTab && c.acceptStatus === "approved"
  );

  const renderGrid = (): JSX.Element => (
    <Grid container spacing={3}>
      {filteredCampaigns.map((c) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={c._id}>
          <VolunteerCard campaign={c} />
        </Grid>
      ))}
    </Grid>
  );

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
                  backgroundColor: "#1976d2",
                  borderRadius: "2px",
                },
              }}
              sx={{ width: "100%" }}
            >
              <Tab
                label="Dự án đang diễn ra"
                value="in-progress"
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

        {/* Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            Các dự án cần tình nguyện viên
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Tham gia trở thành một phần của dự án mà bạn tâm đắc
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

export default CampaignHome;
