import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  LinearProgress,
  Chip,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CampaignVolunteer } from "../../apis/campaign";
import {
  LocationOnOutlined,
  EventOutlined,
  PersonOutline,
  CategoryOutlined,
} from "@mui/icons-material";

interface Props {
  campaign: CampaignVolunteer;
  style?: React.CSSProperties;
  userLocation?: { latitude: number; longitude: number } | null;
}

const VolunteerCard: React.FC<Props> = ({ campaign, style, userLocation }) => {
  const navigate = useNavigate();

  const volunteersJoined = campaign.volunteers?.length || 0;
  const calculateProgress = () => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.round((elapsed / total) * 100);
  };
  const progress = calculateProgress();

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

  const distance =
    userLocation && campaign.location?.coordinates
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          campaign.location.coordinates[0], // latitude
          campaign.location.coordinates[1] // longitude
        ).toFixed(1)
      : null;

  const categoryLetters = "ABCDEFGHIMNYT".split("");
  const categoriesWithLetters =
    campaign.categories?.map((cat, index) => ({
      ...cat,
      letter: categoryLetters[index] || "",
    })) || [];

  const getStatusLabel = () => {
    switch (campaign.status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "in-progress":
        return "Đang diễn ra";
      case "completed":
        return "Đã kết thúc";
      default:
        return "Đang diễn ra";
    }
  };

  const getStatusColor = () => {
    switch (campaign.status) {
      case "upcoming":
        return "rgba(255, 165, 0, 0.8)"; // Orange for upcoming
      case "in-progress":
        return "rgba(25, 118, 210, 0.8)"; // Blue for in-progress
      default:
        return "rgba(0, 0, 0, 0.5)"; // Gray for completed
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/campaigns?category=${categoryId}`);
  };

  return (
    <Card
      elevation={3}
      style={style}
      sx={{
        borderRadius: 4,
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow:
            "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
        },
        minHeight: 460,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={campaign.image || "https://via.placeholder.com/600x350"}
          alt={campaign.name}
          onClick={() => navigate(`/campaigns/${campaign._id}`)}
          sx={{ cursor: "pointer" }}
        />
        <Chip
          label={getStatusLabel()}
          color={campaign.status === "in-progress" ? "success" : "default"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#fff",
            backgroundColor: getStatusColor(),
          }}
        />
      </Box>

      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography
          variant="h6"
          component="h3"
          fontWeight="bold"
          gutterBottom
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {campaign.name}
        </Typography>

        <Stack spacing={1} sx={{ my: 1.5, color: "text.secondary" }}>
          <Box display="flex" alignItems="center">
            <EventOutlined fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {new Date(campaign.startDate).toLocaleDateString()} đến{" "}
              {new Date(campaign.endDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <LocationOnOutlined fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {campaign.location?.address || "Nhiều địa điểm"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            <CategoryOutlined fontSize="small" sx={{ mr: 1 }} />
            {categoriesWithLetters.map((cat) => (
              <Button
                key={cat._id}
                variant="contained"
                size="small"
                onClick={() => handleCategoryClick(cat._id)}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#ffffff",
                  borderRadius: "20px",
                  padding: "0px 5px",
                  minWidth: "50px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#45a049",
                  },
                }}
                startIcon={
                  <Avatar
                    sx={{
                      width: 18,
                      height: 18,
                      backgroundColor: "#D3D3D3",
                      color: "#808080",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cat.name.charAt(0)}
                  </Avatar>
                }
              >
                {cat.name}
              </Button>
            ))}
          </Box>
        </Stack>

        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Box display="flex" alignItems="center">
              <PersonOutline fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Tình nguyện viên
              </Typography>
            </Box>
            <Typography variant="caption" fontWeight="bold">
              {volunteersJoined} TNV
            </Typography>
          </Box>

          {distance && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                Cách bạn
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                {distance} km
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            ...(campaign.status === "completed" && {
              backgroundColor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.primary.contrastText,
              "&:disabled": {
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
              },
            }),
          }}
          onClick={() => navigate(`/campaigns/${campaign._id}`)}
          disabled={campaign.status === "completed"}
        >
          {campaign.status === "completed" ? "Xem lại dự án" : "Xem chi tiết"}
        </Button>
      </Box>
    </Card>
  );
};

export default VolunteerCard;
