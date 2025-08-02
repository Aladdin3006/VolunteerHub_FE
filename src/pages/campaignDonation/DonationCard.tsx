import React from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Campaign } from "../../apis/campaign";

interface Props {
  campaign: Campaign;
}

const FundraisingCard: React.FC<Props> = ({ campaign }) => {
  const navigate = useNavigate();

  // Chỉ render Card nếu approvalStatus là "approved"
  if (campaign.approvalStatus !== "approved") {
    return null;
  }

  const raised = campaign.currentAmount ?? 0;
  const target = campaign.goalAmount ?? 1;
  const progress = (raised / target) * 100;

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        transition: "transform .2s, box-shadow .2s",
        width: 450,
        height: 400,
        "&:hover": { transform: "translateY(-4px)", boxShadow: 20 },
      }}
    >
      <CardActionArea onClick={() => navigate(`/donations/${campaign._id}`)}>
        {/* Ảnh */}
        <CardMedia
          component="img"
          height="200"
          image={campaign.thumbnail || "https://via.placeholder.com/300x200"}
          alt={campaign.title}
          sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
        />

        <CardContent sx={{ padding: 2 }}>
          {/* Tổ chức */}
          <Typography variant="caption" color="text.secondary">
            {campaign.createdBy?.fullName || "Tổ chức ẩn danh"}
          </Typography>
          {/* Tiêu đề */}
          <Typography
            variant="h6"
            component="h3"
            sx={{ mt: 0.5, mb: 1, fontWeight: 600 }}
            noWrap
          >
            {campaign.title}
          </Typography>
          {/* Thanh tiến độ */}
          <Box sx={{ position: "relative", mt: 1, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: "#BBDEFB",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#1976D2",
                },
              }}
            />
            {/* % ngay trên thanh */}
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                top: -20,
                right: 0,
                fontWeight: 500,
                color: "#009688",
              }}
            >
              {progress.toFixed(1)}%
            </Typography>
          </Box>
          {/* Số tiền */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" fontWeight={600}>
              {raised.toLocaleString()}đ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              với mục tiêu {target.toLocaleString()}đ
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default FundraisingCard;