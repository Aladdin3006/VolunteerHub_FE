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
  const [volunteerCampaigns, setVolunteerCampaigns] = useState<
    CampaignVolunteer[]
  >([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch volunteer campaigns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCampaignVolunteer();
        console.log("Fetched volunteer campaigns:", data);
        const inProgressOnly = Array.isArray(data)
          ? data.filter((c) => c.acceptStatus === "approved")
          : [];
        setVolunteerCampaigns(inProgressOnly);
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
          Tình nguyện
        </Typography>
      </Box>
    </Box>
  );

  // Render grid
  const renderGrid = (): JSX.Element => (
    <Grid container spacing={3}>
      {volunteerCampaigns.map((c) => (
        <Grid key={c._id}>
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
        {/* Section Title */}
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
