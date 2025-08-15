import React, { useState, useEffect, ChangeEvent } from "react";
import { usersService, User, CreateManagerData } from "../../apis/admin";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ManagerUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerForm, setManagerForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    date_of_birth: "",
    communeId: "",
  } as { fullName: string; email: string; password: string; confirmPassword: string; phone: string; date_of_birth: string; communeId: string });
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [showManagerConfirmPassword, setShowManagerConfirmPassword] =
    useState(false);
  const [communes, setCommunes] = useState<
    { id: string; name: string; district: string; province: string }[]
  >([]);

  useEffect(() => {
    fetchUsers();
    fetchCommunes();
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

  const fetchCommunes = async () => {
    try {
      const fetchedCommunes = await usersService.getAllCommunes();
      setCommunes(fetchedCommunes);
      setError(null);
    } catch (err: any) {
      setError("Failed to load communes");
      console.error("Fetch communes error:", err.message);
    }
  };

  // Filter users by search term and role, mapping "organization" to "staff" for display
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      selectedRole === "all" ||
      (selectedRole === "staff" && user.role === "organization") ||
      user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleManagerInputChange = (
    e: ChangeEvent<HTMLInputElement | { name?: string; value: string }>
  ) => {
    const { name, value } = e.target as any;
    setManagerForm((prev) => ({ ...prev, [name || ""]: value }));
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
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
        communeId: managerForm.communeId,
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
      alert(
        `Imported ${result.successCount} staff successfully. Failed: ${result.failed.length}`
      );
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
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: "active" } : user
        )
      );
      setError(null);
    } catch (err: any) {
      setError("Failed to enable user");
      console.error("Enable user error:", err.message);
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await usersService.disableUser(id);
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: "inactive" } : user
        )
      );
      setError(null);
    } catch (err: any) {
      setError("Failed to disable user");
      console.error("Disable user error:", err.message);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCommuneChange = (event: SelectChangeEvent) => {
    setManagerForm((prev) => ({ ...prev, communeId: event.target.value }));
  };

  // Display "staff" instead of "organization" in the table
  const getDisplayRole = (role: string) => {
    return role === "organization" ? "staff" : role;
  };

  return (
    <Box sx={{ ml: "310px", p: 3, mt: "80px" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h4">Users</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={() => setShowManagerModal(true)}
            sx={{ height: "40px" }} // Match height with TextField
          >
            Create Manager
          </Button>
          <Button
            variant="contained"
            component="label"
            sx={{ height: "40px" }} // Match height with TextField
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

      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "grey.500" }} />,
          }}
          sx={{ height: "40px" }} // Consistent height
        />
        <FormControl sx={{ minWidth: 240, height: "60px" }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            label="Role"
            sx={{ height: "55px" }} // Match height with TextField
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
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
                  <TableCell>{formatDate(user.date_of_birth)}</TableCell>
                  <TableCell>{getDisplayRole(user.role)}</TableCell>
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
      <Dialog
        open={showManagerModal}
        onClose={() => setShowManagerModal(false)}
      >
        <DialogTitle>Create Manager</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleCreateManager}
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{ mt: 1 }}
          >
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
                      onClick={() =>
                        setShowManagerPassword(!showManagerPassword)
                      }
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
                      onClick={() =>
                        setShowManagerConfirmPassword(
                          !showManagerConfirmPassword
                        )
                      }
                      edge="end"
                    >
                      {showManagerConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
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
            <FormControl fullWidth required>
              <InputLabel>Commune</InputLabel>
              <Select
                name="communeId"
                value={managerForm.communeId}
                onChange={handleCommuneChange}
                label="Commune"
              >
                {communes.map((commune) => (
                  <MenuItem key={commune.id} value={commune.id}>
                    {`${commune.name}, ${commune.district}, ${commune.province}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManagerModal(false)}>Cancel</Button>
          <Button type="submit" onClick={handleCreateManager}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerUser;
