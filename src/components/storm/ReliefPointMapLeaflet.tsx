import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Checkbox, FormControlLabel, TextField, List, ListItem, ListItemButton, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// 🧙 Fix icon mặc định không load
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

interface ReliefPointMapLeafletProps {
  stormId?: string;
  centerLocation?: {
    lat: number;
    lng: number;
  };
}

interface SupplyNeedItem {
  type: string;
  quantity?: number;
  note?: string;
}

interface ReliefPoint {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'need' | 'supply';
  needs?: SupplyNeedItem[];
  surplus?: SupplyNeedItem[];
  verified?: boolean;
}

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Khoảng cách (km)
  return distance;
};

const formatDistance = (distance: number) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(2)} km`;
};

const needTypes = [
  'người mắc kẹt',
  'bị thương',
  'thiếu đồ ăn',
  'thiếu nước',
  'thiếu thuốc',
  'khác',
];

const ReliefPointMapLeaflet: React.FC<ReliefPointMapLeafletProps> = ({
  stormId,
  centerLocation,
}) => {
  const [points, setPoints] = useState<ReliefPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ReliefPoint | null>(null);
  const [showNeeds, setShowNeeds] = useState(true);
  const [showSupplies, setShowSupplies] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showNearbyNeeds, setShowNearbyNeeds] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const mapRef = useRef<L.Map>(null);

  // Form state for reporting needs
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    needs: [{ type: '', quantity: '', note: '' }],
  });

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const url = stormId
          ? `http://localhost:4000/relief-point?stormId=${stormId}`
          : `http://localhost:4000/relief-point`;

        const res = await fetch(url);
        const data = await res.json();

        const formatted = (data || []).map((p: any) => ({
          _id: p._id,
          name: p.name,
          type: p.type,
          lat: p.location.coordinates[1],
          lng: p.location.coordinates[0],
          needs: (p.needs || []).map((n: any) => ({
            type: n.type,
            quantity: n.quantity,
            note: n.note,
          })),
          surplus: (p.surplus || []).map((s: any) => ({
            type: s.type,
            quantity: s.quantity,
            note: s.note,
          })),
          verified: p.verified,
        }));

        setPoints(formatted);
      } catch (err) {
        console.error("❌ Lỗi khi fetch relief points:", err);
      }
    };

    fetchPoints();
  }, [stormId]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowNearbyNeeds(true); // Kích hoạt hiển thị gần tôi
          if (mapRef.current) {
            mapRef.current.flyTo([position.coords.latitude, position.coords.longitude], 14);
          }
          // Cập nhật vị trí vào form nếu mở modal
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("❌ Lỗi khi lấy vị trí:", error);
          alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ lấy vị trí.");
    }
  };

  // Custom icons
  const needIcon = new L.Icon({
    iconUrl: '/icons/need-pin.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });

  const supplyIcon = new L.Icon({
    iconUrl: '/icons/supply-pin.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });

  const stormIcon = new L.Icon({
    iconUrl: '/icons/storm-center.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  const rippleIcon = L.divIcon({
    html: `<div style="width:48px;height:48px;border-radius:50%;border:2px solid red;background:rgba(255,0,0,0.2);animation:ripple 1.5s infinite ease-out"></div>`,
    iconSize: [48, 48],
    iconAnchor: [26, 44],
    className: '',
  });

  const userIcon = new L.Icon({
    iconUrl: '/icons/user-pin.png', // Giả sử bạn có icon này, nếu không thì thay bằng icon mặc định hoặc khác
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });

  // Ripple CSS
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

  const filteredPoints = points
    .filter((p) => {
      const matchesType = (showNeeds && p.type === 'need') || (showSupplies && p.type === 'supply');
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    })
    .map((p) => {
      let distance = null;
      if (userLocation) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
      }
      return { ...p, distance };
    })
    .sort((a, b) => {
      if (showNearbyNeeds) {
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      }
      return 0;
    });

  const handleListItemClick = (point: ReliefPoint) => {
    setSelectedPoint(point);
    if (mapRef.current) {
      mapRef.current.flyTo([point.lat, point.lng], 14);
    }
  };

  const handleNeedRelief = () => {
    getUserLocation(); // Lấy vị trí và mở modal
    setOpenReportModal(true);
  };

  const handleCloseReportModal = () => {
    setOpenReportModal(false);
    setFormData({
      name: '',
      description: '',
      address: '',
      lat: '',
      lng: '',
      needs: [{ type: '', quantity: '', note: '' }],
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNeedChange = (index: number, field: string, value: string) => {
    const newNeeds = [...formData.needs];
    newNeeds[index] = { ...newNeeds[index], [field]: value };
    setFormData((prev) => ({ ...prev, needs: newNeeds }));
  };

  const addNeed = () => {
    setFormData((prev) => ({
      ...prev,
      needs: [...prev.needs, { type: '', quantity: '', note: '' }],
    }));
  };

  const removeNeed = (index: number) => {
    const newNeeds = formData.needs.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, needs: newNeeds }));
  };

  const handleSubmitReport = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        type: 'need',
        stormId: stormId,
        needs: formData.needs.map((need) => ({
          type: need.type,
          quantity: need.quantity ? parseInt(need.quantity) : undefined,
          note: need.note,
        })),
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
        },
        // Các trường khác như createdBy có thể được xử lý ở backend
      };

      const res = await fetch('http://localhost:4000/relief-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Báo cáo đã được gửi thành công!');
        handleCloseReportModal();
        // Refresh points
        // Có thể gọi lại fetchPoints() để cập nhật danh sách
      } else {
        alert('Lỗi khi gửi báo cáo.');
      }
    } catch (err) {
      console.error('❌ Lỗi khi submit:', err);
      alert('Lỗi khi gửi báo cáo.');
    }
  };

  return (
    <>
      {/* Bộ lọc */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
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
        <Button variant="contained" onClick={getUserLocation}>
          Gần tôi
        </Button>
      </Box>

      {/* Danh sách các điểm */}
      <Box sx={{ mb: 2, maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 2 }}>
        <List>
          {filteredPoints.map((p) => (
            <ListItemButton
              key={p._id}
              onClick={() => handleListItemClick(p)}
              selected={selectedPoint?._id === p._id}
            >
              <ListItemText
                primary={p.name}
                secondary={p.type === 'supply' ? '🟢 Điểm cung cấp' : '🔴 Điểm cần cứu trợ'}
              />
              {p.distance !== null && (
                <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                  {formatDistance(p.distance)}
                </Typography>
              )}
            </ListItemButton>
          ))}
          {filteredPoints.length === 0 && (
            <ListItem>
              <ListItemText primary="Không có điểm nào phù hợp" />
            </ListItem>
          )}
        </List>
      </Box>

      {/* Map và hộp thông tin */}
      <Box sx={{ position: 'relative', height: '400px', width: '100%' }}>
        <MapContainer
          center={centerLocation || [18.3, 105.7]}
          zoom={10}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 📍 Các điểm cứu trợ */}
          {filteredPoints.map((p) => (
            <Marker
              key={p._id}
              position={[p.lat, p.lng]}
              icon={p.type === 'supply' ? supplyIcon : needIcon}
              eventHandlers={{
                click: () => setSelectedPoint(p),
              }}
            >
              <Popup>{p.name}</Popup>
            </Marker>
          ))}

          {/* 🌪️ Tâm bão */}
          {centerLocation && (
            <>
              <Marker position={[centerLocation.lat, centerLocation.lng]} icon={stormIcon}>
                <Popup>Tâm bão</Popup>
              </Marker>
              <Marker position={[centerLocation.lat, centerLocation.lng]} icon={rippleIcon} />
            </>
          )}

          {/* 📍 Vị trí người dùng */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>Bạn đang ở đây</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* 🔍 Hộp thông tin nằm trong map */}
        {selectedPoint && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 300,
              maxHeight: 'calc(100% - 20px)',
              overflowY: 'auto',
              bgcolor: '#fffbe6',
              border: '1px solid #fbc02d',
              borderRadius: 2,
              p: 2,
              zIndex: 1000,
              boxShadow: 3,
              transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
              opacity: selectedPoint ? 1 : 0,
              transform: selectedPoint ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                📍 {selectedPoint.name}
              </Typography>
              <IconButton onClick={() => setSelectedPoint(null)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="body2">
              {selectedPoint.type === 'supply' ? '🟢 Điểm cung cấp' : '🔴 Điểm cần cứu trợ'}
            </Typography>
            {(selectedPoint.type === 'need' ? selectedPoint.needs : selectedPoint.surplus)?.map(
              (item, i) => (
                <Box key={i} mt={1}>
                  📦 <strong>{item.type}</strong><br />
                  🔢 Số lượng: {item.quantity || "?"}<br />
                  📝 {item.note || "Không có ghi chú"}
                </Box>
              )
            )}
            <Typography variant="caption" color={selectedPoint.verified ? "green" : "gray"}>
              {selectedPoint.verified ? "✅ Đã xác minh" : "⚠️ Chưa xác minh"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Button Tôi cần cứu trợ */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="error" onClick={handleNeedRelief}>
          Tôi cần cứu trợ
        </Button>
      </Box>

      {/* Modal báo cáo needs */}
      <Dialog open={openReportModal} onClose={handleCloseReportModal} maxWidth="md" fullWidth>
        <DialogTitle>Báo cáo nhu cầu cứu trợ</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên điểm"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            multiline
            rows={3}
          />
          <TextField
            label="Địa chỉ"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Vĩ độ (lat)"
              name="lat"
              value={formData.lat}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
              required
              type="number"
            />
            <TextField
              label="Kinh độ (lng)"
              name="lng"
              value={formData.lng}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
              required
              type="number"
            />
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Nhu cầu cứu trợ
          </Typography>
          {formData.needs.map((need, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
                flexWrap: 'wrap',
                minHeight: '56px', // Đảm bảo mỗi hàng có chiều cao tối thiểu
              }}
            >
              <FormControl margin="dense" sx={{ minWidth: 150, flex: 1 }}>
                <InputLabel>Loại nhu cầu</InputLabel>
                <Select
                  value={need.type}
                  onChange={(e) => handleNeedChange(index, 'type', e.target.value as string)}
                  label="Loại nhu cầu"
                  size="small"
                >
                  {needTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Số lượng"
                value={need.quantity}
                onChange={(e) => handleNeedChange(index, 'quantity', e.target.value)}
                type="number"
                margin="dense"
                size="small"
                sx={{ width: 100, flex: 'none' }}
              />
              <TextField
                label="Ghi chú"
                value={need.note}
                onChange={(e) => handleNeedChange(index, 'note', e.target.value)}
                margin="dense"
                size="small"
                sx={{ flex: 1, minWidth: 150 }}
              />
              <IconButton onClick={() => removeNeed(index)} color="error" sx={{ ml: 1 }}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={addNeed} startIcon={<AddIcon />} sx={{ mt: 1 }}>
            Thêm nhu cầu
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportModal}>Hủy</Button>
          <Button onClick={handleSubmitReport} variant="contained" color="primary">
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReliefPointMapLeaflet;