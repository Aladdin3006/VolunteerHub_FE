import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  Button,
  Stack,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
} from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import WarningIcon from "@mui/icons-material/Warning";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { StormAPI } from "@/apis/storm.api";
import { ReliefPointAPI } from "@/apis/reliefpoint.api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // tiếng Việt
import ManagerTabs from "../ManagerTabs";
import CreateReliefPointDialog from "../ReliefPointCreateDialog";
import RescueHistoryDialog from "@/components/storm/RescueHistoryDialog";

interface Storm {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  centerLocation?: { lat: number; lng: number };
  isActive: boolean;
  status: "active" | "ended";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface RescueProof {
  images: string[];
  note?: string;
  uploadedAt?: string;
}

interface RescueEntry {
  rescuedAt?: string;
  rescueNote?: string;
  rescueProofs?: RescueProof[];
}

interface ReliefPoint {
  _id: string;
  name: string;
  type: "need" | "supply";
  createdAt: string;
  location: { type: "Point"; coordinates: [number, number] };
  description?: string;
  surplus?: Array<{
    type:
      | "thực phẩm"
      | "nước uống"
      | "quần áo"
      | "thuốc men"
      | "chăn màn"
      | "dụng cụ y tế"
      | "khác";
    quantity: number;
    note: string;
    _id?: string;
  }>;
  needs?: Array<{
    type:
      | "người mắc kẹt"
      | "bị thương"
      | "thiếu đồ ăn"
      | "thiếu nước"
      | "thiếu thuốc"
      | "khác";
    quantity: number;
    note: string;
    _id?: string;
  }>;
  status?: "pending" | "in-progress" | "resolved" | "rejected";
  verified?: boolean;
  responders?: Array<unknown>;
  stormId?: string;
  updatedAt?: string;
  __v?: number;
  contact?: string;
  rescueStatus?: boolean;
  rescueList?: RescueEntry[];
}

dayjs.extend(relativeTime);
dayjs.locale("vi");

const supplyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const needIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stormCenterIcon = new L.Icon({
  iconUrl: "/icons/storm-center.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const rippleIcon = L.divIcon({
  html: `<div style="width:48px;height:48px;border-radius:50%;border:2px solid red;background:rgba(255,0,0,0.2);animation:ripple 1.5s infinite ease-out"></div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 28],
  className: "",
});

function FitBounds({
  points,
  stormCenter,
}: {
  points: ReliefPoint[];
  stormCenter: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    let bounds: L.LatLngBounds | undefined;
    const valid = points
      .filter((p) => p.location?.coordinates?.length === 2)
      .map(
        (p) =>
          [p.location.coordinates[1], p.location.coordinates[0]] as [
            number,
            number
          ]
      );
    if (valid.length > 0) bounds = L.latLngBounds(valid);
    if (stormCenter) {
      const c = [stormCenter.lat, stormCenter.lng] as [number, number];
      bounds ? bounds.extend(c) : (bounds = L.latLngBounds([c]));
    }
    if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
  }, [points, stormCenter, map]);
  return null;
}

export default function ReliefPointManager() {
  const [storms, setStorms] = useState<Storm[]>([]);
  const [selectedStorm, setSelectedStorm] = useState<string>("");
  const [points, setPoints] = useState<ReliefPoint[]>([]);
  const [filterType, setFilterType] = useState<"all" | "need" | "supply">(
    "all"
  );
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<"supply" | "need" | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ReliefPoint | null>(null);
  const [stormCenter, setStormCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [activeLink, setActiveLink] = useState<"storms" | "campaigns">(
    "storms"
  );
  const [openRescueDialog, setOpenRescueDialog] = useState(false);
  const [rescuePointId, setRescuePointId] = useState<string | null>(null);
  const [openWindy, setOpenWindy] = useState(false);
  const [activatingStorm, setActivatingStorm] = useState(false);
  const navigate = useNavigate();
  const openRescueHistory = (id: string) => {
    setRescuePointId(id);
    setOpenRescueDialog(true);
  };
  const closeRescueHistory = () => {
    setOpenRescueDialog(false);
    setRescuePointId(null);
  };
  const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `@keyframes ripple{0%{transform:scale(0.6);opacity:1}100%{transform:scale(2.5);opacity:0}}`;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await StormAPI.getAllStorms();
        setStorms(data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!selectedStorm) return;
    (async () => {
      try {
        const data = await ReliefPointAPI.getAllReliefPoints({
          stormId: selectedStorm,
        });
        setPoints(Array.isArray(data) ? data : []);
      } catch {
        setPoints([]);
      }
    })();
    const cur = storms.find((s) => s._id === selectedStorm);
    setStormCenter(cur?.centerLocation || null);
  }, [selectedStorm, storms]);

  const filteredPoints = points.filter(
    (p) => filterType === "all" || p.type === filterType
  );

  const handleOpenModal = (type: "supply" | "need") => {
    setModalType(type);
    setOpenModal(true);
  };

  const handleVerifyPoint = async () => {
    if (!selectedPoint) return;
    setVerifying(true);
    try {
      const verified = await ReliefPointAPI.verifyReliefPoint(
        selectedPoint._id
      );
      setSelectedPoint(verified);
      setPoints((prev) =>
        prev.map((p) => (p._id === verified._id ? verified : p))
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleDeletePoint = async () => {
    if (!selectedPoint) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa điểm cứu trợ này không?"))
      return;
    await ReliefPointAPI.deleteReliefPoint(selectedPoint._id);
    setPoints((prev) => prev.filter((p) => p._id !== selectedPoint._id));
    setSelectedPoint(null);
  };

  return (
    <Box>
      <ManagerTabs
        activeTab={activeLink}
        onTabChange={(v) => setActiveLink(v)}
      />
      <Typography variant="h5" fontWeight="bold" p={1}>
        📍 Quản lý điểm cứu trợ
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={1} pl={3}>
        <Typography>🌪️ Thảm hoạ:</Typography>
        <Select
          value={selectedStorm}
          onChange={(e) => setSelectedStorm(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Chọn cảnh báo thảm hoạ
          </MenuItem>
          {storms.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {s.name}
                <Chip
                  label={s.isActive ? "🟢" : "⚪"}
                  color={s.isActive ? "success" : "default"}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
        {selectedStorm &&
          (() => {
            const storm = storms.find((x) => x._id === selectedStorm);
            if (!storm) return null;
            return (
              <>
                <Chip
                  label={
                    storm.isActive ? "🟢 Đang hoạt động" : "⚪ Đã kết thúc"
                  }
                  color={storm.isActive ? "success" : "default"}
                />
                {storm.isActive ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          "Bạn có chắc chắn muốn kết thúc bão này không?, hãy chắc chắn các điểm cứu hộ đã được hỗ trợ"
                        )
                      )
                        return;
                      await StormAPI.deactivateStorm(storm._id);
                      const updated = await StormAPI.getAllStorms();
                      setStorms(updated);
                    }}
                  >
                    🛑 Kết thúc cảnh báo bão
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      setActivatingStorm(true);
                      try {
                        await StormAPI.activateStorm(storm._id);
                        const updated = await StormAPI.getAllStorms();
                        setStorms(updated);
                      } catch (error) {
                        console.error("Failed to activate storm:", error);
                      } finally {
                        setActivatingStorm(false);
                      }
                    }}
                    disabled={activatingStorm}
                  >
                    {activatingStorm
                      ? "Đang kích hoạt..."
                      : "Kích hoạt cảnh báo thảm họa"}
                  </Button>
                )}
                {storm.status == "ended" ? (
                  <></>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        await StormAPI.deactivateStormRL(storm._id);
                        const updated = await StormAPI.getAllStorms();
                        setStorms(updated);
                      }}
                    >
                      Thông báo bão đã tan
                    </Button>

                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => setOpenWindy(true)}
                      sx={{ ml: 1 }}
                    >
                      🌪️ Thông tin cơn bão
                    </Button>

                    <Dialog
                      open={openWindy}
                      onClose={() => setOpenWindy(false)}
                      maxWidth="lg"
                      fullWidth
                    >
                      <DialogTitle>Thông tin cơn bão {storm.name}</DialogTitle>
                      <DialogContent>
                        <iframe
                          width="100%"
                          height="500"
                          src="https://embed.windy.com/embed2.html?lat=16.0471&lon=108.2068&detailLat=16.0471&detailLon=108.2068&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
                          frameBorder="0"
                          title="Windy Live Map"
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setOpenWindy(false)}>
                          Đóng
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}
              </>
            );
          })()}
      </Stack>

      {selectedStorm && (
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Typography>Lọc điểm:</Typography>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="supply">Cung cấp</MenuItem>
            <MenuItem value="need">Cần giúp</MenuItem>
          </Select>
        </Stack>
      )}

      {selectedStorm && (
        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddLocationAltIcon />}
            onClick={() => handleOpenModal("supply")}
          >
            Tạo điểm cung cấp
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<WarningIcon />}
            onClick={() => handleOpenModal("need")}
          >
            Tạo điểm cần giúp đỡ
          </Button>
        </Stack>
      )}

      {selectedStorm && (
        <Box mb={3} sx={{ height: "400px", width: "100%" }}>
          <MapContainer
            center={[16.0, 106.0]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <FitBounds points={filteredPoints} stormCenter={stormCenter} />
            {filteredPoints
              .filter((p) => p.location?.coordinates?.length === 2)
              .map((p) => (
                <Marker
                  key={p._id}
                  position={[
                    p.location.coordinates[1],
                    p.location.coordinates[0],
                  ]}
                  icon={p.type === "supply" ? supplyIcon : needIcon}
                  eventHandlers={{ click: () => setSelectedPoint(p) }}
                >
                  <Popup>
                    <Typography fontWeight={600}>
                      {p.name} –{" "}
                      {p.type === "supply" ? "🟢 Cung cấp" : "🔴 Cần giúp"}
                    </Typography>
                    <Typography variant="caption" color="gray">
                      {new Date(p.createdAt).toLocaleString()}
                    </Typography>
                  </Popup>
                </Marker>
              ))}
            {stormCenter && (
              <>
                <Marker
                  position={[stormCenter.lat, stormCenter.lng]}
                  icon={stormCenterIcon}
                >
                  <Popup>
                    <Typography fontWeight={600}>Tâm bão</Typography>
                  </Popup>
                </Marker>
                <Marker
                  position={[stormCenter.lat, stormCenter.lng]}
                  icon={rippleIcon}
                />
              </>
            )}
          </MapContainer>
        </Box>
      )}

      {filteredPoints.length > 0 && (
        <Paper variant="outlined">
          {filteredPoints.map((p) => (
            <Box
              key={p._id}
              p={2}
              borderBottom="1px solid #eee"
              sx={{ cursor: "pointer" }}
              onClick={() => setSelectedPoint(p)}
            >
              <Typography fontWeight={600}>
                {p.type === "supply" ? "🟢" : "🔴"} {p.name} -{" "}
                <Box
                  component="span"
                  sx={{ fontSize: "0.85rem", fontWeight: 400 }}
                >
                  {p.description}
                </Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(p.createdAt).fromNow()}
              </Typography>
              {p.type !== "supply" && (
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => openRescueHistory(p._id)}
                  sx={{
                    fontSize: "0.7rem",
                    textTransform: "none",
                    py: 0.2,
                    px: 0.8,
                    ml: 1,
                    borderRadius: 2,
                  }}
                >
                  {p.rescueList?.length ?? 0} lượt cứu trợ
                </Button>
              )}
            </Box>
          ))}
        </Paper>
      )}

      {selectedStorm && filteredPoints.length === 0 && (
        <Typography color="gray">Chưa có điểm nào cho bão này.</Typography>
      )}

      <CreateReliefPointDialog
        open={openModal}
        type={modalType}
        stormId={selectedStorm}
        onClose={() => setOpenModal(false)}
        onCreated={(pt) => setPoints((prev) => [...prev, pt])}
      />
      <Dialog
        open={!!selectedPoint}
        onClose={() => setSelectedPoint(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Chi tiết điểm cứu trợ
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPoint && (
            <Stack spacing={2}>
              {/* Header */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    {selectedPoint.name}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      label={
                        selectedPoint.type === "supply"
                          ? "Cung cấp"
                          : "Cần giúp"
                      }
                      color={
                        selectedPoint.type === "supply" ? "success" : "error"
                      }
                      size="small"
                    />
                    <Chip
                      label={
                        selectedPoint.verified ? "Đã xác minh" : "Chưa xác minh"
                      }
                      color={selectedPoint.verified ? "info" : "default"}
                      variant={selectedPoint.verified ? "filled" : "outlined"}
                      size="small"
                    />
                    {selectedPoint.type === "supply" ? (
                      <></>
                    ) : (
                      <Chip
                        label={
                          selectedPoint.rescueStatus
                            ? "Đã giải quyết"
                            : "Vẫn cần trợ giúp"
                        }
                        color={
                          selectedPoint.rescueStatus ? "success" : "warning"
                        }
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>
              </Box>

              {selectedPoint.type === "supply" ? (
                <></>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  color="info"
                  onClick={() => openRescueHistory(selectedPoint._id)}
                >
                  {selectedPoint.rescueList?.length ?? 0} lượt cứu trợ
                </Button>
              )}

              {/* Description */}
              {selectedPoint.description && (
                <Typography>
                  <b>Mô tả:</b> {selectedPoint.description}
                </Typography>
              )}
              <Typography>
                <b>Liên hệ:</b> {selectedPoint.contact || "Không có"}
              </Typography>
              <Typography>
                <b>Tạo lúc:</b> {dayjs(selectedPoint.createdAt).fromNow()}
              </Typography>

              {/* Supply */}
              {selectedPoint.type === "supply" &&
                selectedPoint.surplus?.length > 0 && (
                  <Box>
                    <Typography fontWeight={600}>Cung cấp</Typography>
                    {selectedPoint.surplus.map((s, i) => (
                      <Typography key={i}>
                        {s.type}: {s.quantity} – {s.note || "Không có ghi chú"}
                      </Typography>
                    ))}
                  </Box>
                )}

              {/* Needs */}
              {selectedPoint.type === "need" &&
                selectedPoint.needs?.length > 0 && (
                  <Box>
                    <Typography fontWeight={600}>Nhu cầu</Typography>
                    {selectedPoint.needs.map((n, i) => (
                      <Typography key={i}>
                        {n.type}: {n.quantity} – {n.note || "Không có ghi chú"}
                      </Typography>
                    ))}
                  </Box>
                )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedPoint(null)}>Đóng</Button>
          {selectedPoint && !selectedPoint.verified && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerifyPoint}
              disabled={verifying}
            >
              Xác minh
            </Button>
          )}
          <Button variant="contained" color="error" onClick={handleDeletePoint}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <RescueHistoryDialog
        open={openRescueDialog}
        onClose={closeRescueHistory}
        pointId={rescuePointId}
        apiBase={API_BASE}
      />
    </Box>
  );
}
