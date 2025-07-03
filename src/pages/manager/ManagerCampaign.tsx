// src/pages/manager/ManagerCampaign.tsx
/// <reference types="vite/client" />
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Tabs,
  Tab,
  Paper,
  Stack,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  LocationOn,
  DateRange,
  Category,
  CheckCircle,
  Cancel,
  PlayCircle,
  StopCircle,
  Image,
} from "@mui/icons-material";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { managerCampaignService } from "../../apis/manager"; // Adjust the import path as necessary

// Map settings
const mapContainerStyle = {
  width: "100%",
  height: "200px",
};

interface Campaign {
  _id: string;
  name: string;
  description: string;
  createBy: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  startDate: Date;
  endDate: Date;
  gallery: string[];
  categories: string[];
  status: "upcoming" | "in-progress" | "completed";
  acceptStatus: "pending" | "approved" | "rejected";
}

const ManagerCampaign: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected" | "upcoming" | "in-progress" | "completed"
  >("pending");
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      "",
  });

  // Fetch all campaigns on component mount
  useEffect(() => {
    const fetchAllCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all campaigns without any filters
        const data = await managerCampaignService.getListCampaigns({});
        setAllCampaigns(data);
      } catch (err) {
        setError("Failed to load campaigns. Please try again later.");
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCampaigns();
  }, []);

  // Filter campaigns based on active tab
  useEffect(() => {
    if (allCampaigns.length === 0) {
      setFilteredCampaigns([]);
      return;
    }

    let filtered: Campaign[] = [];

    switch (activeTab) {
      case "pending":
        filtered = allCampaigns.filter(
          (campaign) => campaign.acceptStatus === "pending"
        );
        break;
      case "approved":
        filtered = allCampaigns.filter(
          (campaign) => campaign.acceptStatus === "approved"
        );
        break;
      case "rejected":
        filtered = allCampaigns.filter(
          (campaign) => campaign.acceptStatus === "rejected"
        );
        break;
      case "upcoming":
        filtered = allCampaigns.filter(
          (campaign) => campaign.status === "upcoming"
        );
        break;
      case "in-progress":
        filtered = allCampaigns.filter(
          (campaign) => campaign.status === "in-progress"
        );
        break;
      case "completed":
        filtered = allCampaigns.filter(
          (campaign) => campaign.status === "completed"
        );
        break;
      default:
        filtered = allCampaigns;
    }
    setFilteredCampaigns(filtered);
  }, [allCampaigns, activeTab]);

  const fetchCampaigns = async () => {
    try {
      const data = await managerCampaignService.getListCampaigns({});
      setAllCampaigns(data);
    } catch (error) {
      console.error("Error refreshing campaigns:", error);
    }
  };

  const handleAction = async (action: Function, id: string) => {
    try {
      await action(id);
      // Refresh campaigns after action
      await fetchCampaigns();
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue as any);
  };

  const openCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDialogOpen(true);
  };

  const renderActionButtons = (campaign: Campaign) => {
    // For pending campaigns - show approve/reject buttons
    if (campaign.acceptStatus === "pending") {
      return (
        <>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(
                managerCampaignService.approveCampaign,
                campaign._id
              );
            }}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(
                managerCampaignService.rejectCampaign,
                campaign._id
              );
            }}
          >
            Reject
          </Button>
        </>
      );
    }
    
    // For approved campaigns - show start/end buttons based on status
    if (campaign.acceptStatus === "approved") {
      if (campaign.status === "upcoming") {
        return (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<PlayCircle />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(managerCampaignService.startCampaign, campaign._id);
            }}
          >
            Start Campaign
          </Button>
        );
      }
      
      if (campaign.status === "in-progress") {
        return (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<StopCircle />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(managerCampaignService.endCampaign, campaign._id);
            }}
          >
            End Campaign
          </Button>
        );
      }
    }
    
    // For rejected campaigns or completed campaigns - no actions
    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          marginLeft: "280px",
          padding: "30px",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>Loading campaigns...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          marginLeft: "280px",
          padding: "30px",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        marginLeft: "280px",
        padding: "30px",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          marginTop: "40px",
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Campaign Management
        </Typography>
      </Box>

      {/* Debug Info */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Debug: Total campaigns: {allCampaigns.length}, Filtered: {filteredCampaigns.length}, Active tab: {activeTab}
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ px: 2 }}
          variant="scrollable"
        >
          <Tab
            label={`Pending (${
              allCampaigns.filter((c) => c.acceptStatus === "pending").length
            })`}
            value="pending"
          />
          <Tab
            label={`Approved (${
              allCampaigns.filter((c) => c.acceptStatus === "approved").length
            })`}
            value="approved"
          />
          <Tab
            label={`Rejected (${
              allCampaigns.filter((c) => c.acceptStatus === "rejected").length
            })`}
            value="rejected"
          />
          <Tab
            label={`Upcoming (${
              allCampaigns.filter((c) => c.status === "upcoming").length
            })`}
            value="upcoming"
          />
          <Tab
            label={`In Progress (${
              allCampaigns.filter((c) => c.status === "in-progress").length
            })`}
            value="in-progress"
          />
          <Tab
            label={`Completed (${
              allCampaigns.filter((c) => c.status === "completed").length
            })`}
            value="completed"
          />
        </Tabs>
      </Paper>

      {/* Campaign Cards */}
      <Grid container spacing={3}>
        {filteredCampaigns.length === 0 ? (
          <Grid>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                No campaigns found for {activeTab} status
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Grid key={campaign._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  "&:hover": { boxShadow: 3 },
                }}
                onClick={() => openCampaignDetail(campaign)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Chip
                      label={campaign.acceptStatus.toUpperCase()}
                      color={getStatusColor(campaign.acceptStatus) as any}
                      size="small"
                    />
                    <Chip
                      label={campaign.status.toUpperCase()}
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {campaign.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {campaign.description.length > 100
                      ? `${campaign.description.substring(0, 100)}...`
                      : campaign.description}
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOn
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption">
                        {campaign.location.address}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <DateRange fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="caption">
                        {formatDate(campaign.startDate)} -{" "}
                        {formatDate(campaign.endDate)}
                      </Typography>
                    </Box>

                    {campaign.categories.length > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Category
                          fontSize="small"
                          color="action"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption">
                          {campaign.categories.join(", ")}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    {renderActionButtons(campaign)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Campaign Detail Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCampaign && (
          <>
            <DialogTitle>{selectedCampaign.name}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" gutterBottom>
                {selectedCampaign.description}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <LocationOn sx={{ mr: 1 }} /> Location
                  </Typography>
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{
                        lat: selectedCampaign.location.coordinates[1],
                        lng: selectedCampaign.location.coordinates[0],
                      }}
                      zoom={15}
                    >
                      <Marker
                        position={{
                          lat: selectedCampaign.location.coordinates[1],
                          lng: selectedCampaign.location.coordinates[0],
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: "grey.200",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography>Loading map...</Typography>
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedCampaign.location.address}
                  </Typography>
                </Grid>

                <Grid>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <DateRange sx={{ mr: 1 }} /> Dates
                  </Typography>
                  <Typography variant="body2">
                    <strong>Start:</strong>{" "}
                    {formatDate(selectedCampaign.startDate)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>End:</strong> {formatDate(selectedCampaign.endDate)}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Category sx={{ mr: 1 }} /> Categories
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedCampaign.categories.map((category, index) => (
                      <Chip key={index} label={category} size="small" />
                    ))}
                  </Box>

                  {selectedCampaign.gallery.length > 0 && (
                    <>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", mt: 2 }}
                      >
                        <Image sx={{ mr: 1 }} /> Gallery
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {selectedCampaign.gallery
                          .slice(0, 3)
                          .map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Gallery ${index + 1}`}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 4,
                              }}
                            />
                          ))}
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              {renderActionButtons(selectedCampaign)}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ManagerCampaign;