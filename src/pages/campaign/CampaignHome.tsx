// pages/CampaignHome.tsx
import React, { useEffect, useState } from "react";
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
import VolunteerCard from "./VolunteerCard";
import {
    getCampaigns,
    getCampaignVolunteer,
    Campaign,
    CampaignVolunteer,
} from "../../apis/campaign";

type TabKey = "fundraising" | "volunteer";

const CampaignHome: React.FC = () => {
    const [fundraisingCampaigns, setFundraisingCampaigns] = useState<Campaign[]>(
        []
    );
    const [volunteerCampaigns, setVolunteerCampaigns] = useState<
        CampaignVolunteer[]
    >([]);
    const [activeTab, setActiveTab] = useState<TabKey>("fundraising");
    const [loading, setLoading] = useState(false);

    // Fetch theo tab
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === "fundraising") {
                    const data = await getCampaigns();
                    setFundraisingCampaigns(data);
                } else {
                    const data = await getCampaignVolunteer();
                    setVolunteerCampaigns(data);
                }
            } catch (err) {
                console.error("Fetch campaigns error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

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
                    Dự án
                </Typography>
            </Box>
        </Box>
    );

    // Render grid
    const renderGrid = (): JSX.Element =>
        activeTab === "fundraising" ? (
            <Grid container spacing={3}>
                {fundraisingCampaigns.map((c) => (
                    <Grid key={c._id} item xs={12} sm={6} md={4}>
                        <FundraisingCard campaign={c} />
                    </Grid>
                ))}
            </Grid>
        ) : (
            <Grid container spacing={3}>
                {volunteerCampaigns.map((c) => (
                    <Grid key={c._id} item xs={12} sm={6} md={4}>
                        <VolunteerCard campaign={c} />
                    </Grid>
                ))}
            </Grid>
        );

    // Section Header nội dung thay đổi theo tab
    const sectionHeader = activeTab === "fundraising"
        ? {
            title: "Các dự án đang gây quỹ",
            subtitle: "Hãy lựa chọn dự án trong lĩnh vực mà bạn đang quan tâm nhất",
        }
        : {
            title: "Các dự án cần tình nguyện viên",
            subtitle: "Tham gia trở thành một phần của dự án mà bạn tâm đắc",
        };

    return (
        <>
            <Header />
            <Banner />

            <Container maxWidth="xl"  sx={{ mb: 8 }}>
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    centered
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        mb: 12,
                        borderBottom: "1px solid #ccc",
                        "& .MuiTabs-flexContainer": {
                            display: "flex",
                        },
                        "& .MuiTab-root": {
                            flex: 1,
                            fontSize: "18px",
                            fontWeight: 600,
                            textAlign: "center",
                        },
                    }}
                >
                    <Tab value="fundraising" label="Dự án đang gây quỹ" />
                    <Tab value="volunteer" label="Dự án tuyển tình nguyện viên" />
                </Tabs>

                {/* Section Title */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        {sectionHeader.title}
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ maxWidth: 600, mx: "auto" }}
                    >
                        {sectionHeader.subtitle}
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
