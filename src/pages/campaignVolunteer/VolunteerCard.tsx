import React from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CampaignVolunteer } from "../../apis/campaign";
// import { useAuth } from "../../contexts/AuthContext"; // 👈 hoặc hook bạn đang dùng để lấy currentUserId

interface Props {
  campaign: CampaignVolunteer;
}

const VolunteerCard: React.FC<Props> = ({ campaign }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Tìm volunteer hiện tại của user trong danh sách campaign.volunteers

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
      <CardActionArea
        component="div"
        onClick={() => navigate(`/campaigns/${campaign._id}`)}
      >
        <CardMedia
          component="img"
          height="200"
          image={campaign.image || "https://via.placeholder.com/600x350"}
          alt={campaign.name}
        />

        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom noWrap>
            {campaign.name}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {campaign.startDate && (
              <Typography variant="caption" color="text.secondary">
                Bắt đầu: {new Date(campaign.startDate).toLocaleDateString()}
              </Typography>
            )}
            {campaign.location?.address && (
              <Typography variant="caption" color="text.secondary">
                {campaign.location.address}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              sx={{ borderRadius: 2, textTransform: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/volunteer/${campaign._id}`);
              }}
            >
              Tham gia ngay
            </Button>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VolunteerCard;
