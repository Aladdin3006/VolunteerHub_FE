import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { Volunteer } from "../../apis/staff";

interface VolunteerRequestsModalProps {
  open: boolean;
  onClose: () => void;
  volunteers: Volunteer[];
  onAcceptVolunteer: (userId: string) => Promise<void>;
  loading?: boolean;
}

const VolunteerRequestsModal: React.FC<VolunteerRequestsModalProps> = ({
  open,
  onClose,
  volunteers,
  onAcceptVolunteer,
  loading = false,
}) => {
  const [acceptingVolunteers, setAcceptingVolunteers] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  console.log("Volunteer Requests Modal - Volunteers:", volunteers);
  

  const handleAcceptVolunteer = async (userId: string) => {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      console.error("Invalid user ID:", userId); // Log for debugging
      setError("Invalid user ID. Please try again or contact support.");
      return;
    }

    try {
      setAcceptingVolunteers((prev) => new Set(prev).add(userId));
      await onAcceptVolunteer(userId);
      setError(null);
    } catch (error) {
      console.error("Error accepting volunteer:", error);
      setError("Failed to accept volunteer. Please try again.");
    } finally {
      setAcceptingVolunteers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography>Volunteer Requests</Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ minHeight: 400 }}>
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
              <Chip
                label={`Pending: ${
                  volunteers.filter((v) => v.status === "pending").length
                }`}
                color="warning"
                variant="outlined"
              />
              <Chip
                label={`Approved: ${
                  volunteers.filter((v) => v.status === "approved").length
                }`}
                color="success"
                variant="outlined"
              />
            </Box>

            {volunteers.length === 0 ? (
              <Alert severity="info">
                No volunteer requests found for this campaign.
              </Alert>
            ) : (
              <Box>
                {volunteers.some((v) => !v.user?._id) && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Some volunteer records are missing user IDs. Please check
                    the data source.
                  </Alert>
                )}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Registered At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {volunteers.map((volunteer) => (
                        <TableRow key={volunteer.id}>
                          <TableCell>{volunteer.user.fullName}</TableCell>
                          <TableCell>{volunteer.user.email}</TableCell>
                          <TableCell>{volunteer.user.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={volunteer.status.toUpperCase()}
                              color={getStatusColor(volunteer.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(volunteer.registeredAt)}
                          </TableCell>
                          <TableCell>
                            {volunteer.status === "pending" && (
                              <Tooltip title="Approve Volunteer Request">
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={
                                    acceptingVolunteers.has(
                                      volunteer.user._id
                                    ) ? (
                                      <CircularProgress
                                        size={20}
                                        color="inherit"
                                      />
                                    ) : (
                                      <CheckCircleIcon />
                                    )
                                  }
                                  onClick={() =>
                                    handleAcceptVolunteer(volunteer.user._id)
                                  }
                                  disabled={acceptingVolunteers.has(
                                    volunteer.user._id
                                  )}
                                  sx={{ minWidth: "100px" }}
                                >
                                  {acceptingVolunteers.has(volunteer.user._id)
                                    ? "Approving"
                                    : "Approve"}
                                </Button>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerRequestsModal;
