import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Campaign } from "../../apis/staff";
import { getPhasesByCampaignId } from "../../apis/staff";
import ImageGallery from "@/components/image/ImageGallery";
import CheckInDialog from "@/components/staff/CheckInDialog";
import "./OverViewCampaign.css";

interface Phase {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  phaseDays: PhaseDay[];
}

interface PhaseDay {
  _id: string;
  date: Date;
  checkinLocation: {
    coordinates: [number, number];
    address: string;
  };
}

interface OverViewCampaignProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
  onOpenManagement: (tabIndex?: number) => void;
  onOpenUpdateCampaign: (campaignId: string) => void;
}

const OverViewCampaign: React.FC<OverViewCampaignProps> = ({
  campaign,
  open,
  onClose,
  onOpenManagement,
  onOpenUpdateCampaign,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<PhaseDay | null>(null);

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (!text) return "No description available";
    if (text.length <= maxLength) return text;
    return showFullDescription ? text : text.substring(0, maxLength) + "...";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  useEffect(() => {
    if (open && campaign?._id) {
      fetchPhases();
    }
  }, [open, campaign?._id]);

  const fetchPhases = async () => {
    try {
      setLoadingPhases(true);
      const data = await getPhasesByCampaignId(campaign._id);
      const formattedPhases = data.map((phase) => ({
        ...phase,
        startDate: new Date(phase.startDate),
        endDate: new Date(phase.endDate),
        phaseDays: phase.phaseDays.map((day) => ({
          ...day,
          date: new Date(day.date),
        })),
      }));
      setPhases(formattedPhases);
    } catch (error) {
      console.error("Error fetching phases:", error);
    } finally {
      setLoadingPhases(false);
    }
  };

  const handleOpenCheckInDialog = (phase: Phase, phaseDay: PhaseDay) => {
    setSelectedPhase(phase);
    setSelectedPhaseDay(phaseDay);
    setCheckInDialogOpen(true);
  };

  const handleCloseCheckInDialog = () => {
    setCheckInDialogOpen(false);
    setSelectedPhase(null);
    setSelectedPhaseDay(null);
  };

  // Map configuration
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "8px",
  };

  const center = campaign.location?.coordinates
    ? {
        lat: campaign.location.coordinates[0],
        lng: campaign.location.coordinates[1],
      }
    : { lat: 10.7769, lng: 106.7009 }; // Default to Ho Chi Minh City if no coordinates

  const mapEmbedUrl = campaign.location?.coordinates
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${center.lng}!3d${center.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(
        `${center.lat},${center.lng}`
      )}!5e0!3m2!1sen!2sus!4v1634567890123`
    : "";

  // Check if campaign is in-progress or completed
  const isInProgress = campaign.status === "in-progress";
  const isCompleted = campaign.status === "completed";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: "95vh",
          background: "linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          px: 3,
          py: 1.5,
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          className="campaign-title"
          sx={{
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pr: 2,
            mt: 3,
          }}
        >
          {campaign.name || "No campaign name"}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            p: 0.5,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#f8f9fa", p: 4, mt: 4, height: "100%" }}>
        <div className="campaign-grid">
          {/* Column 1: Description and Details */}
          <div className="campaign-column left-column">
            {/* Description */}
            <Box className="campaign-card">
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <InfoIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Mô tả
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.7, color: "#555", mb: 2 }}
              >
                {truncateDescription(campaign.description)}
              </Typography>
              {campaign.description && campaign.description.length > 100 && (
                <Button
                  size="small"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: 3,
                    px: 2,
                    py: 1,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {showFullDescription ? "Thu gọn" : "Xem thêm"}
                </Button>
              )}
            </Box>

            {/* Details */}
            <Box className="campaign-card">
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Chi tiết
              </Typography>
              <List dense sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <CalendarTodayIcon
                    sx={{ mr: 2, color: "primary.main", fontSize: 24 }}
                  />
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        Thời gian
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {campaign.startDate && campaign.endDate
                          ? `${formatDate(
                              new Date(campaign.startDate)
                            )} - ${formatDate(new Date(campaign.endDate))}`
                          : "No date information"}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem sx={{ px: 0, py: 2 }}>
                  <LocationOnIcon
                    sx={{ mr: 2, color: "primary.main", fontSize: 24 }}
                  />
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        Địa điểm
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {campaign.location?.address ||
                          "No location information"}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem sx={{ px: 0, py: 2 }}>
                  <InfoIcon
                    sx={{ mr: 2, color: "primary.main", fontSize: 24 }}
                  />
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        Trạng thái
                      </Typography>
                    }
                    secondary={
                      <Chip
                        label={campaign.status || "No status"}
                        size="medium"
                        color={
                          campaign.status === "in-progress"
                            ? "success"
                            : campaign.status === "completed"
                            ? "error"
                            : "default"
                        }
                        sx={{
                          mt: 0.5,
                          fontWeight: "bold",
                          borderRadius: 3,
                        }}
                      />
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem sx={{ px: 0, py: 2 }}>
                  <CategoryIcon
                    sx={{ mr: 2, color: "primary.main", fontSize: 24 }}
                  />
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        Danh mục
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {campaign.categories &&
                        campaign.categories.length > 0 ? (
                          campaign.categories.map((cat) => (
                            <Chip
                              key={cat._id}
                              label={cat.name}
                              size="small"
                              sx={{
                                mr: 1,
                                mb: 1,
                                bgcolor: cat.color || "primary.main",
                                color: "white",
                                fontWeight: "bold",
                                borderRadius: 3,
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                                transition: "all 0.3s ease",
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No categories available
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </div>

          {/* Column 2: Images */}
          <div className="campaign-column middle-column">
            {/* Main Image - Hidden when campaign is in-progress */}
            {!isInProgress && (
              <Box className="campaign-card" sx={{ height: "400px" }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Ảnh chính
                </Typography>
                <Box
                  component="img"
                  src={
                    campaign.image ||
                    "https://via.placeholder.com/600x400?text=No+Image"
                  }
                  alt={campaign.name || "Campaign image"}
                  className="main-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/600x400?text=No+Image";
                  }}
                  sx={{ mb: 10 }}
                />
              </Box>
            )}

            {/* Phases */}
            <Box className="campaign-card">
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Các Phase
              </Typography>
              {loadingPhases ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : phases.length > 0 ? (
                <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                  {phases.map((phase) => (
                    <Accordion key={phase._id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="bold">{phase.name}</Typography>
                        <Typography sx={{ color: "text.secondary", ml: 2 }}>
                          {formatDate(phase.startDate)} -{" "}
                          {formatDate(phase.endDate)}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" paragraph>
                          {phase.description || "No description"}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          Phase Days:
                        </Typography>
                        {phase.phaseDays.length > 0 ? (
                          <List dense>
                            {phase.phaseDays.map((day) => (
                              <ListItem
                                key={day._id}
                                sx={{ px: 0 }}
                                secondaryAction={
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleOpenCheckInDialog(phase, day)}
                                    disabled={isCompleted}
                                    sx={{
                                      textTransform: "none",
                                      fontWeight: "bold",
                                      borderRadius: 3,
                                      opacity: isCompleted ? 0.7 : 1,
                                    }}
                                  >
                                    View CheckIn
                                  </Button>
                                }
                              >
                                <ListItemText
                                  primary={formatDate(day.date)}
                                  secondary={
                                    <>
                                      <Typography
                                        component="span"
                                        variant="body2"
                                      >
                                        {day.checkinLocation?.address ||
                                          "No address"}
                                      </Typography>
                                      <br />
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {day.checkinLocation?.coordinates
                                          ? `(${day.checkinLocation.coordinates[0].toFixed(
                                              4
                                            )}, ${day.checkinLocation.coordinates[1].toFixed(
                                              4
                                            )})`
                                          : "No coordinates"}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No phase days
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Box className="no-data-container">
                  <Typography variant="body1" color="text.secondary">
                    No phases available
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Gallery Images - Hidden when campaign is in-progress */}
            {!isInProgress && (
              <Box className="campaign-card" sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Thư viện ảnh
                </Typography>
                {campaign.gallery && campaign.gallery.length > 0 ? (
                  <Box className="gallery-container">
                    <ImageGallery images={campaign.gallery} maxWidth="100%" />
                  </Box>
                ) : (
                  <Box className="no-data-container">
                    <Typography variant="body1" color="text.secondary">
                      No gallery images available
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </div>

          {/* Column 3: Actions and Location */}
          <div className="campaign-column right-column">
            <Box className="campaign-card">
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Hành động
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onOpenManagement(0)}
                  className="action-button"
                  disabled={isCompleted}
                  sx={{
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                >
                  Quản lý Phase
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onOpenManagement(1)}
                  className="action-button"
                  disabled={isCompleted}
                  sx={{
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                >
                  Quản lý Tasks
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onOpenManagement(2)}
                  className="action-button"
                  disabled={isCompleted}
                  sx={{
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                >
                  Quản lý điểm danh
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onOpenManagement(3)}
                  className="action-button"
                  disabled={isCompleted}
                  sx={{
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                >
                  Quản lý Departments
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onOpenManagement(4)}
                  className="action-button"
                  disabled={isCompleted}
                  sx={{
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                >
                  Quản lý Volunteers
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onOpenUpdateCampaign(campaign._id)}
                  className="action-button"
                  disabled={isCompleted}
                  sx={{
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                >
                  Cập nhật chiến dịch
                </Button>
              </Box>
            </Box>

            {/* Location Map */}
            <Box className="campaign-card">
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Vị trí
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
                <Box className="no-data-container">
                  <Typography variant="body1" color="text.secondary">
                    No location coordinates available
                  </Typography>
                </Box>
              )}
            </Box>
          </div>
        </div>
      </DialogContent>
      {selectedPhase && selectedPhaseDay && (
        <CheckInDialog
          open={checkInDialogOpen}
          onClose={handleCloseCheckInDialog}
          campaignId={campaign._id}
          phase={selectedPhase}
          phaseDay={selectedPhaseDay}
          onPhaseSelect={setSelectedPhase}
          onPhaseDaySelect={setSelectedPhaseDay}
          selectedCampaign={{ name: campaign.name || "Campaign" }}
        />
      )}
    </Dialog>
  );
};

export default OverViewCampaign;