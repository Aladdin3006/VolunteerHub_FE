// VolunteerRequestsModal.tsx
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
} from "@mui/material";
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
  const [acceptingVolunteers, setAcceptingVolunteers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleAcceptVolunteer = async (userId: string) => {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
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
      case "approved": return "success";
      case "pending": return "warning";
      case "rejected": return "error";
      default: return "default";
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Volunteer Requests</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ minHeight: 300 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <Chip
              label={`Pending: ${volunteers.filter((v) => v.status === "pending").length}`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`Approved: ${volunteers.filter((v) => v.status === "approved").length}`}
              color="success"
              variant="outlined"
            />
          </Box>
          {volunteers.length === 0 ? (
            <Alert severity="info">No volunteer requests found for this campaign.</Alert>
          ) : (
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
                      <TableCell>{formatDate(volunteer.registeredAt)}</TableCell>
                      <TableCell>
                        {volunteer.status === "pending" && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAcceptVolunteer(volunteer.user._id)}
                            disabled={acceptingVolunteers.has(volunteer.user._id)}
                          >
                            {acceptingVolunteers.has(volunteer.user._id) ? "Approving" : "Approve"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default VolunteerRequestsModal;