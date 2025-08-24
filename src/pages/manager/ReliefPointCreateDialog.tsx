// CreateReliefPointDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ReliefPointAPI } from "@/apis/reliefpoint.api";
import MapLocationPicker from "@/components/utils/MapLocationPicker"; // cập nhật path đúng với dự án của bạn

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
}

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
  contact?: string;
}

export default function CreateReliefPointDialog({
  open,
  type,
  stormId,
  onClose,
  onCreated,
}: {
  open: boolean;
  type: "supply" | "need" | null;
  stormId: string;
  onClose: () => void;
  onCreated: (point: ReliefPoint) => void;
}) {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    location: { type: "Point", coordinates: [0, 0] },
    surplus: [],
    needs: [],
    stormId: "",
    contact: "",
  });

  // Reset form mỗi lần mở dialog + theo loại point
  useEffect(() => {
    if (!open || !type) return;
    setFormData({
      name: "",
      description: "",
      // set mặc định (lng, lat) = (105.9, 18.333)
      location: { type: "Point", coordinates: [105.9, 18.333] },
      surplus:
        type === "supply" ? [{ type: "thực phẩm", quantity: 0, note: "" }] : [],
      needs:
        type === "need" ? [{ type: "người mắc kẹt", quantity: 0, note: "" }] : [],
      stormId,
      contact: "",
    });
  }, [open, type, stormId]);

  const setField = (name: string, value: any) =>
    setFormData((s) => ({ ...s, [name]: value }));

  const setArrayItem = <T extends "surplus" | "needs">(
    field: T,
    idx: number,
    key: keyof FormDataType[T][number],
    value: FormDataType[T][number][typeof key]
  ) => {
    const arr = [...formData[field]];
    arr[idx] = { ...arr[idx], [key]: value } as any;
    setFormData({ ...formData, [field]: arr });
  };

  const addItem = (field: "surplus" | "needs") => {
    const item =
      field === "surplus"
        ? { type: "thực phẩm", quantity: 0, note: "" }
        : { type: "người mắc kẹt", quantity: 0, note: "" };
    setFormData({ ...formData, [field]: [...formData[field], item] });
  };

  const removeItem = (field: "surplus" | "needs", idx: number) => {
    const arr = [...formData[field]];
    arr.splice(idx, 1);
    setFormData({ ...formData, [field]: arr });
  };

  // nhận toạ độ từ MapLocationPicker: lat/lng (+ address nếu có)
  const handlePick = (coords: { lat: number; lng: number; address?: string }) => {
    setFormData((s) => ({
      ...s,
      location: { type: "Point", coordinates: [coords.lng, coords.lat] }, // GeoJSON: [lng, lat]
      // nếu có address thì gán tạm vào description cho tiện
      description: coords.address ? coords.address : s.description,
    }));
  };

  // center cho picker (từ formData.location)
  const mapCenter = useMemo(() => {
    const [lng, lat] = formData.location?.coordinates ?? [105.9, 18.333];
    return { lat: lat || 18.333, lng: lng || 105.9 };
  }, [formData.location]);

  const handleSubmit = async () => {
    if (!type) return;
    const payload = { ...formData, type } as any;
    const created = await ReliefPointAPI.createReliefPoint(payload);
    onCreated(created);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {type === "supply" ? "Tạo điểm cung cấp" : "Tạo điểm cần giúp đỡ"}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Tên điểm"
          name="name"
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={(e) => setField("description", e.target.value)}
          fullWidth
          margin="normal"
        />

        <Typography variant="body1" mb={1}>
          Chọn vị trí trên bản đồ:
        </Typography>

        {/* Container giữ chiều cao ổn định cho map trong Dialog */}
        <Box sx={{ height: 300, width: "100%", mb: 2 }}>
          <MapLocationPicker
            key={open ? "map-open" : "map-closed"} // remount khi mở dialog
            defaultLocation={mapCenter}
            center={mapCenter}
            onPick={handlePick}
            hideSearchInput={false}
            mapHeight="300px" // dùng px thay vì "100%" để tránh lỗi render
          />
        </Box>

        <Typography variant="body2" color="textSecondary" mb={2}>
          Tọa độ (kinh độ - vĩ độ):{" "}
          {formData.location?.coordinates[0] ?? 0} -{" "}
          {formData.location?.coordinates[1] ?? 0}
        </Typography>

        <TextField
          label="Liên hệ"
          name="contact"
          value={formData.contact || ""}
          onChange={(e) => setField("contact", e.target.value)}
          fullWidth
          margin="normal"
        />

        {type === "supply" && (
          <>
            <Typography variant="subtitle1" mt={2}>
              Dư thừa:
            </Typography>
            {formData.surplus.map((it, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                alignItems="center"
                mb={1}
              >
                <FormControl fullWidth margin="normal">
                  <InputLabel>Loại</InputLabel>
                  <Select
                    value={it.type || ""}
                    onChange={(e) =>
                      setArrayItem("surplus", i, "type", e.target.value as any)
                    }
                    label="Loại"
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
                  value={it.quantity || 0}
                  onChange={(e) =>
                    setArrayItem(
                      "surplus",
                      i,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  sx={{ width: 150 }}
                />

                <TextField
                  label="Ghi chú"
                  value={it.note || ""}
                  onChange={(e) =>
                    setArrayItem("surplus", i, "note", e.target.value)
                  }
                  fullWidth
                />

                <IconButton onClick={() => removeItem("surplus", i)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addItem("surplus")}>Thêm loại cung cấp</Button>
          </>
        )}

        {type === "need" && (
          <>
            <Typography variant="subtitle1" mt={2}>
              Nhu cầu:
            </Typography>
            {formData.needs.map((it, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                alignItems="center"
                mb={1}
              >
                <FormControl fullWidth margin="normal">
                  <InputLabel>Loại nhu cầu</InputLabel>
                  <Select
                    value={it.type || ""}
                    onChange={(e) =>
                      setArrayItem("needs", i, "type", e.target.value as any)
                    }
                    label="Loại nhu cầu"
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
                  value={it.quantity || 0}
                  onChange={(e) =>
                    setArrayItem(
                      "needs",
                      i,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  sx={{ width: 150 }}
                />

                <TextField
                  label="Ghi chú"
                  value={it.note || ""}
                  onChange={(e) =>
                    setArrayItem("needs", i, "note", e.target.value)
                  }
                  fullWidth
                />

                <IconButton onClick={() => removeItem("needs", i)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addItem("needs")}>Thêm loại nhu cầu</Button>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
