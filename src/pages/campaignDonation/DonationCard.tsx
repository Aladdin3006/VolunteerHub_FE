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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Campaign } from "../../apis/campaign";
import { LocationOnOutlined, EventOutlined } from "@mui/icons-material"; // Thêm icons (giả sử có location và startDate tương tự)

interface Props {
  campaign: Campaign;
  style?: React.CSSProperties; // Chấp nhận style từ component cha
}

const FundraisingCard: React.FC<Props> = ({ campaign, style }) => {
  const navigate = useNavigate();

  // Chỉ render Card nếu approvalStatus là "approved"
  if (campaign.approvalStatus !== "approved") {
    return null;
  }

  const raised = campaign.currentAmount ?? 0;
  const target = campaign.goalAmount ?? 1;
  const progress = Math.min((raised / target) * 100, 100);

  // Giả sử status là 'in-progress' cho active, 'completed' cho kết thúc (đồng bộ với file trước)
  const cardStatus = campaign.status === "draft" ? "in-progress" : campaign.status; // Điều chỉnh nếu status thực tế khác

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
        display: "flex",
        flexDirection: "column",
        height: "100%", // Đảm bảo thẻ chiếm hết chiều cao
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180" // Đồng bộ chiều cao ảnh
          image={campaign.thumbnail || "https://via.placeholder.com/600x350"}
          alt={campaign.title}
          onClick={() => navigate(`/donations/${campaign._id}`)}
          sx={{ cursor: "pointer" }}
        />
        {/* Thêm Chip trạng thái */}
        <Chip
          label={cardStatus === "in-progress" ? "Đang gây quỹ" : "Đã kết thúc"}
          color={cardStatus === "in-progress" ? "success" : "default"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#fff",
            backgroundColor:
              cardStatus === "in-progress" ? "rgba(25, 118, 210, 0.8)" : "rgba(0, 0, 0, 0.5)",
          }}
        />
      </Box>

      {/* CardContent chiếm hết không gian còn lại */}
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          fontWeight="bold"
          gutterBottom
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2, // Giới hạn tên dự án trong 2 dòng
          }}
        >
          {campaign.title}
        </Typography>

        {/* Thông tin địa điểm và ngày tháng với icon (giả sử có dữ liệu tương tự) */}
        <Stack spacing={1} sx={{ my: 1.5, color: "text.secondary" }}>
          <Box display="flex" alignItems="center">
            <EventOutlined fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {new Date(campaign.createdAt).toLocaleDateString() || "Ngày không xác định"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <LocationOnOutlined fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {/* {campaign.location?.address || "Nhiều địa điểm"}
               */}
               Nhiều địa điểm
            </Typography>
          </Box>
        </Stack>

        {/* Thanh tiến độ và số lượng */}
        <Box sx={{ mt: "auto" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Số tiền đã quyên góp
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {raised.toLocaleString()}đ / {target.toLocaleString()}đ
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </CardContent>

      {/* Nút bấm ở dưới cùng */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            ...(cardStatus === "completed" && {
              backgroundColor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.primary.contrastText,
              '&:disabled': {
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
              },
            }),
          }}
          onClick={() => navigate(`/donations/${campaign._id}`)}
          disabled={cardStatus === "completed"} // Vô hiệu hóa nếu đã kết thúc
        >
          {cardStatus === "completed" ? "Xem lại dự án" : "Xem chi tiết"}
        </Button>
      </Box>
    </Card>
  );
};

export default FundraisingCard;