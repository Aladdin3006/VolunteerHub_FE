import React, { useState, useEffect, ChangeEvent } from "react";
import { usersService, User, CreateManagerData } from "../../apis/users";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Input,
  Chip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ManagerUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [managerForm, setManagerForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    date_of_birth: "",
    communeId: "",
  } as { fullName: string; email: string; password: string; confirmPassword: string; phone: string; date_of_birth: string; communeId: string });
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    date_of_birth: "",
  } as { fullName: string; email: string; password: string; confirmPassword: string; phone: string; date_of_birth: string });
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [showManagerConfirmPassword, setShowManagerConfirmPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showStaffConfirmPassword, setShowStaffConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await usersService.getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err: any) {
      setError("Failed to load users");
      console.error("Fetch users error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManagerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setManagerForm({ ...managerForm, [e.target.name]: e.target.value });
  };

  const handleStaffInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (managerForm.password !== managerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const managerData: CreateManagerData = {
        fullName: managerForm.fullName,
        email: managerForm.email,
        password: managerForm.password,
        phone: managerForm.phone,
        date_of_birth: managerForm.date_of_birth,
        communeId: managerForm.communeId || "",
      };
      const newManager = await usersService.createManager(managerData);
      setUsers([...users, newManager]);
      setShowManagerModal(false);
      setManagerForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        date_of_birth: "",
        communeId: "",
      });
      setError(null);
    } catch (err: any) {
      setError("Failed to create manager");
      console.error("Create manager error:", err.message);
    }
  };

  const handleImportStaff = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("Please select a file to import");
      console.error("Import staff error: No file selected");
      return;
    }
    try {
      const result = await usersService.importStaff({ file, role: "staff" });
      alert(`Imported ${result.successCount} users successfully. Failed: ${result.failed.length}`);
      fetchUsers();
      setError(null);
    } catch (err: any) {
      setError("Failed to import staff");
      console.error("Import staff error:", err.message);
    }
  };

  const handleEnable = async (id: string) => {
    try {
      await usersService.enableUser(id);
      setUsers(users.map((user) => (user.id === id ? { ...user, status: "active" } : user)));
      setError(null);
    } catch (err: any) {
      setError("Failed to enable user");
      console.error("Enable user error:", err.message);
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await usersService.disableUser(id);
      setUsers(users.map((user) => (user.id === id ? { ...user, status: "inactive" } : user)));
      setError(null);
    } catch (err: any) {
      setError("Failed to disable user");
      console.error("Disable user error:", err.message);
    }
  };

  return (
    <Box sx={{ ml: "310px", p: 3, mt: "80px" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h4">Users</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={() => setShowManagerModal(true)}
          >
            Create Manager
          </Button>
          <Button
            variant="contained"
            component="label"
          >
            Import Staff
            <Input
              type="file"
              inputProps={{ accept: ".xlsx,.xls" }}
              onChange={handleImportStaff}
              sx={{ display: "none" }}
            />
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box mb={2}>
        <TextField
          fullWidth
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "grey.500" }} />,
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sr. No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>E-Mail</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Birth Date</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.date_of_birth}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === "active" ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {user.status === "active" ? (
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          onClick={() => handleDisable(user.id)}
                        >
                          Disable
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleEnable(user.id)}
                        >
                          Enable
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Manager Modal */}
      <Dialog open={showManagerModal} onClose={() => setShowManagerModal(false)}>
        <DialogTitle>Create Manager</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateManager} display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={managerForm.fullName}
              onChange={handleManagerInputChange}
              required
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={managerForm.email}
              onChange={handleManagerInputChange}
              required
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type={showManagerPassword ? "text" : "password"}
              value={managerForm.password}
              onChange={handleManagerInputChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowManagerPassword(!showManagerPassword)}
                      edge="end"
                    >
                      {showManagerPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={showManagerConfirmPassword ? "text" : "password"}
              value={managerForm.confirmPassword}
              onChange={handleManagerInputChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowManagerConfirmPassword(!showManagerConfirmPassword)}
                      edge="end"
                    >
                      {showManagerConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Phone"
              name="phone"
              value={managerForm.phone}
              onChange={handleManagerInputChange}
              required
              fullWidth
            />
            <TextField
              label="Birth Date"
              name="date_of_birth"
              type="date"
              value={managerForm.date_of_birth}
              onChange={handleManagerInputChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {/* <TextField
              label="Commune ID"
              name="communeId"
              value={managerForm.communeId}
              onChange={handleManagerInputChange}
              fullWidth
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManagerModal(false)}>Cancel</Button>
          <Button type="submit" onClick={handleCreateManager}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerUser;