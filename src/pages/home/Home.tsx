import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import HeroSection from "../../components/landing/Hero";
import StatsSection from "../../components/landing/StatsSection";
import VolunteerMarqueeFeedback from "../../components/landing/FeedBack";
import { Box } from "@mui/material";
import VolunteerHubFeatureGrid from "@/components/landing/VolunteerHubFeatureGrid";
import RankingDashboard from "@/components/landing/Ranking";
import CampaignDashboard from "../manager/CampaignDashBoard";
const Home: React.FC = () => {

  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <Box
        sx={{
          position: "relative",
          backgroundColor: "#f0f8ff",
          backgroundImage: "radial-gradient(#dbeafe 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          py: 8,
          px: 2,
        }}
      >
        <StatsSection />
        <VolunteerMarqueeFeedback/>
        <VolunteerHubFeatureGrid/>
        <CampaignDashboard/>
      </Box>
      <Footer />
    </div>
  );
};

export default Home;
