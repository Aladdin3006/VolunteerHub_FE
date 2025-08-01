import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  useTheme,
  Paper,
} from "@mui/material";
import {
  LocationOn,
  DateRange,
  Category as CategoryIcon,
  Image as ImageIcon,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Description,
} from "@mui/icons-material";
import ImageGallery from "@/components/image/ImageGallery";
import { Certificate, certificateService } from "@/apis/certificate";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

interface Location {
  coordinates: [number, number];
  address: string;
}

interface Campaign {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: Location;
  categories: Category[];
  gallery: string[];
  image?: string;
  acceptStatus: string;
  status: string;
}

const CampaignModal: React.FC<{
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  renderActionButtons: () => React.ReactNode;
  formatDate: (date: Date) => string;
}> = ({ open, onClose, campaign, renderActionButtons, formatDate }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (campaign && campaign.status === "completed") {
        setLoadingCertificates(true);
        try {
          const certs = await certificateService.getCertificatesByCampaign(
            campaign._id
          );
          setCertificates(certs);
        } catch (error) {
          console.error("Failed to fetch certificates:", error);
          setCertificates([]);
        } finally {
          setLoadingCertificates(false);
        }
      } else {
        setCertificates([]);
      }
    };

    fetchCertificates();
  }, [campaign]);

  if (!campaign) return null;

  const center = campaign?.location?.coordinates
    ? {
        lat: campaign.location.coordinates[0],
        lng: campaign.location.coordinates[1],
      }
    : { lat: 10.7769, lng: 106.7009 };
  const mapEmbedUrl = campaign?.location?.coordinates
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${
        center.lng
      }!3d${
        center.lat
      }!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(
        `${center.lat},${center.lng}`
      )}!5e0!3m2!1sen!2sus!4v1634567890123`
    : "";

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "8px",
  };
  const MAX_DESCRIPTION_LENGTH = 300;
  const showReadMore = campaign.description.length > MAX_DESCRIPTION_LENGTH;
  const truncatedDescription =
    campaign.description.slice(0, MAX_DESCRIPTION_LENGTH) +
    (showReadMore ? "..." : "");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          pt: 3,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {campaign.name}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: "80%" }}
          >
            {campaign.description.length > 60
              ? `${campaign.description.substring(0, 60)}...`
              : campaign.description}
          </Typography>
        </Box>
        <Chip
          icon={<CheckCircle fontSize="small" />}
          label={campaign.status.toUpperCase()}
          color={getStatusColor(campaign.status)}
          sx={{
            height: 36,
            fontWeight: 600,
            fontSize: "0.9rem",
            "& .MuiChip-icon": {
              color: "inherit",
            },
          }}
        />
      </DialogTitle>

      <DialogContent dividers sx={{ px: 4, py: 3 }}>
        {/* Campaign Image Section */}
        {campaign.image && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />{" "}
              Hình ảnh chiến dịch
            </Typography>
            <Paper
              elevation={2}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                height: 300,
                position: "relative",
                bgcolor: "background.default",
              }}
            >
              <img
                src={campaign.image}
                alt={campaign.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Paper>
          </Box>
        )}

        {/* Gallery Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Thư
            viện ảnh
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {campaign.gallery.length > 0 ? (
              campaign.gallery.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 200,
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: theme.shadows[3],
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                Không có ảnh trong thư viện
              </Typography>
            )}
          </Box>
        </Box>

        {/* Description Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Description sx={{ mr: 1, color: theme.palette.primary.main }} /> Mô
            tả chi tiết
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: theme.palette.grey[50],
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <Typography
              variant="body1"
              paragraph
              sx={{ lineHeight: 1.8, color: theme.palette.text.primary }}
            >
              {expanded ? campaign.description : truncatedDescription}
              {showReadMore && (
                <Button
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                  sx={{
                    ml: 1,
                    textTransform: "none",
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                >
                  {expanded ? "Thu gọn" : "Xem thêm"}
                </Button>
              )}
            </Typography>
          </Paper>
        </Box>

        {/* Time Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <DateRange sx={{ mr: 1, color: theme.palette.primary.main }} /> Thời
            gian
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: theme.palette.grey[50],
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <DateRange color="primary" />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(campaign.startDate)} -{" "}
                  {formatDate(campaign.endDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calculateDateDifference(
                    campaign.startDate,
                    campaign.endDate
                  )}{" "}
                  ngày
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Location Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <LocationOn sx={{ mr: 1, color: theme.palette.primary.main }} /> Địa
            điểm
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: theme.palette.grey[50],
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <Box display="flex" alignItems="flex-start" gap={2}>
              <LocationOn color="primary" />
              <Box flex={1}>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  {campaign.location.address}
                </Typography>
                {campaign.location?.coordinates ? (
                  <Box sx={mapContainerStyle}>
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: "8px" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No location coordinates available
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Categories Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />{" "}
            Danh mục
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {campaign.categories.map((category) => (
              <Chip
                key={category._id}
                label={category.name}
                avatar={<Avatar src={category.icon} alt={category.name} />}
                sx={{
                  backgroundColor: category.color,
                  color: "white",
                  fontWeight: 500,
                  "& .MuiChip-avatar": {
                    width: 28,
                    height: 28,
                  },
                  borderRadius: 1,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Certificates Section */}
        {campaign.status === "completed" && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />{" "}
              Chứng chỉ
            </Typography>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                bgcolor: theme.palette.grey[50],
                borderRadius: 2,
                boxShadow: theme.shadows[2],
              }}
            >
              {loadingCertificates ? (
                <Typography variant="body1" color="text.secondary">
                  Đang tải chứng chỉ...
                </Typography>
              ) : certificates.length > 0 ? (
                <Box sx={{ maxWidth: "100%", margin: "0 auto" }}>
                  <Slider
                    dots={certificates.length > 1}
                    infinite={certificates.length > 1}
                    speed={500}
                    slidesToShow={Math.min(2, certificates.length)} // Reduced to show larger certificates
                    slidesToScroll={1}
                    centerMode={certificates.length > 1}
                    centerPadding="30px"
                    draggable={true} // Enable dragging
                    swipeToSlide={true} // Allow swipe/drag to slide
                    touchThreshold={10}
                    responsive={[
                      {
                        breakpoint: 1024,
                        settings: {
                          slidesToShow: Math.min(1, certificates.length),
                          centerMode: certificates.length > 1,
                          centerPadding: "20px",
                        },
                      },
                      {
                        breakpoint: 600,
                        settings: {
                          slidesToShow: 1,
                          centerMode: false,
                          centerPadding: "0px",
                        },
                      },
                    ]}
                  >
                    {certificates.map((cert, index) => (
                      <Box
                        key={cert._id}
                        sx={{
                          px: 1,
                          textAlign: "center",
                          minWidth: "400px", // Increased certificate width
                        }}
                      >
                        <Paper
                          elevation={3}
                          sx={{
                            p: 2,
                            height: "350px", // Increased height to accommodate larger size
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            maxWidth: "380px", // Set max width for each certificate
                            margin: "0 auto",
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Chứng chỉ #{index + 1}
                          </Typography>
                          <Box
                            component="iframe"
                            src={cert.fileUrl}
                            sx={{
                              width: "100%",
                              height: "250px", // Increased iframe height
                              border: "none",
                              borderRadius: "4px",
                            }}
                            title={`Certificate ${cert.verifyCode}`}
                          />
                          <Typography variant="caption" sx={{ mt: 1 }}>
                            Mã xác thực: {cert.verifyCode}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </Slider>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Không chứng chỉ nào được tạo
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: "space-between",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 1,
            px: 3,
            fontWeight: 500,
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
          }}
        >
          Đóng
        </Button>
        <Box>{renderActionButtons()}</Box>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to calculate date difference
function calculateDateDifference(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "in-progress":
      return "info";
    case "completed":
      return "primary";
    default:
      return "default";
  }
};

export default CampaignModal;
