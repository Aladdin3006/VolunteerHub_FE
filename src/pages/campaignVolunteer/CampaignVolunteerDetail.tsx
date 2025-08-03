import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
  Avatar,
  Stack,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WarningIcon from "@mui/icons-material/Warning";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";

import {
  CampaignVolunteer,
  getCampaignVolunteerDetail,
  joinCampaign,
} from "../../apis/campaign";
import { CreateIssueData, ISSUE_API } from "../../apis/issue";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { SearchIcon } from "lucide-react";

const CampaignVolunteerDetail: React.FC = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  /* -------------------- state -------------------- */
  const [campaign, setCampaign] = useState<CampaignVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalTitle, setWithdrawalTitle] = useState("");
  const [withdrawalDescription, setWithdrawalDescription] = useState("");
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);

  const center = campaign?.location?.coordinates
    ? {
        lat: campaign.location.coordinates[0],
        lng: campaign.location.coordinates[1],
      }
    : { lat: 10.7769, lng: 106.7009 };

  const campaignIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    iconRetinaUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const userIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    iconRetinaUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "8px",
    zIndex: 0, // Ensure map stays below other elements
  };

  /* -------------------- user -------------------- */
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id || user.id;
  const isLoggedIn = !!currentUserId;

  /* -------------------- fetch campaign -------------------- */
  useEffect(() => {
    if (!campaignId) return;
    (async () => {
      try {
        const data = await getCampaignVolunteerDetail(campaignId);
        setCampaign(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId]);

  useEffect(() => {
    if (!isLoggedIn || !campaignId) return;

    const checkPendingWithdrawal = async () => {
      try {
        const response = await ISSUE_API.getIssues({
          type: "campaign_withdrawal",
          status: "open",
        });

        const hasPending = response.data.some(
          (issue) =>
            issue.type === "campaign_withdrawal" &&
            issue.relatedEntity.entityId === campaignId &&
            issue.reportedBy._id === currentUserId
        );

        setHasPendingWithdrawal(hasPending);
      } catch (error) {
        console.error("Error checking pending withdrawals:", error);
      }
    };

    checkPendingWithdrawal();
  }, [campaignId, currentUserId, isLoggedIn]);

  /* -------------------- map initialization -------------------- */
  useEffect(() => {
    if (!mapRef.current || !campaign?.location?.coordinates) return;

    // Add search control
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: "Tìm kiếm địa điểm",
    });

    mapRef.current.addControl(searchControl);

    return () => {
      if (mapRef.current) {
        mapRef.current.removeControl(searchControl);
      }
    };
  }, [campaign?.location?.coordinates]);

  /* -------------------- get user location -------------------- */
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setUserLocation(newLocation);

          // Fly to a point that shows both markers
          if (mapRef.current) {
            const bounds = L.latLngBounds(
              [center.lat, center.lng],
              [newLocation.lat, newLocation.lng]
            );
            mapRef.current.flyToBounds(bounds, { padding: [50, 50] });
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          setJoinMessage(
            "Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí."
          );
        }
      );
    } else {
      setJoinMessage("Trình duyệt không hỗ trợ định vị địa lý.");
    }
  };

  /* -------------------- create route -------------------- */
  const handleCreateRoute = () => {
    if (!userLocation || !campaign?.location?.coordinates) {
      setJoinMessage("Vui lòng lấy vị trí hiện tại trước khi tạo đường đi.");
      return;
    }

    const campaignLatLng = campaign.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${campaignLatLng[0]},${campaignLatLng[1]}&travelmode=driving`;
    window.open(url, "_blank");
  };

  /* -------------------- volunteer & status -------------------- */
  const myVolunteer = campaign?.volunteers?.find(
    (v) => v.user?._id === currentUserId
  );

  /* -------------------- join handler -------------------- */
  const handleJoin = async () => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
      return;
    }
    try {
      setJoinLoading(true);
      const msg = await joinCampaign(campaignId!);
      setJoinMessage(msg);
      setCampaign((prev) =>
        prev
          ? {
              ...prev,
              volunteers: [
                ...(prev.volunteers || []),
                { user: { _id: currentUserId }, status: "pending" } as any,
              ],
            }
          : prev
      );
    } catch (err) {
      setJoinMessage((err as Error).message);
    } finally {
      setJoinLoading(false);
    }
  };

  /* -------------------- withdrawal handler -------------------- */
  const handleOpenWithdrawalDialog = () => {
    setWithdrawalDialogOpen(true);
  };

  const handleCloseWithdrawalDialog = () => {
    setWithdrawalDialogOpen(false);
    setWithdrawalTitle("");
    setWithdrawalDescription("");
  };

  const handleOpenConfirmDialog = () => {
    if (!withdrawalTitle || !withdrawalDescription) return;
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleSubmitWithdrawal = async () => {
    if (!campaignId || !withdrawalTitle || !withdrawalDescription) return;
    try {
      setWithdrawalLoading(true);
      const issueData: CreateIssueData = {
        type: "campaign_withdrawal",
        title: withdrawalTitle,
        relatedEntity: {
          type: "Campaign",
          entityId: campaignId,
        },
        description: withdrawalDescription,
        status: "open",
      };
      await ISSUE_API.createIssue(issueData);
      setJoinMessage("Yêu cầu rút lui đã được gửi, chờ quản lý duyệt.");
      setHasPendingWithdrawal(true);
      handleCloseWithdrawalDialog();
    } catch (err) {
      setJoinMessage((err as Error).message);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  /* -------------------- loading & not-found -------------------- */
  if (loading)
    return (
      <Box sx={{ pt: 15, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (!campaign)
    return (
      <Box sx={{ pt: 15, textAlign: "center" }}>
        <Typography color="error">Không tìm thấy chiến dịch.</Typography>
      </Box>
    );

  /* -------------------- dialog handlers -------------------- */
  const handleCloseLoginDialog = () => {
    setLoginDialogOpen(false);
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
    setLoginDialogOpen(false);
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
    setLoginDialogOpen(false);
  };

  /* ============================================================
     =========== 2. MÀN HÌNH CHI TIẾT CHIẾN DỊCH GỐC ============
     ============================================================ */
  const { name, description, startDate, endDate, image, location } = campaign;

  /* ------------ nhãn & disable button tham gia ------------ */
  let joinLabel = "Gửi yêu cầu tham gia";
  let joinDisabled = joinLoading;
  let isWithdrawalButton = false;

  if (myVolunteer?.status === "pending") {
    joinLabel = "Đã gửi yêu cầu (chờ duyệt)";
    joinDisabled = true;
  } else if (myVolunteer?.status === "approved") {
    if (hasPendingWithdrawal) {
      joinLabel = "Đơn rút lui của bạn đang được duyệt";
      joinDisabled = true;
    } else {
      joinLabel = "Rút lui khỏi chiến dịch";
      isWithdrawalButton = true;
      joinDisabled = false;
    }
  }

  /* -------------------- custom day rendering -------------------- */
  /* -------------------- custom day rendering -------------------- */
  const CustomDay = (
    props: PickersDayProps<Dayjs> & {
      startDate?: string | Date;
      endDate?: string | Date;
      isToday?: boolean;
      isStartDate?: boolean;
      isEndDate?: boolean;
    }
  ) => {
    const {
      day,
      startDate,
      endDate,
      isToday,
      isStartDate,
      isEndDate,
      ...other
    } = props;

    // Ensure day is a Dayjs instance
    const safeDay = day ? dayjs(day) : null;

    const isDisabled = () => {
      if (!safeDay || !startDate || !endDate) return false;
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      return safeDay.isBefore(start, "day") || safeDay.isAfter(end, "day");
    };

    const isWithinRange = () => {
      if (!safeDay || !startDate || !endDate) return false;
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      return (
        (safeDay.isSame(start, "day") || safeDay.isAfter(start, "day")) &&
        (safeDay.isSame(end, "day") || safeDay.isBefore(end, "day"))
      );
    };

    return (
      <Box
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {(isStartDate || isToday || isEndDate) && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.65rem",
              lineHeight: 1,
              mb: 0.5,
              color: isStartDate
                ? "primary.main"
                : isToday
                ? "success.main"
                : "error.main",
              fontWeight: "bold",
            }}
          >
            {isStartDate ? "Bắt đầu" : isToday ? "Hôm nay" : "Kết thúc"}
          </Typography>
        )}
        <PickersDay
          {...other}
          day={safeDay || dayjs()}
          sx={{
            ...(isDisabled() && {
              opacity: 0.5,
              color: "text.disabled",
            }),
            ...(isWithinRange() && {
              fontWeight: 500,
              backgroundColor: isToday
                ? "#e0f7fa"
                : isStartDate || isEndDate
                ? "#bbdefb"
                : "transparent",
              "&:hover": {
                backgroundColor: "#e0f7fa",
              },
            }),
            ...(isToday && {
              border: "2px solid #00acc1",
            }),
            margin: 0,
            width: 36,
            height: 36,
            fontSize: "0.875rem",
            ...other.sx,
          }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#f9f9f9", pb: 10 }}>
      <Header />

      <Card sx={{ borderRadius: 0 }}>
        <CardMedia
          component="img"
          image={
            image ||
            "https://via.placeholder.com/1200x400?text=Chiến+dịch+thiện+nguyện"
          }
          height="400"
          alt={name}
        />
      </Card>

      {/* ---------- nội dung + sidebar ---------- */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: 2,
          mt: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        {/* ----- nội dung bên trái ----- */}
        <Box flex={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <IconButton
              onClick={() => navigate("/campaigns")}
              sx={{ mr: 1, color: "inherit" }}
              aria-label="back to campaigns"
            >
              <ArrowBackIcon />
            </IconButton>
            {name}
          </Typography>

          <Typography
            variant="body1"
            sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}
          >
            {description || "Không có mô tả chi tiết."}
          </Typography>

          {startDate && (
            <Typography variant="body2" sx={{ mt: 3 }} color="text.secondary">
              🕓 Từ: {dayjs(startDate).format("DD/MM/YYYY")} đến{" "}
              {endDate ? dayjs(endDate).format("DD/MM/YYYY") : "?"}
            </Typography>
          )}

          <Typography variant="subtitle1" color="text.secondary" mt={2}>
            📍 {location?.address || "Không rõ địa điểm"}
          </Typography>
          {/* Location Actions */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<MyLocationIcon />}
              onClick={handleGetUserLocation}
            >
              Vị trí của tôi
            </Button>
            <Button
              variant="outlined"
              startIcon={<DirectionsIcon />}
              onClick={handleCreateRoute}
              disabled={!userLocation}
            >
              Chỉ đường
            </Button>
          </Box>
          {campaign?.location?.coordinates ? (
            <Box sx={mapContainerStyle}>
              <MapContainer
                center={[center.lat, center.lng]}
                zoom={15}
                style={mapContainerStyle}
                scrollWheelZoom={false}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[center.lat, center.lng]} icon={campaignIcon}>
                  <Popup>
                    <Typography variant="body2">{name}</Typography>
                    <Typography variant="caption">
                      {location?.address || "Campaign location"}
                    </Typography>
                  </Popup>
                </Marker>
                {userLocation && (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={userIcon}
                  >
                    <Popup>
                      <Typography variant="body2">Vị trí của bạn</Typography>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </Box>
          ) : (
            <Box className="no-data-container">
              <Typography variant="body1" color="text.disabled">
                No location coordinates available
              </Typography>
            </Box>
          )}
        </Box>

        {/* ----- sidebar bên phải ----- */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: "100%", md: 340 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", fontSize: "0.75rem" }}>
                VHHT
              </Avatar>
              <Box>
                <Typography fontWeight={700}>Người đăng</Typography>
                <Typography variant="body2" color="text.secondary">
                  Quản trị viên VHHT
                </Typography>
              </Box>
            </Stack>

            <Button
              disabled={joinDisabled}
              onClick={
                isWithdrawalButton ? handleOpenWithdrawalDialog : handleJoin
              }
              fullWidth
              variant="contained"
              color={isWithdrawalButton ? "error" : "success"}
              sx={{ mt: 3, textTransform: "none", borderRadius: 2 }}
            >
              {joinLoading ? "Đang gửi..." : joinLabel}
            </Button>

            {myVolunteer?.status === "approved" && (
              <Button
                fullWidth
                variant="contained"
                color="success"
                sx={{
                  mt: 2,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#4caf50", // Green color
                  "&:hover": {
                    bgcolor: "#388e3c", // Darker green on hover
                  },
                }}
                onClick={() => navigate(`/campaigns/${campaignId}/tasks`)}
              >
                Xem nhiệm vụ
              </Button>
            )}
          </Paper>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <CalendarMonthIcon color="primary" />
              <Typography fontWeight={700}>Lịch hoạt động</Typography>
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                defaultValue={dayjs(startDate)}
                readOnly
                views={["day"]}
                onMonthChange={() => {}}
                shouldDisableDate={(day: Dayjs) => {
                  if (!startDate || !endDate) return false;
                  const start = dayjs(startDate);
                  const end = dayjs(endDate);
                  return day.isBefore(start, "day") || day.isAfter(end, "day");
                }}
                slots={{
                  day: (props) => (
                    <CustomDay
                      {...props}
                      startDate={startDate}
                      endDate={endDate}
                      isToday={props.day.isSame(dayjs(), "day")}
                      isStartDate={props.day.isSame(dayjs(startDate), "day")}
                      isEndDate={props.day.isSame(dayjs(endDate), "day")}
                    />
                  ),
                }}
                slotProps={{
                  day: { outsideCurrentMonth: false } as any,
                }}
              />
            </LocalizationProvider>
          </Paper>

          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              onClick={() => setIsFavorited(!isFavorited)}
              sx={{ bgcolor: "white", boxShadow: 1 }}
            >
              {isFavorited ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <IconButton sx={{ bgcolor: "white", boxShadow: 1 }}>
              <ShareIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* ---------- login dialog ---------- */}
      <Dialog open={loginDialogOpen} onClose={handleCloseLoginDialog}>
        <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn cần đăng nhập để tham gia chiến dịch này.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: "bold" }}>
            Bạn đã có tài khoản chưa?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleNavigateToRegister}
            color="primary"
            variant="outlined"
          >
            Chưa, tôi muốn đăng ký
          </Button>
          <Button
            onClick={handleNavigateToLogin}
            color="primary"
            variant="contained"
            autoFocus
          >
            Có, đăng nhập ngay
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- withdrawal dialog ---------- */}
      <Dialog open={withdrawalDialogOpen} onClose={handleCloseWithdrawalDialog}>
        <DialogTitle>Rút lui khỏi chiến dịch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vui lòng nhập tiêu đề và lý do bạn muốn rút lui khỏi chiến dịch. Yêu
            cầu của bạn sẽ được gửi đến quản lý để duyệt.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Tiêu đề"
            fullWidth
            value={withdrawalTitle}
            onChange={(e) => setWithdrawalTitle(e.target.value)}
            variant="outlined"
            required
          />
          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={4}
            value={withdrawalDescription}
            onChange={(e) => setWithdrawalDescription(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWithdrawalDialog} color="primary">
            Hủy
          </Button>
          <Button
            onClick={handleOpenConfirmDialog}
            color="primary"
            variant="contained"
            disabled={
              withdrawalLoading || !withdrawalTitle || !withdrawalDescription
            }
          >
            {withdrawalLoading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- confirmation dialog ---------- */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" fontSize="large" />
          <span>Xác nhận rút lui</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant="body1" gutterBottom>
              Bạn chắc chắn muốn rời khỏi chiến dịch?
            </Typography>
            <Typography variant="body1" color="error" fontWeight="bold">
              Các thành tựu nhiệm vụ đã hoàn thành của bạn sẽ không được ghi
              nhận!!!
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmDialog}
            color="primary"
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Thoát
          </Button>
          <Button
            onClick={() => {
              handleCloseConfirmDialog();
              handleSubmitWithdrawal();
            }}
            color="error"
            variant="contained"
            sx={{ minWidth: 120 }}
            startIcon={<ExitToAppIcon />}
          >
            Chắc chắn
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- snackbar ---------- */}
      <Snackbar
        open={!!joinMessage}
        autoHideDuration={4000}
        onClose={() => setJoinMessage(null)}
        message={joinMessage}
      />

      <Footer />
    </Box>
  );
};

export default CampaignVolunteerDetail;
