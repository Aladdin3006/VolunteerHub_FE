import React, { useState, useEffect, useCallback } from "react";
import { usersService, Certificate } from "../../apis/admin";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";

const ManageCertificate: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<
    string | null
  >(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersService.getAllCertificates({
        page: 1, // Fetch all data on initial load
        limit: 1000, // Set a high limit to get all certificates (adjust based on your needs)
      });
      setAllCertificates(response.data);
      setCertificates(response.data.slice(0, rowsPerPage)); // Initial display
      setTotal(response.pagination.total);
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Failed to load certificates: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleSearch = () => {
    const filtered = allCertificates.filter((cert) => {
      const volunteerName = cert.volunteerId?.fullName || "";
      const volunteerEmail = cert.volunteerId?.email || "";
      const campaignName = cert.campaignId?.name || "";
      const searchLower = searchTerm.toLowerCase();
      return (
        volunteerName.toLowerCase().includes(searchLower) ||
        volunteerEmail.toLowerCase().includes(searchLower) ||
        campaignName.toLowerCase().includes(searchLower)
      );
    });
    setCertificates(
      filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    );
    setTotal(filtered.length);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    const start = newPage * rowsPerPage;
    const end = start + rowsPerPage;
    setCertificates(
      allCertificates.slice(start, end).filter((cert) => {
        const volunteerName = cert.volunteerId?.fullName || "";
        const volunteerEmail = cert.volunteerId?.email || "";
        const campaignName = cert.campaignId?.name || "";
        const searchLower = searchTerm.toLowerCase();
        return (
          volunteerName.toLowerCase().includes(searchLower) ||
          volunteerEmail.toLowerCase().includes(searchLower) ||
          campaignName.toLowerCase().includes(searchLower)
        );
      })
    );
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    const start = 0;
    const end = parseInt(event.target.value, 10);
    setCertificates(
      allCertificates.slice(start, end).filter((cert) => {
        const volunteerName = cert.volunteerId?.fullName || "";
        const volunteerEmail = cert.volunteerId?.email || "";
        const campaignName = cert.campaignId?.name || "";
        const searchLower = searchTerm.toLowerCase();
        return (
          volunteerName.toLowerCase().includes(searchLower) ||
          volunteerEmail.toLowerCase().includes(searchLower) ||
          campaignName.toLowerCase().includes(searchLower)
        );
      })
    );
  };

  const handleDeleteClick = (certificateId: string) => {
    setSelectedCertificateId(certificateId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCertificateId) return;

    try {
      await usersService.deleteCertificate(selectedCertificateId);
      setError(null);
      fetchCertificates(); // Refresh the full list
    } catch (err: any) {
      setError("Failed to delete certificate: " + err.message);
    } finally {
      setOpenDeleteDialog(false);
      setSelectedCertificateId(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setSelectedCertificateId(null);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, allCertificates]);

  return (
    <Box sx={{ ml: "310px", p: 3, mt: "80px" }}>
      <Box display="flex" alignItems="center" mb={2}>
        <DescriptionIcon sx={{ mr: 1 }} />
        <Typography variant="h4">Certificates</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          placeholder="Search by user name, email, or campaign"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "grey.500" }} />,
          }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : certificates.length === 0 ? (
          <Box display="flex" justifyContent="center" p={2}>
            <Typography>No certificates found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sr. No.</TableCell>
                <TableCell>Campaign Name</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Verify Code</TableCell>
                <TableCell>Preview</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert, index) => (
                <TableRow key={cert.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{cert.campaignId?.name || "Chưa có"}</TableCell>
                  <TableCell>
                    {cert.volunteerId?.fullName || "Chưa có"}
                  </TableCell>
                  <TableCell>{cert.volunteerId?.email || "Chưa có"}</TableCell>
                  <TableCell>{cert.verifyCode || "Chưa có"}</TableCell>
                  <TableCell>
                    <IconButton
                      component="a"
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDeleteClick(cert.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mb: 8 }}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this certificate? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCertificate;
