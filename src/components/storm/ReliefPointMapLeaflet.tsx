import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  Chip,
  Stack
} from "@mui/material";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, ImageList, ImageListItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReportNeedDialog from "./ReportNeedDialog";
import RescueHistoryDialog from "./RescueHistoryDialog";

import AddRescueDialog from "./AddRescueDialog";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href
});

interface ReliefPointMapLeafletProps {
  stormId?: string;
  centerLocation?: { lat: number; lng: number };
}

interface SupplyNeedItem {
  type: string;
  quantity?: number;
  note?: string;
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
  lat: number;
  lng: number;
  type: "need" | "supply";
  needs?: SupplyNeedItem[];
  surplus?: SupplyNeedItem[];
  verified?: boolean;
  contact?: string;
  distance?: number | null;
  rescueStatus?: boolean;
  rescueList?: RescueEntry[];
}

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (d?: number | null) => {
  if (d == null) return "";
  if (d < 1) return `${Math.round(d * 1000)} m`;
  return `${d.toFixed(2)} km`;
};

const ReliefPointMapLeaflet: React.FC<ReliefPointMapLeafletProps> = ({
  stormId,
  centerLocation
}) => {
  const [points, setPoints] = useState<ReliefPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ReliefPoint | null>(null);
  const [showNeeds, setShowNeeds] = useState(true);
  const [showSupplies, setShowSupplies] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByNearby, setSortByNearby] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openAddRescue, setOpenAddRescue] = useState(false);
  const [openRescueDialog, setOpenRescueDialog] = useState(false);
  const [rescuePointId, setRescuePointId] = useState<string | null>(null);

  const openRescueHistory = (id: string) => { setRescuePointId(id); setOpenRescueDialog(true); };
  const closeRescueHistory = () => { setOpenRescueDialog(false); setRescuePointId(null); };

  const mapRef = useRef<L.Map>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

  const needIcon = useMemo(
    () => new L.Icon({ iconUrl: "/icons/need-pin.png", iconSize: [36, 36], iconAnchor: [18, 36] }),
    []
  );
  const supplyIcon = useMemo(
    () => new L.Icon({ iconUrl: "/icons/supply-pin.png", iconSize: [36, 36], iconAnchor: [18, 36] }),
    []
  );
  const stormIcon = useMemo(
    () => new L.Icon({ iconUrl: "/icons/storm-center.png", iconSize: [48, 48], iconAnchor: [24, 48] }),
    []
  );
  const userIcon = useMemo(
    () => new L.Icon({ iconUrl: "/icons/user-pin.png", iconSize: [36, 36], iconAnchor: [18, 36] }),
    []
  );
  const rippleIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="width:48px;height:48px;border-radius:50%;border:2px solid red;background:rgba(255,0,0,0.2);animation:ripple 1.5s infinite ease-out"></div>`,
        iconSize: [48, 48],
        iconAnchor: [26, 44],
        className: ""
      }),
    []
  );

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `@keyframes ripple{0%{transform:scale(0.6);opacity:1}100%{transform:scale(2.5);opacity:0}}`;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  const fetchPoints = async () => {
    try {
      const base = `${API_BASE}/relief-point`;
      const url = stormId ? `${base}?stormId=${stormId}` : base;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const formatted: ReliefPoint[] = (data || []).map((p: any) => ({
        _id: p._id,
        name: p.name,
        type: p.type,
        lat: p.location?.coordinates?.[1],
        lng: p.location?.coordinates?.[0],
        needs: (p.needs || []).map((n: any) => ({ type: n.type, quantity: n.quantity, note: n.note })),
        surplus: (p.surplus || []).map((s: any) => ({ type: s.type, quantity: s.quantity, note: s.note })),
        verified: p.verified,
        contact: p.contact,
        rescueStatus: p.rescueStatus,
        rescueList: p.rescueList
      }));
      setPoints(formatted.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchPoints(); }, [stormId]);

  const getUserLocation = () => {
    if (!navigator.geolocation) return alert("Trình duyệt không hỗ trợ lấy vị trí.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setSortByNearby(true);
        mapRef.current?.flyTo([loc.lat, loc.lng], 14);
      },
      () => alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.")
    );
  };

  const center = useMemo<[number, number]>(() => {
    if (centerLocation) return [centerLocation.lat, centerLocation.lng];
    return [18.3, 105.7];
  }, [centerLocation]);

  const filteredSorted = useMemo(() => {
    const list = points
      .filter((p) => ((showNeeds && p.type === "need") || (showSupplies && p.type === "supply")))
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((p) => ({
        ...p,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng) : null
      }));
    if (sortByNearby) list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    return list;
  }, [points, showNeeds, showSupplies, searchTerm, userLocation, sortByNearby]);

  const latestProofs: RescueProof[] | undefined = useMemo(() => {
    if (!selectedPoint?.rescueList || selectedPoint.rescueList.length === 0) return undefined;
    const last = selectedPoint.rescueList[selectedPoint.rescueList.length - 1];
    return last.rescueProofs;
  }, [selectedPoint]);

  const selectedRescueCount = selectedPoint?.rescueList?.length ?? 0;

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={showNeeds} onChange={(e) => setShowNeeds(e.target.checked)} />}
          label="Hiển thị điểm cần cứu trợ"
        />
        <FormControlLabel
          control={<Checkbox checked={showSupplies} onChange={(e) => setShowSupplies(e.target.checked)} />}
          label="Hiển thị điểm cung cấp"
        />
        <TextField
          label="Tìm kiếm theo tên"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={getUserLocation}>Gần tôi</Button>
      </Box>

      <Box sx={{ mb: 2, maxHeight: 300, overflowY: "auto", border: "1px solid #ddd", borderRadius: 2 }}>
        <List>
          {filteredSorted.map((p) => {
            const rescueCount = p.rescueList?.length ?? 0;
            return (
              <ListItem key={p._id} disablePadding>
                <ListItemButton
                  onClick={() => { setSelectedPoint(p); mapRef.current?.flyTo([p.lat, p.lng], 14); }}
                  selected={selectedPoint?._id === p._id}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <span>{p.name}</span>
                        {p.rescueStatus !== undefined && (
                          <Chip
                            size="small"
                            label={p.rescueStatus ? "Đã nhận được trợ giúp" : ""}
                            color={p.rescueStatus ? "success" : "warning"}
                          />
                        )}

                      </Stack>
                    }
                    secondary={p.type === "supply" ? "🟢 Điểm cung cấp" : "🔴 Điểm cần cứu trợ"}
                  />
                  {p.distance != null && (
                    <Typography variant="body2" color="textSecondary" sx={{ ml: "auto" }}>
                      {formatDistance(p.distance)}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
          {filteredSorted.length === 0 && (
            <ListItem><ListItemText primary="Không có điểm nào phù hợp" /></ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ position: "relative", height: 400, width: "100%" }}>
        <MapContainer center={center} zoom={10} scrollWheelZoom style={{ height: "100%", width: "100%" }} ref={mapRef}>
          <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {filteredSorted.map((p) => (
            <Marker
              key={p._id}
              position={[p.lat, p.lng]}
              icon={p.type === "supply" ? supplyIcon : needIcon}
              eventHandlers={{ click: () => setSelectedPoint(p) }}
            >
              <Popup>{p.name}</Popup>
            </Marker>
          ))}

          {centerLocation && (
            <>
              <Marker position={[centerLocation.lat, centerLocation.lng]} icon={stormIcon}>
                <Popup>Tâm bão</Popup>
              </Marker>
              <Marker position={[centerLocation.lat, centerLocation.lng]} icon={rippleIcon} />
            </>
          )}

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Bạn đang ở đây</Popup>
            </Marker>
          )}
        </MapContainer>

        {selectedPoint && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 320,
              maxHeight: "calc(100% - 20px)",
              overflowY: "auto",
              bgcolor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
              zIndex: 1000,
              boxShadow: 3
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>📍 {selectedPoint.name}</Typography>
              <IconButton onClick={() => setSelectedPoint(null)} size="small"><CloseIcon /></IconButton>
            </Box>

            <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
              <Chip
                size="small"
                label={selectedPoint.type === "supply" ? "Điểm cung cấp" : "Điểm cần cứu trợ"}
                color={selectedPoint.type === "supply" ? "success" : "error"}
                variant="outlined"
              />
              {selectedPoint.rescueStatus !== undefined && (
                <Chip
                  size="small"
                  label={selectedPoint.rescueStatus ? "ĐÃ CỨU HỘ" : "CHƯA CỨU"}
                  color={selectedPoint.rescueStatus ? "success" : "warning"}
                  variant="filled"
                />
              )}
              <Button
                size="small"
                variant="outlined"
                color="info"
                onClick={() => openRescueHistory(selectedPoint._id)}
              >
                {(selectedPoint.rescueList?.length ?? 0)} lượt cứu trợ
              </Button>
            </Stack>

            {(selectedPoint.type === "need" ? selectedPoint.needs : selectedPoint.surplus)?.map((it, i) => (
              <Box key={i} mt={1}>
                📦 <strong>{it.type}</strong><br />
                🔢 Số lượng: {it.quantity ?? "?"}<br />
                📝 {it.note || "Không có ghi chú"}<br />
                <Chip
                  size="small"
                  label={selectedPoint.verified ? "ĐÃ XÁC MINH" : "CHƯA XÁC MINH"}
                  color={selectedPoint.verified ? "success" : "error"}
                  variant="outlined"
                />

              </Box>
            ))}

            {selectedPoint.contact && (
              <Typography mt={1} variant="body2">
                📞 Liên hệ: <strong>{selectedPoint.contact}</strong>
              </Typography>
            )}
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => setOpenAddRescue(true)}
            >
              Thêm cứu trợ
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="error" onClick={() => { getUserLocation(); setOpenReport(true); }}>
          Tôi cần cứu trợ
        </Button>
      </Box>

      <ReportNeedDialog
        open={openReport}
        onClose={() => setOpenReport(false)}
        stormId={stormId}
        presetLat={userLocation?.lat ?? null}
        presetLng={userLocation?.lng ?? null}
        onSubmitted={fetchPoints}
        apiBase={API_BASE}
      />
      <AddRescueDialog
        open={openAddRescue}
        onClose={() => setOpenAddRescue(false)}
        pointId={selectedPoint?._id ?? null}
        apiBase={API_BASE}
        onSuccess={fetchPoints}
      />
      <RescueHistoryDialog
        open={openRescueDialog}
        onClose={closeRescueHistory}
        pointId={rescuePointId}
        apiBase={API_BASE}
      />
    </>
  );
};

export default ReliefPointMapLeaflet;
