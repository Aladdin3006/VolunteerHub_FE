import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  CalendarToday,
  Category,
  PlayArrow,
  Info,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";

interface Campaign {
  location: {
    address: string;
  };
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "in-progress" | "upcoming" | "completed";
  currentPhase?: {
    name: string;
    startDate: string;
    endDate: string;
    description: string;
  };
  phases: {
    phaseId: string;
    name: string;
    startDate: string;
    endDate: string;
    description?: string;
    status: string;
  }[];
  imageUrl?: string;
  category: string;
  registrationDate: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onClick?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "success";
      case "upcoming":
        return "warning";
      case "completed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-progress":
        return <PlayArrow />;
      case "upcoming":
        return <Schedule />;
      case "completed":
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

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

  const findNearestPhase = () => {
    if (!campaign.phases || campaign.phases.length === 0) {
      console.warn("Không có giai đoạn nào cho chiến dịch:", campaign.name);
      return null;
    }

    const now = new Date().getTime();
    let nearestPhase = null;
    let minDiff = Infinity;

    // Kiểm tra giai đoạn đang hoạt động trước (startDate <= now <= endDate)
    const activePhase = campaign.phases.find((phase) => {
      const start = new Date(phase.startDate).getTime();
      const end = new Date(phase.endDate).getTime();
      return !isNaN(start) && !isNaN(end) && start <= now && now <= end;
    });

    if (activePhase) {
      return activePhase;
    }

    // Nếu không có giai đoạn đang hoạt động, tìm giai đoạn có startDate gần nhất
    campaign.phases.forEach((phase) => {
      const phaseStartDate = new Date(phase.startDate);
      if (isNaN(phaseStartDate.getTime())) {
        console.warn(`Ngày bắt đầu không hợp lệ cho giai đoạn: ${phase.name}`);
        return;
      }
      const diff = Math.abs(now - phaseStartDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearestPhase = phase;
      }
    });

    return nearestPhase;
  };

  const progress = calculateProgress();
  const nearestPhase = findNearestPhase();

  return (
    <Card
      onClick={onClick}
      sx={{
        width: 360,
        height: 580,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardMedia
        component="img"
        height="250"
        image={campaign.imageUrl || "https://via.placeholder.com/450x250"}
        alt={campaign.name}
        sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
      />
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 2,
          minHeight: 0,
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="h6" sx={{ fontWeight: 600, maxWidth: "70%" }}>
            {campaign.name}
          </Typography>
          <Chip
            icon={getStatusIcon(campaign.status)}
            label={
              campaign.status === "in-progress"
                ? "Đang diễn ra"
                : campaign.status === "upcoming"
                ? "Chưa diễn ra"
                : "Đã kết thúc"
            }
            color={getStatusColor(campaign.status)}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <Category sx={{ fontSize: 16, mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {campaign.location?.address || "Chưa rõ địa điểm"}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <CalendarToday
            sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
          </Typography>
        </Box>

        {campaign.status === "in-progress" && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Tiến độ tổng thể
              </Typography>
              <Box display="flex" alignItems="center">
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Giai đoạn hiện tại
              </Typography>
              {/* Nâng cấp giao diện cho giai đoạn gần nhất */}
              {nearestPhase ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Chip
                    label={nearestPhase.name}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      fontSize: "1.0rem",
                      "&:hover": {
                        backgroundColor: (theme) => theme.palette.primary.light,
                      },
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có giai đoạn hoặc dữ liệu không hợp lệ
                </Typography>
              )}
            </Box>
          </>
        )}

        <Divider sx={{ mt: "auto", mb: 1 }} />
      </CardContent>
    </Card>
  );
};

export default CampaignCard;
