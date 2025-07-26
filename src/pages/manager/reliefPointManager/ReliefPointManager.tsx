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
  TextField,
  FormControl,
  InputLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Import CSS cho Leaflet
import { StormAPI } from "@/apis/storm.api";
import { ReliefPointAPI } from "@/apis/reliefpoint.api"; // Import API
import { useNavigate } from "react-router-dom";

// Interface Storm giữ nguyên
interface Storm {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  centerLocation?: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  status: "active" | "ended";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// Interface ReliefPoint thống nhất (dựa trên schema backend, _id optional cho items)
interface ReliefPoint {
  _id: string;
  name: string;
  type: "need" | "supply";
  createdAt: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
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
    _id?: string; // Optional, backend generate cho response
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
    _id?: string; // Optional
  }>;
  status?: "pending" | "in-progress" | "resolved" | "rejected";
  verified?: boolean;
  responders?: Array<unknown>;
  stormId?: string;
  updatedAt?: string;
  __v?: number;
  contact?: string; // Thêm theo schema
}

// Interface cho formData
interface FormDataType extends Partial<ReliefPoint> {
  surplus: Array<{
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
  }>;
  needs: Array<{
    type:
      | "người mắc kẹt"
      | "bị thương"
      | "thiếu đồ ăn"
      | "thiếu nước"
      | "thiếu thuốc"
      | "khác";
    quantity: number;
    note: string;
  }>;
  contact?: string; // Thêm field contact
}

// Icon tùy chỉnh cho marker
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
  iconUrl: "https://img.icons8.com/ios/50/storm.png", // URL online để đảm bảo hiển thị (có thể thay bằng icon khác)
  iconSize: [40, 40], // Điều chỉnh size tùy theo icon
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const rippleIcon = L.divIcon({
  html: `<div style="width:48px;height:48px;border-radius:50%;border:2px solid red;background:rgba(255,0,0,0.2);animation:ripple 1.5s infinite ease-out"></div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 28],
  className: "",
});

// Component để zoom bản đồ fit tất cả marker
const FitBounds: React.FC<{
  points: ReliefPoint[];
  stormCenter: { lat: number; lng: number } | null;
}> = ({ points, stormCenter }) => {
  const map = useMap();
  useEffect(() => {
    let bounds: L.LatLngBounds | undefined;
    const validPoints = points
      .filter((p) => p.location?.coordinates?.length === 2)
      .map(
        (p) =>
          [p.location.coordinates[1], p.location.coordinates[0]] as [
            number,
            number
          ]
      );
    if (validPoints.length > 0) {
      bounds = L.latLngBounds(validPoints);
    }
    if (stormCenter) {
      const centerPos = [stormCenter.lat, stormCenter.lng] as [number, number];
      if (bounds) {
        bounds.extend(centerPos);
      } else {
        bounds = L.latLngBounds([centerPos]);
      }
    }
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, stormCenter, map]);
  return null;
};

// Component để chọn vị trí trên bản đồ trong modal
const LocationPicker: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ReliefPointManager: React.FC = () => {
  const [storms, setStorms] = useState<Storm[]>([]);
  const [selectedStorm, setSelectedStorm] = useState<string>("");
  const [points, setPoints] = useState<ReliefPoint[]>([]);
  const [filterType, setFilterType] = useState<"all" | "need" | "supply">(
    "all"
  );
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<"supply" | "need" | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    location: { type: "Point", coordinates: [0, 0] },
    surplus: [],
    needs: [],
    stormId: "",
    contact: "",
  });
  const [selectedPoint, setSelectedPoint] = useState<ReliefPoint | null>(null);
  const [stormCenter, setStormCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [activeLink, setActiveLink] = useState<"storms" | "campaigns">(
    "storms"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
          @keyframes ripple {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  useEffect(() => {
    const fetchStorms = async () => {
      try {
        const data = await StormAPI.getAllStorms();
        setStorms(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bão", err);
      }
    };
    fetchStorms();
  }, []);

  useEffect(() => {
    if (!selectedStorm) return;
    const fetchPoints = async () => {
      try {
        const data = await ReliefPointAPI.getAllReliefPoints({
          stormId: selectedStorm,
        });
        setPoints(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách điểm cứu trợ", err);
        setPoints([]);
      }
    };
    fetchPoints();

    // Lấy centerLocation từ storm được chọn
    const currentStorm = storms.find((s) => s._id === selectedStorm);
    if (currentStorm && currentStorm.centerLocation) {
      console.log("Center Location:", currentStorm.centerLocation); // Debug để kiểm tra data
      setStormCenter(currentStorm.centerLocation);
    } else {
      console.log("No centerLocation for this storm"); // Debug
      setStormCenter(null);
    }
  }, [selectedStorm, storms]);

  const filteredPoints = points.filter(
    (p) => filterType === "all" || p.type === filterType
  );

  const handleOpenModal = (type: "supply" | "need") => {
    setModalType(type);
    setFormData({
      name: "",
      description: "",
      location: { type: "Point", coordinates: [0, 0] },
      surplus:
        type === "supply" ? [{ type: "thực phẩm", quantity: 0, note: "" }] : [],
      needs:
        type === "need"
          ? [{ type: "người mắc kẹt", quantity: 0, note: "" }]
          : [],
      stormId: selectedStorm,
      contact: "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalType(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      location: { type: "Point", coordinates: [lng, lat] },
    }); // Lưu [lng, lat]
  };

  const handleItemChange = <T extends "surplus" | "needs">(
    field: T,
    index: number,
    key: keyof FormDataType[T][number],
    value: FormDataType[T][number][typeof key]
  ) => {
    const items = [...formData[field]];
    items[index] = { ...items[index], [key]: value };
    setFormData({ ...formData, [field]: items });
  };

  const addItem = (field: "surplus" | "needs") => {
    const newItem =
      field === "surplus"
        ? { type: "thực phẩm", quantity: 0, note: "" }
        : { type: "người mắc kẹt", quantity: 0, note: "" };
    setFormData({ ...formData, [field]: [...formData[field], newItem] });
  };

  const removeItem = (field: "surplus" | "needs", index: number) => {
    const items = [...formData[field]];
    items.splice(index, 1);
    setFormData({ ...formData, [field]: items });
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        type: modalType,
      };
      const newPoint = await ReliefPointAPI.createReliefPoint(dataToSend);
      setPoints([...points, newPoint]);
      handleCloseModal();
    } catch (err) {
      console.error("Lỗi khi tạo điểm cứu trợ", err);
    }
  };

  const handleSelectPoint = (point: ReliefPoint) => {
    setSelectedPoint(point);
  };

  const handleCloseDetail = () => {
    setSelectedPoint(null);
  };

  const handleDeletePoint = async () => {
    if (!selectedPoint) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa điểm cứu trợ này không?")) {
      try {
        await ReliefPointAPI.deleteReliefPoint(selectedPoint._id);
        setPoints(points.filter((p) => p._id !== selectedPoint._id));
        handleCloseDetail();
      } catch (err) {
        console.error("Lỗi khi xóa điểm cứu trợ", err);
      }
    }
  };

  return (
    <Box>
      <div className="tab-list-container">
        <ul className="tab-list">
          <li
            className={activeLink === "campaigns" ? "active" : ""}
            onClick={() => {
              setActiveLink("campaigns");
              navigate("/manager/campaigns");
            }}
          >
            Quản lý Chiến dịch
          </li>
          <li
            className={activeLink === "storms" ? "active" : ""}
            onClick={() => setActiveLink("storms")}
          >
            Quản lý bão
          </li>
        </ul>
      </div>
      <Typography variant="h5" fontWeight="bold" p={3}>
        📍 Quản lý điểm cứu trợ
      </Typography>

      {/* Chọn bão */}
      <Stack direction="row" spacing={2} alignItems="center" mb={3} pl={3}>
        <Typography>🌪️ Cơn bão:</Typography>
        <Select
          value={selectedStorm}
          onChange={(e) => setSelectedStorm(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Chọn cơn bão
          </MenuItem>
          {storms.map((storm) => (
            <MenuItem key={storm._id} value={storm._id}>
              {storm.name}
            </MenuItem>
          ))}
        </Select>

        {/* Hiển thị trạng thái */}
        {selectedStorm &&
          (() => {
            const storm = storms.find((s) => s._id === selectedStorm);
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
                        window.confirm(
                          "Bạn có chắc chắn muốn kết thúc bão này không?"
                        )
                      ) {
                        try {
                          await StormAPI.deactivateStorm(storm._id);
                          const updated = await StormAPI.getAllStorms();
                          setStorms(updated);
                        } catch (err) {
                          console.error("Lỗi khi kết thúc bão:", err);
                          alert("Có lỗi xảy ra khi kết thúc bão.");
                        }
                      }
                    }}
                  >
                    🛑 Kết thúc cảnh báo bão
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      try {
                        await StormAPI.activateStorm(storm._id);
                        const updated = await StormAPI.getAllStorms();
                        setStorms(updated);
                      } catch (err) {
                        console.error("Lỗi khi kích hoạt bão:", err);
                        alert("Có lỗi xảy ra khi kích hoạt bão.");
                      }
                    }}
                  >
                    Kích hoạt cảnh báo bão
                  </Button>
                )}
              </>
            );
          })()}
      </Stack>

      {/* Filter loại điểm */}
      {selectedStorm && (
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Typography>Lọc điểm:</Typography>
          <Select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "all" | "need" | "supply")
            }
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="supply">Cung cấp</MenuItem>
            <MenuItem value="need">Cần giúp</MenuItem>
          </Select>
        </Stack>
      )}

      {/* Nút tạo điểm */}
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

      {/* Bản đồ hiển thị điểm */}
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
                  eventHandlers={{
                    click: () => handleSelectPoint(p),
                  }}
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

      {/* Danh sách điểm */}
      {filteredPoints.length > 0 && (
        <Paper variant="outlined">
          {filteredPoints.map((p) => (
            <Box
              key={p._id}
              p={2}
              borderBottom="1px solid #eee"
              sx={{ cursor: "pointer" }}
              onClick={() => handleSelectPoint(p)}
            >
              <Typography fontWeight={600}>
                {p.name} – {p.type === "supply" ? "🟢 Cung cấp" : "🔴 Cần giúp"}
              </Typography>
              <Typography variant="caption" color="gray">
                {new Date(p.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      {selectedStorm && filteredPoints.length === 0 && (
        <Typography color="gray">Chưa có điểm nào cho bão này.</Typography>
      )}

      {/* Modal form tạo điểm */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {modalType === "supply"
            ? "Tạo điểm cung cấp"
            : "Tạo điểm cần giúp đỡ"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tên điểm"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />

          {/* Bản đồ chọn vị trí */}
          <Typography variant="body1" mb={1}>
            Chọn vị trí trên bản đồ (click để chọn):
          </Typography>
          <Box sx={{ height: "300px", width: "100%", mb: 2 }}>
            <MapContainer
              center={[18.333, 105.9]}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </Box>

          {/* Hiển thị vị trí đã chọn */}
          <Typography variant="body2" color="textSecondary" mb={2}>
            Chọn vị trí trên bản đồ (click để chọn) (kinh độ - vĩ độ):{" "}
            {formData.location?.coordinates[0] ?? 0} -{" "}
            {formData.location?.coordinates[1] ?? 0}
          </Typography>

          {/* Field contact */}
          <TextField
            label="Liên hệ"
            name="contact"
            value={formData.contact || ""}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />

          {modalType === "supply" && (
            <>
              <Typography variant="subtitle1" mt={2}>
                Dư thừa:
              </Typography>
              {formData.surplus.map((item, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  mb={1}
                >
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Loại</InputLabel>
                    <Select
                      value={item.type || ""}
                      onChange={(e) =>
                        handleItemChange(
                          "surplus",
                          index,
                          "type",
                          e.target.value as any
                        )
                      }
                    >
                      <MenuItem value="thực phẩm">Thực phẩm</MenuItem>
                      <MenuItem value="nước uống">Nước uống</MenuItem>
                      <MenuItem value="quần áo">Quần áo</MenuItem>
                      <MenuItem value="thuốc men">Thuốc men</MenuItem>
                      <MenuItem value="chăn màn">Chăn màn</MenuItem>
                      <MenuItem value="dụng cụ y tế">Dụng cụ y tế</MenuItem>
                      <MenuItem value="khác">Khác</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Số lượng"
                    type="number"
                    value={item.quantity || 0}
                    onChange={(e) =>
                      handleItemChange(
                        "surplus",
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    sx={{ width: "150px" }}
                  />
                  <TextField
                    label="Ghi chú"
                    value={item.note || ""}
                    onChange={(e) =>
                      handleItemChange("surplus", index, "note", e.target.value)
                    }
                    fullWidth
                  />
                  <IconButton onClick={() => removeItem("surplus", index)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button onClick={() => addItem("surplus")}>
                Thêm loại cung cấp
              </Button>
            </>
          )}

          {modalType === "need" && (
            <>
              <Typography variant="subtitle1" mt={2}>
                Nhu cầu:
              </Typography>
              {formData.needs.map((item, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  mb={1}
                >
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Loại nhu cầu</InputLabel>
                    <Select
                      value={item.type || ""}
                      onChange={(e) =>
                        handleItemChange(
                          "needs",
                          index,
                          "type",
                          e.target.value as any
                        )
                      }
                    >
                      <MenuItem value="người mắc kẹt">Người mắc kẹt</MenuItem>
                      <MenuItem value="bị thương">Bị thương</MenuItem>
                      <MenuItem value="thiếu đồ ăn">Thiếu đồ ăn</MenuItem>
                      <MenuItem value="thiếu nước">Thiếu nước</MenuItem>
                      <MenuItem value="thiếu thuốc">Thiếu thuốc</MenuItem>
                      <MenuItem value="khác">Khác</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Số lượng"
                    type="number"
                    value={item.quantity || 0}
                    onChange={(e) =>
                      handleItemChange(
                        "needs",
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    sx={{ width: "150px" }}
                  />
                  <TextField
                    label="Ghi chú"
                    value={item.note || ""}
                    onChange={(e) =>
                      handleItemChange("needs", index, "note", e.target.value)
                    }
                    fullWidth
                  />
                  <IconButton onClick={() => removeItem("needs", index)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button onClick={() => addItem("needs")}>
                Thêm loại nhu cầu
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog hiển thị chi tiết point */}
      <Dialog
        open={!!selectedPoint}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết điểm cứu trợ</DialogTitle>
        <DialogContent>
          {selectedPoint && (
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom color="primary">
                {selectedPoint.name}
              </Typography>
              <Chip
                label={
                  selectedPoint.type === "supply" ? "Cung cấp" : "Cần giúp"
                }
                color={selectedPoint.type === "supply" ? "success" : "error"}
                sx={{ mb: 2 }}
              />
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Mô tả"
                    secondary={selectedPoint.description || "Không có"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Liên hệ"
                    secondary={selectedPoint.contact || "Không có"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Tạo lúc"
                    secondary={new Date(
                      selectedPoint.createdAt
                    ).toLocaleString()}
                  />
                </ListItem>
              </List>

              {selectedPoint.type === "supply" &&
                selectedPoint.surplus &&
                selectedPoint.surplus.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Dư thừa:
                    </Typography>
                    <List dense>
                      {selectedPoint.surplus.map((s, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={s.type}
                            secondary={`${s.quantity} - ${
                              s.note || "Không có ghi chú"
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

              {selectedPoint.type === "need" &&
                selectedPoint.needs &&
                selectedPoint.needs.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Nhu cầu:
                    </Typography>
                    <List dense>
                      {selectedPoint.needs.map((n, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={n.type}
                            secondary={`${n.quantity} - ${
                              n.note || "Không có ghi chú"
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Đóng</Button>
          <Button variant="contained" color="error" onClick={handleDeletePoint}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReliefPointManager;
