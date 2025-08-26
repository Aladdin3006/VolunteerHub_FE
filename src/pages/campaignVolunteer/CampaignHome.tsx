import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {
  getCampaignVolunteer,
  getCategories,
  CampaignVolunteer,
  Category,
} from "../../apis/campaign";
import VolunteerCard from "./VolunteerCard";
import { MoodBad, Search, LocationOn } from "@mui/icons-material";

const CampaignHome: React.FC = () => {
  const [volunteerCampaigns, setVolunteerCampaigns] = useState<
    CampaignVolunteer[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"in-progress" | "completed">(
    "in-progress"
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isSortedByLocation, setIsSortedByLocation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [campaignData, categoryData] = await Promise.all([
          getCampaignVolunteer(),
          getCategories(),
        ]);
        const approvedCampaigns = Array.isArray(campaignData)
          ? campaignData.filter((c) => c.acceptStatus === "approved")
          : [];
        setVolunteerCampaigns(approvedCampaigns);
        setCategories(categoryData);

        // Check for category query param
        const params = new URLSearchParams(location.search);
        const categoryId = params.get("category");
        if (categoryId) {
          setSelectedCategory(categoryId);
        }
      } catch (err) {
        console.error("Fetch data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

  const handleTabChange = (
    _: React.SyntheticEvent,
    newValue: "in-progress" | "completed"
  ) => {
    setSelectedTab(newValue);
    setSelectedCategory(null);
    setSearchQuery("");
    setIsSortedByLocation(false);
    setUserLocation(null);
    navigate("/campaigns");
  };

  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setAnchorEl(null);
    setIsSortedByLocation(false);
    setUserLocation(null);
    navigate(categoryId ? `/campaigns?category=${categoryId}` : "/campaigns");
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setIsSortedByLocation(false);
    setUserLocation(null);
  };

  const handleLocationSort = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsSortedByLocation(true);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Không thể lấy vị trí của bạn. Vui lòng thử lại sau.");
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị địa lý.");
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const sortedCampaigns =
    isSortedByLocation && userLocation
      ? [...volunteerCampaigns].sort((a, b) => {
          if (!a.location?.coordinates || !b.location?.coordinates) {
            return !a.location?.coordinates ? 1 : -1;
          }
          const distA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.location.coordinates[0], // latitude
            a.location.coordinates[1] // longitude
          );
          const distB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.location.coordinates[0], // latitude
            b.location.coordinates[1] // longitude
          );
          return distA - distB;
        })
      : volunteerCampaigns;

  const filteredCampaigns = sortedCampaigns.filter(
    (c) =>
      (selectedTab === "in-progress"
        ? ["in-progress", "upcoming"].includes(c.status || "")
        : c.status === "completed") &&
      c.acceptStatus === "approved" &&
      (selectedCategory
        ? c.categories?.some((cat) => cat._id === selectedCategory)
        : true) &&
      (searchQuery
        ? c.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
  );

  const Banner = () => (
    <Box
      sx={{
        height: 360,
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
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
        }}
      />
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
        <Paper
          elevation={2}
          sx={{
            maxWidth: 1000,
            mx: "auto",
            mb: 4,
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
            <Tab label="Dự án đang diễn ra" value="in-progress" sx={tabStyle} />
            <Tab label="Dự án đã kết thúc" value="completed" sx={tabStyle} />
          </Tabs>
        </Paper>

        <Box
          sx={{
            maxWidth: 1000,
            mx: "auto",
            mb: 6,
            display: "flex",
            gap: 2,
            alignItems: "center",
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="🔍 Tìm kiếm dự án theo tên..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
              sx: { borderRadius: 2 },
            }}
            sx={{
              flex: 3,
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "background.default",
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCategoryClick}
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: 3,
              minWidth: 140,
              fontWeight: 500,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: 1,
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            {selectedCategory
              ? categories.find((cat) => cat._id === selectedCategory)?.name ||
                "Danh mục"
              : "Danh mục"}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleLocationSort}
            startIcon={<LocationOn />}
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: 3,
              minWidth: 140,
              fontWeight: 500,
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "primary.light",
              },
            }}
          >
            Gợi ý chiến dịch gần đây
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleCategorySelect(null)}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: 2, mt: 1, minWidth: 180 },
            }}
          >
            <MenuItem
              onClick={() => handleCategorySelect(null)}
              sx={{ fontWeight: !selectedCategory ? 600 : 400 }}
            >
              Tất cả
            </MenuItem>
            {categories.map((category) => (
              <MenuItem
                key={category._id}
                onClick={() => handleCategorySelect(category._id)}
                sx={{
                  fontWeight: selectedCategory === category._id ? 600 : 400,
                }}
              >
                {category.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <CircularProgress size={50} />
          </Box>
        ) : filteredCampaigns.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 370px)",
              gap: 5,
              justifyContent: "center",
            }}
          >
            {filteredCampaigns.map((c) => (
              <VolunteerCard
                key={c._id}
                campaign={c}
                userLocation={userLocation}
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

export default CampaignHome;
