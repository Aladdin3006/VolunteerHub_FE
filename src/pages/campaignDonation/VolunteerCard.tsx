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
import { CampaignVolunteer } from "../../apis/campaign";   // ✅ import type

interface Props {
  campaign: CampaignVolunteer;
}

const VolunteerCard: React.FC<Props> = ({ campaign }) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        transition: "transform .2s, box-shadow .2s",
        width: 450, // Thay đổi chiều rộng tại đây
        height: 400, // Thay đổi chiều cao tại đây
        "&:hover": { transform: "translateY(-4px)", boxShadow: 20 },
      }}
    >
      <CardActionArea
        component="div" // ✅ thêm dòng này để tránh HTML lỗi
        onClick={() => navigate(`/volunteer/${campaign._id}`)} // nhớ thêm ID nếu cần
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

          <Button
            variant="contained"
            size="small"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Tham gia ngay
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VolunteerCard;
