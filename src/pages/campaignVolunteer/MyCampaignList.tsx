import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Container,
  Badge,
  Paper,
  Divider,
} from "@mui/material";
import {
  PlayArrow,
  Schedule,
  CheckCircle,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import CampaignCard from "./CampaignListCard";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";

interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  status: "in-progress" | "upcoming" | "completed";
  imageUrl?: string;
  category: string[];
  registrationDate: string | null;
  location: {
    address: string;
    coordinates: [number, number];
  };
  gallery?: string[];
  phases?: {
    // Thêm phases
    phaseId: string;
    name: string;
    startDate: string;
    endDate: string;
    description?: string;
    status: string;
  }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const MyCampaignList: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const userString = localStorage.getItem("user");
        if (!userString) throw new Error("Không tìm thấy thông tin người dùng");

        const user = JSON.parse(userString);
        const token = user.token;
        if (!token) throw new Error("Token không tồn tại trong user");

        const response = await axios.get(`${API_BASE}/campaigns/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = response.data?.result?.listCampaign || [];

        const mappedCampaigns: Campaign[] = list.map((item: any) => {
          const startDate = item.startDate ? new Date(item.startDate) : null;
          const endDate = item.endDate ? new Date(item.endDate) : null;
          const registeredAt =
            item.volunteers?.find((v: any) => v.status === "approved")
              ?.registeredAt || item.createdAt;
          const registrationDate = registeredAt ? new Date(registeredAt) : null;

          return {
            id: item.campaignId || item._id,
            name: item.name || "Không có tên",
            description: item.description || "Không có mô tả",
            startDate:
              startDate && !isNaN(startDate.getTime())
                ? startDate.toISOString()
                : null,
            endDate:
              endDate && !isNaN(endDate.getTime())
                ? endDate.toISOString()
                : null,
            status:
              item.status === "in-progress" ||
              item.status === "upcoming" ||
              item.status === "completed"
                ? item.status
                : "upcoming",
            imageUrl: item.image || "https://via.placeholder.com/400x200",
            category: item.categories || [],
            registrationDate:
              registrationDate && !isNaN(registrationDate.getTime())
                ? registrationDate
                : null,
            location: {
              address: item.location?.address || "Không có địa chỉ",
              coordinates: item.location?.coordinates || [0, 0],
            },
            gallery: item.gallery || [],
            phases: item.phases || [],
          };
        });

        setCampaigns(mappedCampaigns);
        setLoading(false);
      } catch (error: any) {
        setError(error.message || "Lỗi khi lấy danh sách chiến dịch");
        setLoading(false);
        console.error("Lỗi khi lấy danh sách chiến dịch:", error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCardClick = (campaign: Campaign) => {
    if (campaign.status === "in-progress") {
      navigate(`/campaigns/${campaign.id}/tasks`);
    }
  };

  const categorizedCampaigns = useMemo(() => {
    // Sort all campaigns by registration date (newest first)
    const sortedCampaigns = [...campaigns].sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA; // Newest first
    });

    const ongoing = sortedCampaigns.filter((c) => c.status === "in-progress");
    const upcoming = sortedCampaigns.filter((c) => c.status === "upcoming");
    const completed = sortedCampaigns.filter((c) => c.status === "completed");

    return { ongoing, upcoming, completed };
  }, [campaigns]);
  console.log(categorizedCampaigns);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabData = [
    {
      label: "Đang diễn ra",
      icon: <PlayArrow />,
      campaigns: categorizedCampaigns.ongoing,
      color: "success",
    },
    {
      label: "Chưa diễn ra",
      icon: <Schedule />,
      campaigns: categorizedCampaigns.upcoming,
      color: "warning",
    },
    {
      label: "Đã kết thúc",
      icon: <CheckCircle />,
      campaigns: categorizedCampaigns.completed,
      color: "error",
    },
  ];

  const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: "center",
        backgroundColor: "grey.50",
        borderRadius: 2,
      }}
    >
      <CampaignIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Container
        sx={{ maxWidth: "90vw", mt: "100px", py: 4, textAlign: "center" }}
      >
        <Typography variant="h6">Đang tải dữ liệu...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        sx={{ maxWidth: "90vw", mt: "100px", py: 4, textAlign: "center" }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ px: 6, mt: "100px", py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Danh sách Campaign đã đăng ký
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi các campaign bạn đã tham gia
          </Typography>
        </Box>

        <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTabs-flexContainer": {
                justifyContent: "space-around",
              },
            }}
          >
            {tabData.map((tab, index) => (
              <Tab
                key={index}
                icon={
                  <Badge
                    badgeContent={tab.campaigns.length}
                    color={tab.color as any}
                    sx={{ "& .MuiBadge-badge": { right: -3, top: 3 } }}
                  >
                    {tab.icon}
                  </Badge>
                }
                label={tab.label}
                sx={{
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  minWidth: 120,
                  "&.Mui-selected": {
                    fontWeight: 600,
                  },
                }}
              />
            ))}
          </Tabs>

          {tabData.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              {tab.campaigns.length === 0 ? (
                <EmptyState
                  message={`Không có campaign nào ${tab.label.toLowerCase()}`}
                />
              ) : (
                <>
                  <Box sx={{ mb: 3, px: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {tab.label} ({tab.campaigns.length})
                    </Typography>
                    <Divider />
                  </Box>
                  <Grid container spacing={2} sx={{ px: 1 }}>
                    {tab.campaigns.map((campaign) => (
                      <Grid key={campaign.id}>
                        <CampaignCard
                          campaign={campaign}
                          onClick={() => handleCardClick(campaign)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </TabPanel>
          ))}
        </Paper>
      </Container>
    </>
  );
};

export default MyCampaignList;
