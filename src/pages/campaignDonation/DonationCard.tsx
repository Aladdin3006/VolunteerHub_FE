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
import { Campaign } from "../../apis/campaign";
import {
  LocationOnOutlined,
  EventOutlined,
  CategoryOutlined,
} from "@mui/icons-material";

interface Props {
  campaign: Campaign;
  style?: React.CSSProperties;
}

const FundraisingCard: React.FC<Props> = ({ campaign, style }) => {
  const navigate = useNavigate();

  if (campaign.approvalStatus !== "approved") {
    return null;
  }

  const cardStatus =
    campaign.status === "draft" ? "in-progress" : campaign.status;

  // Calculate progress based on status
  const raised =
    cardStatus === "in-progress"
      ? campaign.currentAmount ?? 0
      : campaign.totalEnd ?? 0;
  const target = campaign.goalAmount ?? 1;
  const progress = Math.min((raised / target) * 100, 100);

  // Assign letters to categories (simulating the image's A-Z pattern)
  const categoryLetters = "ABCDEFGHIMNYT".split("");
  const categoriesWithLetters =
    campaign.tags?.map((cat, index) => ({
      ...cat,
      letter: categoryLetters[index] || "",
    })) || [];

  return (
    <Card
      elevation={0}
      style={style}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={campaign.thumbnail || "https://via.placeholder.com/600x350"}
          alt={campaign.title}
          onClick={() => navigate(`/donations/${campaign._id}`)}
          sx={{ cursor: "pointer", objectFit: "cover" }}
        />
        <Chip
          label={cardStatus === "in-progress" ? "Đang gây quỹ" : "Đã kết thúc"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontWeight: "bold",
            backgroundColor:
              cardStatus === "in-progress"
                ? "rgba(25, 118, 210, 0.9)"
                : "rgba(0, 0, 0, 0.6)",
            color: "#fff",
          }}
        />
      </Box>

      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {campaign.title}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2, color: "text.secondary" }}>
          <Box display="flex" alignItems="center">
            <EventOutlined fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {new Date(campaign.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            <CategoryOutlined fontSize="small" sx={{ mr: 1 }} />
            {categoriesWithLetters.map((cat, index) => (
              <Button
                key={cat._id}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#ffffffff",
                  borderRadius: "20px",
                  padding: "2px 10px", // Reduced padding for smaller size
                  minWidth: "80px", // Adjusted width to make it smaller
                  textTransform: "none",
                  "& .MuiButton-label": {
                    fontSize: "0.4rem", // Smaller font size
                    fontWeight: "normal",
                  },
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
                      fontSize: "0.25rem", // Even smaller font size
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center", // Center the text
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

        <Box sx={{ mt: "auto" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Typography variant="caption" color="text.secondary">
              Đã quyên góp
            </Typography>
            <Typography variant="caption" fontWeight="600">
              {raised.toLocaleString()}đ / {target.toLocaleString()}đ
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                flexGrow: 1,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "primary.main",
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {progress.toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="medium"
          onClick={() => navigate(`/donations/${campaign._id}`)}
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            textTransform: "none",
            py: 1,
          }}
        >
          {cardStatus === "completed" ? "Xem lại dự án" : "Xem chi tiết"}
        </Button>
      </Box>
    </Card>
  );
};

export default FundraisingCard;
