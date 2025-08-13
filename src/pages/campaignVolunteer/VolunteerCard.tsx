import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  Box, // Dùng Box để layout linh hoạt hơn
  LinearProgress, // Thêm thanh tiến độ
  Chip, // Dùng Chip để hiển thị tag
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CampaignVolunteer } from "../../apis/campaign";
import { LocationOnOutlined, EventOutlined, PersonOutline } from "@mui/icons-material"; // Thêm icons

interface Props {
  campaign: CampaignVolunteer;
  style?: React.CSSProperties; // Chấp nhận style từ component cha
}

const VolunteerCard: React.FC<Props> = ({ campaign, style }) => {
  const navigate = useNavigate();

  // Tính toán giả lập cho thanh tiến độ (bạn có thể thay bằng dữ liệu thật)
  const volunteersJoined = campaign.volunteers?.length || 0;
  const volunteersNeeded = campaign.volunteerJobs?.reduce((sum, job) => sum + (job.quantity || 0), 0) || 1;
  const progress = Math.min((volunteersJoined / volunteersNeeded) * 100, 100);

  return (
    <Card
      elevation={3}
      style={style} // Áp dụng style từ cha
      sx={{
        borderRadius: 4, // Bo góc mềm mại hơn
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)", // Hiệu ứng nổi bật hơn
          boxShadow: "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
        },
        // Layout flex để các phần tử bên trong co dãn tốt
        display: "flex",
        flexDirection: "column",
        height: '100%', // Quan trọng: đảm bảo thẻ chiếm hết chiều cao của Grid item
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180" // Giảm chiều cao ảnh một chút
          image={campaign.image || "https://via.placeholder.com/600x350"}
          alt={campaign.name}
          onClick={() => navigate(`/campaigns/${campaign._id}`)}
          sx={{ cursor: 'pointer' }}
        />
        {/* Thêm Chip trạng thái */}
        <Chip
          label={campaign.status === 'in-progress' ? 'Đang diễn ra' : 'Đã kết thúc'}
          color={campaign.status === 'in-progress' ? 'success' : 'default'}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: '#fff', backgroundColor: campaign.status === 'in-progress' ? 'rgba(25, 118, 210, 0.8)' : 'rgba(0, 0, 0, 0.5)' }}
        />
      </Box>

      {/* CardContent sẽ chiếm hết không gian còn lại */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2, // Giới hạn tên dự án trong 2 dòng
          }}
        >
          {campaign.name}
        </Typography>

        {/* Thông tin địa điểm và ngày tháng với icon */}
        <Stack spacing={1} sx={{ my: 1.5, color: 'text.secondary' }}>
          <Box display="flex" alignItems="center">
            <EventOutlined fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {new Date(campaign.startDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <LocationOnOutlined fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {campaign.location?.address || 'Nhiều địa điểm'}
            </Typography>
          </Box>
        </Stack>

        {/* Thanh tiến độ và số lượng */}
        <Box sx={{ mt: 'auto' }}>
          {/* Đẩy phần này xuống dưới cùng */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            {/* Icon + text nằm cạnh nhau */}
            <Box display="flex" alignItems="center">
              <PersonOutline fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Tình nguyện viên
              </Typography>
            </Box>

            {/* Số TNV sang bên phải */}
            <Typography variant="caption" fontWeight="bold">
              {volunteersJoined}/{volunteersNeeded} TNV
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

      </CardContent>

      {/* Nút bấm để ở ngoài cùng cho rõ ràng */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 'bold' }}
          onClick={() => navigate(`/campaigns/${campaign._id}`)}
          disabled={campaign.status === 'completed'} // Vô hiệu hóa nếu đã kết thúc
        >
          {campaign.status === 'completed' ? 'Xem lại dự án' : 'Xem chi tiết'}
        </Button>
      </Box>

    </Card>
  );
};

export default VolunteerCard;