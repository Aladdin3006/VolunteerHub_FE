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
import FundraisingCard from "./DonationCard";
import { getCampaigns, Campaign } from "../../apis/campaign";

const DonationHome: React.FC = () => {
  const [fundraisingCampaigns, setFundraisingCampaigns] = useState<Campaign[]>(
    []
  );
  const [loading, setLoading] = useState(false);

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

  // Render grid
  const renderGrid = (): JSX.Element => (
    <Grid container spacing={3}>
      {fundraisingCampaigns.map((c) => (
        <Grid key={c._id}>
          <FundraisingCard campaign={c} />
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
            Các dự án đang gây quỹ
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
