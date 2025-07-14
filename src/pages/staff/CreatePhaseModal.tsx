import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  LocationOn,
  CalendarToday,
} from "@mui/icons-material";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  createPhase,
  createPhaseDay,
  getPhasesByCampaignId,
  deletePhaseDay as deletePhaseDayApi, // Import the API function
} from "../../apis/staff";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface PhaseDayData {
  id: string;
  date: Date;
  location: {
    coordinates: [number, number] | null;
    address: string;
  };
}

interface PhaseData {
  _id: string;
  campaignId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  phaseDays: PhaseDayData[];
}

const MapClickHandler: React.FC<{
  phaseId: string;
  dayId: string;
  updateDayLocation: (
    phaseId: string,
    dayId: string,
    coordinates: [number, number],
    address: string
  ) => void;
}> = ({ phaseId, dayId, updateDayLocation }) => {
  useMapEvent("click", (e) => {
    updateDayLocation(
      phaseId,
      dayId,
      [e.latlng.lat, e.latlng.lng],
      `Location selected at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`
    );
  });

  return null;
};

interface CreatePhaseModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
}

const CreatePhaseModal: React.FC<CreatePhaseModalProps> = ({
  open,
  onClose,
  campaignId,
}) => {
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletedPhaseDays, setDeletedPhaseDays] = useState<string[]>([]);

  useEffect(() => {
    if (!/^[0-9a-fA-F]{24}$/.test(campaignId)) {
      setError("Invalid campaign ID");
      setLoading(false);
      return;
    }

    const fetchPhases = async () => {
      try {
        setLoading(true);
        const data = await getPhasesByCampaignId(campaignId);
        console.log("Fetched phases:", data);
        setPhases(
          data.map((phase) => ({
            _id: phase._id,
            campaignId: phase.campaignId,
            name: phase.name,
            description: phase.description || "",
            startDate: phase.startDate ? new Date(phase.startDate) : new Date(),
            endDate: phase.endDate ? new Date(phase.endDate) : new Date(),
            phaseDays: phase.phaseDays.map((day) => ({
              id: day._id,
              date: day.date ? new Date(day.date) : new Date(),
              location: {
                coordinates: day.checkinLocation?.coordinates || null,
                address: day.checkinLocation?.address || "",
              },
            })),
          }))
        );
      } catch (error) {
        console.error("Error fetching phases:", error);
        setError("Failed to load phases. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) fetchPhases();
  }, [campaignId]);

  const addPhase = () => {
    setPhases([
      ...phases,
      {
        _id: `new-phase-${Date.now()}`,
        campaignId,
        name: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        phaseDays: [],
      },
    ]);
  };

  const addPhaseDay = (phaseId: string) => {
    setPhases(
      phases.map((phase) =>
        phase._id === phaseId
          ? {
              ...phase,
              phaseDays: [
                ...phase.phaseDays,
                {
                  id: `new-day-${Date.now()}`,
                  date: new Date(),
                  location: { coordinates: null, address: "" },
                } as PhaseDayData,
              ],
            }
          : phase
      )
    );
  };

  // Updated deletePhaseDay function to include API call
  const deletePhaseDay = async (phaseId: string, dayId: string) => {
    // Delete locally first
    setPhases(
      phases.map((phase) =>
        phase._id === phaseId
          ? {
              ...phase,
              phaseDays: phase.phaseDays.filter((day) => day.id !== dayId),
            }
          : phase
      )
    );

    // Track deleted days that exist on server and call API
    if (!dayId.startsWith("new-day-")) {
      try {
        await deletePhaseDayApi(dayId); // Call the API with the dayId
        setDeletedPhaseDays([...deletedPhaseDays, dayId]);
      } catch (error) {
        console.error("Error deleting phase day:", error);
        setError("Failed to delete phase day. Please try again.");
        // Optionally revert the local state change on error
        setPhases(
          phases.map((phase) =>
            phase._id === phaseId
              ? {
                  ...phase,
                  phaseDays: [...phase.phaseDays, { id: dayId, date: new Date(), location: { coordinates: null, address: "" } }],
                }
              : phase
          )
        );
      }
    }
  };

  const updatePhase = (
    phaseId: string,
    field: string,
    value: string | Date
  ) => {
    setPhases(
      phases.map((phase) =>
        phase._id === phaseId
          ? {
              ...phase,
              [field]:
                field === "startDate" || field === "endDate"
                  ? new Date(value)
                  : value,
            }
          : phase
      )
    );
  };

  const updatePhaseDay = (
    phaseId: string,
    dayId: string,
    field: string,
    value: any
  ) => {
    setPhases(
      phases.map((phase) =>
        phase._id === phaseId
          ? {
              ...phase,
              phaseDays: phase.phaseDays.map((day) =>
                day.id === dayId
                  ? {
                      ...day,
                      [field]: field === "date" ? new Date(value) : value,
                    }
                  : day
              ),
            }
          : phase
      )
    );
  };

  const updateDayLocation = (
    phaseId: string,
    dayId: string,
    coordinates: [number, number],
    address: string
  ) => {
    updatePhaseDay(phaseId, dayId, "location", { coordinates, address });
  };

  const validatePhase = (phase: PhaseData) => {
    if (!phase.name || phase.name.trim() === "")
      return "Phase name is required";
    if (!phase.startDate || isNaN(phase.startDate.getTime()))
      return "Valid start date is required";
    if (!phase.endDate || isNaN(phase.endDate.getTime()))
      return "Valid end date is required";
    if (phase.startDate >= phase.endDate)
      return "End date must be after start date";
    return null;
  };

  const validatePhaseDay = (day: PhaseDayData) => {
    if (!day.date || isNaN(day.date.getTime()))
      return "Valid phase day date is required";
    if (!day.location.coordinates || day.location.coordinates.length !== 2)
      return "Check-in location is required";
    if (!day.location.address || day.location.address.trim() === "")
      return "Location address is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const createUTCDate = (date: Date) => {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid date: ${date}`);
      }
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    };

    try {
      for (const phase of phases) {
        const validationError = validatePhase(phase);
        if (validationError) {
          throw new Error(validationError);
        }

        for (const day of phase.phaseDays) {
          const dayValidationError = validatePhaseDay(day);
          if (dayValidationError) {
            throw new Error(dayValidationError);
          }
        }
      }

      for (const phase of phases) {
        let phaseId = phase._id;

        if (phase._id.startsWith("new-phase-")) {
          const phasePayload = {
            campaignId,
            name: phase.name.trim(),
            description: phase.description?.trim() || "",
            startDate: createUTCDate(phase.startDate),
            endDate: createUTCDate(phase.endDate),
          };

          console.log("Creating phase with payload:", phasePayload);
          const createdPhase = await createPhase(phasePayload);
          console.log("Created phase:", createdPhase);
          phaseId = createdPhase._id;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        for (const day of phase.phaseDays) {
          if (day.id.startsWith("new-day-")) {
            const dayPayload = {
              date: createUTCDate(day.date),
              checkinLocation: {
                coordinates: day.location.coordinates as [number, number],
                address: day.location.address || "No address provided",
              },
            };

            console.log(
              `Creating phase day for phase ${phaseId} with payload:`,
              dayPayload
            );

            try {
              const createdDay = await createPhaseDay(phaseId, dayPayload);
              console.log("Created phase day:", createdDay);
            } catch (dayError: any) {
              console.error(
                `Failed to create phase day for phase ${phaseId}:`,
                dayError
              );
              throw new Error(
                `Failed to create phase day: ${dayError.message}`
              );
            }
          }
        }
      }

      setDeletedPhaseDays([]);

      const refreshedPhases = await getPhasesByCampaignId(campaignId);
      console.log("Refreshed phases:", refreshedPhases);

      setPhases(
        refreshedPhases.map((phase) => ({
          _id: phase._id,
          campaignId: phase.campaignId,
          name: phase.name,
          description: phase.description || "",
          startDate: phase.startDate ? new Date(phase.startDate) : new Date(),
          endDate: phase.endDate ? new Date(phase.endDate) : new Date(),
          phaseDays: phase.phaseDays.map((day) => ({
            id: day._id,
            date: day.date ? new Date(day.date) : new Date(),
            location: {
              coordinates: day.checkinLocation?.coordinates || null,
              address: day.checkinLocation?.address || "",
            },
          })),
        }))
      );

      onClose();
      alert("Phases and phase days updated successfully!");
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      let errorMessage = "Unknown error occurred";
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setError(`Failed to update phases: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return "";
    }
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Create Campaign Phases</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Phases
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {phases.map((phase) => (
                  <Accordion
                    key={phase._id}
                    defaultExpanded={phase._id.startsWith("new-phase-")}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">
                        {phase.name || `New Phase`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid>
                          <TextField
                            fullWidth
                            label="Name"
                            value={phase.name}
                            onChange={(e) =>
                              updatePhase(phase._id, "name", e.target.value)
                            }
                            required
                            error={!phase.name}
                            helperText={!phase.name ? "Name is required" : ""}
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            fullWidth
                            label="Description"
                            value={phase.description}
                            onChange={(e) =>
                              updatePhase(
                                phase._id,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={formatDateForInput(phase.startDate)}
                            onChange={(e) =>
                              updatePhase(
                                phase._id,
                                "startDate",
                                e.target.value
                              )
                            }
                            required
                            InputLabelProps={{ shrink: true }}
                            error={
                              !phase.startDate ||
                              isNaN(phase.startDate.getTime())
                            }
                            helperText={
                              !phase.startDate ||
                              isNaN(phase.startDate.getTime())
                                ? "Start date is required"
                                : ""
                            }
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={formatDateForInput(phase.endDate)}
                            onChange={(e) =>
                              updatePhase(phase._id, "endDate", e.target.value)
                            }
                            required
                            InputLabelProps={{ shrink: true }}
                            error={
                              !phase.endDate ||
                              isNaN(phase.endDate.getTime()) ||
                              (phase.startDate &&
                                phase.endDate &&
                                phase.startDate >= phase.endDate)
                            }
                            helperText={
                              !phase.endDate || isNaN(phase.endDate.getTime())
                                ? "End date is required"
                                : phase.startDate &&
                                  phase.endDate &&
                                  phase.startDate >= phase.endDate
                                ? "End date must be after start date"
                                : ""
                            }
                          />
                        </Grid>
                        <Grid>
                          <Typography variant="h6" gutterBottom>
                            Phase Days
                          </Typography>
                          {phase.phaseDays.map((day) => (
                            <Paper key={day.id} sx={{ p: 2, mb: 2 }}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="subtitle2" gutterBottom>
                                  Phase Day
                                </Typography>
                                <IconButton
                                  onClick={() =>
                                    deletePhaseDay(phase._id, day.id)
                                  }
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Grid container spacing={2}>
                                <Grid>
                                  <TextField
                                    fullWidth
                                    label="Date"
                                    type="date"
                                    value={formatDateForInput(day.date)}
                                    onChange={(e) =>
                                      updatePhaseDay(
                                        phase._id,
                                        day.id,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    error={
                                      !day.date || isNaN(day.date.getTime())
                                    }
                                    helperText={
                                      !day.date || isNaN(day.date.getTime())
                                        ? "Date is required"
                                        : ""
                                    }
                                  />
                                </Grid>
                                <Grid>
                                  <Typography variant="body2" gutterBottom>
                                    Check-in Location
                                  </Typography>
                                  <Box
                                    sx={{
                                      height: "200px",
                                      width: "100%",
                                      mb: 1,
                                    }}
                                  >
                                    <MapContainer
                                      center={[21.0278, 105.8342]}
                                      zoom={13}
                                      style={{ height: "100%", width: "100%" }}
                                    >
                                      <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                      />
                                      {day.location.coordinates && (
                                        <Marker
                                          position={day.location.coordinates}
                                        >
                                          <Popup>{day.location.address}</Popup>
                                        </Marker>
                                      )}
                                      <MapClickHandler
                                        phaseId={phase._id}
                                        dayId={day.id}
                                        updateDayLocation={updateDayLocation}
                                      />
                                    </MapContainer>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {day.location.address ||
                                      "Click map to select location"}
                                  </Typography>
                                  {!day.location.coordinates && (
                                    <Typography variant="body2" color="error">
                                      Location is required
                                    </Typography>
                                  )}
                                  {!day.location.address && (
                                    <Typography variant="body2" color="error">
                                      Location address is required
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => addPhaseDay(phase._id)}
                            sx={{ mt: 1 }}
                          >
                            Add Phase Day
                          </Button>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addPhase}
                  sx={{ mt: 2 }}
                >
                  Add Phase
                </Button>
              </>
            )}
          </Paper>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            phases.some((phase) => validatePhase(phase) !== null) ||
            phases.some((phase) =>
              phase.phaseDays.some((day) => validatePhaseDay(day) !== null)
            )
          }
        >
          {isSubmitting ? "Saving..." : "Save Phases"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePhaseModal;