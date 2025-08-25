import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SpeedIcon from "@mui/icons-material/Speed";
import StorageIcon from "@mui/icons-material/Storage";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import GppMaybeOutlinedIcon from "@mui/icons-material/GppMaybeOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href?: string;
};

const featuresVM: Feature[] = [
  {
    icon: <CampaignIcon />,
    title: "Tuyển dụng Tình nguyện viên",
    desc:
      "Tăng cường tuyển dụng với trang giới thiệu chuyên nghiệp, gửi email/SMS, đăng ký tự động trên mọi thiết bị và quản lý hồ sơ dễ dàng.",
  },
  {
    icon: <EventAvailableIcon />,
    title: "Lịch trình Tình nguyện",
    desc:
      "Tạo sự kiện, xem danh sách đăng ký, quản lý danh sách chờ và cho phép tình nguyện viên đăng ký từ bất kỳ đâu có Internet.",
  },
  {
    icon: <SpeedIcon />,
    title: "Theo dõi Giờ tình nguyện",
    desc:
      "Tự động ghi nhận hoạt động và số giờ tình nguyện, loại bỏ việc nhập liệu thủ công và dễ dàng xem thống kê theo sự kiện hoặc cá nhân.",
  },
  {
    icon: <StorageIcon />,
    title: "Cơ sở dữ liệu Tình nguyện viên",
    desc:
      "Lưu trữ toàn bộ thông tin: liên hệ, kỹ năng, lịch rảnh… và truy cập trên mọi thiết bị.",
  },
  {
    icon: <AttachMoneyOutlinedIcon />,
    title: "Gây quỹ Tình nguyện",
    desc:
      "Tổ chức các chiến dịch gây quỹ gắn liền với chương trình tình nguyện để tăng sự gắn kết và tác động xã hội.",
  },
  {
    icon: <GppMaybeOutlinedIcon />,
    title: "Quản lý Trách nhiệm pháp lý",
    desc:
      "Tập trung quản lý giấy tờ miễn trừ, kiểm tra và hồ sơ tuân thủ để giảm rủi ro và luôn sẵn sàng kiểm toán.",
  },
  {
    icon: <StarOutlineIcon />,
    title: "Khen thưởng & Ghi nhận",
    desc:
      "Ghi nhận đóng góp với huy hiệu, cột mốc và các chương trình khen thưởng.",
  },
  {
    icon: <BarChartOutlinedIcon />,
    title: "Báo cáo & Thống kê",
    desc:
      "Tạo báo cáo tùy chỉnh về số giờ, sự kiện, mức độ tham gia và các hoạt động cộng đồng.",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function FeatureCard({ icon, title, desc, href = "#" }: Feature) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6 }} // card nâng lên khi hover
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
    >
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 3,
          boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
          "&:hover": { boxShadow: "0 6px 16px rgba(16,24,40,0.16)" },
          transition: "box-shadow .25s ease",
        }}
      >
        <CardHeader
          avatar={
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.3 }}>
              <Avatar
                sx={{
                  bgcolor: "grey.100",
                  color: "text.primary",
                  width: 40,
                  height: 40,
                }}
              >
                {icon}
              </Avatar>
            </motion.div>
          }
          titleTypographyProps={{ variant: "h6" }}
          title={title}
          sx={{ pb: 0, alignItems: "flex-start" }}
        />
        <CardContent sx={{ pt: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {desc}
          </Typography>
          <Button
            href={href}
            endIcon={<ArrowForwardIosRoundedIcon fontSize="small" />}
            sx={{ px: 0, textTransform: "none" }}
          >
            Learn more
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function VolunteerHubFeatureGrid() {
  const [tab, setTab] = React.useState(0);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 999,
            p: 0.5,
            boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
            ".MuiTabs-flexContainer": { gap: 0.5 },
            ".MuiTab-root": {
              textTransform: "none",
              borderRadius: 999,
              px: { xs: 2, sm: 3 },
              py: 1,
              minHeight: 40,
            },
            ".Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
            },
            ".MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab label="Volunteer Management" />
          <Tab label="Opportunity Management" />
          <Tab label="Volunteer Communication" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }} // chỉ chạy khi cuộn xuống
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {featuresVM.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </motion.div>
      )}

      {tab === 1 && (
        <Box sx={{ textAlign: "center", color: "text.secondary", py: 8 }}>
          Opportunity Management content
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ textAlign: "center", color: "text.secondary", py: 8 }}>
          Volunteer Communication content
        </Box>
      )}
    </Box>
  );
}
