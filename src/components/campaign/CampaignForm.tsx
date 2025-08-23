import { forwardRef, useRef, useState } from "react";
import {
  Box,
  Button,
  ImageList,
  Stack,
  StackProps,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CategorySearchInput from "../utils/CategorySearchInput";
import CategoryTag from "../utils/CategoryTag";
import { ICampaignDataUpload, IPhaseData } from "../../apis/campaign";
import * as Yup from "yup";
import { useFormik } from "formik";
import ImageUploadPlaceholder from "../utils/ImageUploadPlacehoder";
import ImageUpload from "../utils/ImageUpload";
import {
  IImageViewerDialogRef,
  ImageViewerDialog,
} from "../forum/ImageViewerDialog";
import MapLocationPicker from "../utils/MapLocationPicker";
import {
  IUpdatePhasesDialogRef,
  UpdatePhasesDialog,
} from "../phase/UpdatePhasesDialog";
import axios from "axios";

export interface IMediaFile {
  type: "image";
  file?: File;
  url: string;
  content?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface ICampaignFormData {
  name: string;
  description: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  startDate: Date;
  endDate: Date;
  campaignImg: IMediaFile;
  gallery: IMediaFile[];
  categories: ICategory[];
}

interface IProps extends StackProps {
  type?: "create" | "update";
  defaultData?: ICampaignFormData;
  onSubmitForm?: (data: ICampaignDataUpload) => Promise<void>;
  hideLocationSection?: boolean;
}

const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

const getDefaultStartDate = () => {
  const result = new Date();
  result.setHours(0, 0, 0, 0);
  return result;
};

const getDefaultEndDate = () => {
  const result = getDefaultStartDate();
  result.setDate(result.getDate() + 7);
  return result;
};

const initialValue: ICampaignFormData = {
  name: "",
  description: "",
  location: {
    coordinates: [21.028511, 105.804817],
    address: "",
  },
  startDate: getDefaultStartDate(),
  endDate: getDefaultEndDate(),
  campaignImg: { url: "", type: "image" },
  gallery: [],
  categories: [],
};

export const CampaignForm = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { type, defaultData, onSubmitForm, hideLocationSection = false, ...rest } = props;
  const imageViewerDialogRef = useRef<IImageViewerDialogRef | null>(null);
  const updatePhasesDialogRef = useRef<IUpdatePhasesDialogRef | null>(null);

  const validationSchema = Yup.object({
    name: Yup.string().required("Thiếu tên chiến dịch"),
    description: Yup.string().required("Thiếu mô tả chiến dịch"),
    location: hideLocationSection
      ? Yup.mixed().notRequired()
      : Yup.object({
          address: Yup.string().required("Thiếu địa chỉ chiến dịch"),
        }),
    startDate: Yup.date().required("Thiếu thời điểm bắt đầu"),
    endDate: Yup.date()
      .required("Thiếu thời điểm kết thúc")
      .min(Yup.ref("startDate"), "Ngày kết thúc đang nhỏ hơn ngày bắt đầu"),
    campaignImg: Yup.object({
      url: Yup.string().required("Ảnh là bắt buộc"),
    }),
    categories: Yup.array().min(1, "Vui lòng chọn ít nhất 1 danh mục"),
    gallery: Yup.array().min(1, "Vui lòng chọn ít nhất 1 ảnh"),
  });

  const submit = async (values: ICampaignFormData) => {
    if (onSubmitForm) {
      await onSubmitForm({
        campaignImg: values.campaignImg.file ?? values.campaignImg.url,
        categories: values.categories.map((c) => c._id),
        description: values.description,
        endDate: values.endDate.toISOString(),
        startDate: values.startDate.toISOString(),
        gallery: values.gallery.map((g) => g.file ?? g.url),
        location: values.location,
        name: values.name,
      });
    }
  };

  const formik = useFormik<ICampaignFormData>({
    initialValues: defaultData || initialValue,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await submit(values);
      setSubmitting(false);
    },
  });

  const values = formik.values;

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("campaignImg", {
        url: URL.createObjectURL(file),
        file,
        type: "image",
      });
    }
    e.target.value = "";
  };

  const handleBannerImageDelete = () => {
    formik.setFieldValue("campaignImg", { url: "", type: "image" });
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      if (index != null) {
        formik.setFieldValue(
          "gallery",
          formik.values.gallery.map((g, gIndex) =>
            gIndex === index ? { url: URL.createObjectURL(file), file, type: "image" } : g
          )
        );
      } else {
        formik.setFieldValue("gallery", [
          ...formik.values.gallery,
          { url: URL.createObjectURL(file), file, type: "image" },
        ]);
      }
    }
    e.target.value = "";
  };

  const handleRemoveGalleryImage = (index: number) => {
    formik.setFieldValue(
      "gallery",
      formik.values.gallery.filter((_, i) => i !== index)
    );
  };

  const handleChangeCategory = (value: ICategory | null) => {
    if (value && !formik.values.categories.find((c) => c._id === value._id)) {
      formik.setFieldValue("categories", [...formik.values.categories, value]);
    }
  };

  const handleDeleteCategory = (value: ICategory) => {
    formik.setFieldValue(
      "categories",
      formik.values.categories.filter((c) => c._id !== value._id)
    );
  };

  const handleUpdatePhases = (phases: IPhaseData[]) => {
    formik.setFieldValue("phases", phases);
  };

  const typingRef = useRef<any>(null);
  const [addrSuggests, setAddrSuggests] = useState<any[]>([]);
  const [centerForMap, setCenterForMap] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <Stack
      ref={ref}
      direction="column"
      gap={0.5}
      borderRadius="8px"
      {...rest}
      sx={{
        p: 2,
        color: "#080809",
        ...rest.sx,
        backgroundColor: "white",
      }}
    >
      <form onSubmit={formik.handleSubmit} className="form">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mb: 5 }}
          className="form-title"
        >
          Chiến dịch tình nguyện
        </Typography>

        <Stack spacing={2} className="form-body">
          <TextField
            label="Tên chiến dịch"
            name="name"
            fullWidth
            value={formik.values.name}
            inputProps={{ maxLength: MAX_NAME_LENGTH }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.touched.name && !!formik.errors.name}
            helperText={(formik.touched.name && formik.errors.name) || " "}
          />

          <TextField
            label="Mô tả"
            name="description"
            multiline
            minRows={5}
            fullWidth
            value={formik.values.description}
            inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.touched.description && !!formik.errors.description}
            helperText={(formik.touched.description && formik.errors.description) || " "}
          />

          <Box display="flex" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={dayjs(values.startDate)}
                format="YYYY/MM/DD HH:mm"
                onChange={(v) => formik.setFieldValue("startDate", v?.toDate())}
                slotProps={{
                  textField: {
                    label: "Bắt đầu",
                    error: !!formik.errors.startDate,
                    helperText: formik.errors.startDate?.toString() || " ",
                  },
                }}
              />
              <DateTimePicker
                value={dayjs(values.endDate)}
                format="YYYY/MM/DD HH:mm"
                onChange={(v) => formik.setFieldValue("endDate", v?.toDate())}
                slotProps={{
                  textField: {
                    label: "Kết thúc",
                    error: !!formik.errors.endDate,
                    helperText: formik.errors.endDate?.toString() || " ",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {!hideLocationSection && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Vị trí
              </Typography>

              <Box sx={{ position: "relative" }}>
                <TextField
                  label="Địa chỉ"
                  name="location.address"
                  fullWidth
                  value={formik.values.location.address}
                  onChange={(e) => {
                    formik.handleChange(e);
                    const val = e.target.value;
                    if (typingRef.current) clearTimeout(typingRef.current);
                    typingRef.current = setTimeout(async () => {
                      if (val && val.length > 2) {
                        try {
                          const res = await axios.get(
                            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&accept-language=vi&q=${encodeURIComponent(
                              val
                            )}`
                          );
                          setAddrSuggests(res.data);
                        } catch {
                          setAddrSuggests([]);
                        }
                      } else {
                        setAddrSuggests([]);
                      }
                    }, 400);
                  }}
                  onBlur={formik.handleBlur}
                  error={!!formik.errors.location?.address}
                  helperText={formik.errors.location?.address?.toString() || " "}
                />

                {addrSuggests.length > 0 && (
                  <List
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      bgcolor: "white",
                      border: "1px solid #ddd",
                      zIndex: 9999,
                      maxHeight: 220,
                      overflowY: "auto",
                    }}
                  >
                    {addrSuggests.map((s, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            const lat = parseFloat(s.lat);
                            const lng = parseFloat(s.lon);
                            formik.setFieldValue("location", {
                              coordinates: [lat, lng],
                              address: s.display_name,
                            });
                            setCenterForMap({ lat, lng });
                            setAddrSuggests([]);
                          }}
                        >
                          {s.display_name}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>

              <MapLocationPicker
                mapHeight="300px"
                defaultLocation={{
                  lat: values.location.coordinates[0],
                  lng: values.location.coordinates[1],
                }}
                hideSearchInput
                center={centerForMap}
                onPick={(c) => {
                  formik.setFieldValue("location", {
                    coordinates: [c.lat, c.lng],
                    address: c.address ?? formik.values.location.address,
                  });
                }}
              />
            </Box>
          )}

          <Box>
            <Typography variant="subtitle1">Chủ đề</Typography>
            <CategorySearchInput onChange={handleChangeCategory} suggestText="Tìm kiếm" />
            <Stack direction="row" gap={1} mt={2} flexWrap="wrap">
              {values.categories.map((c) => (
                <CategoryTag
                  key={c._id}
                  name={c.name}
                  tagColor={c.color}
                  icon={c.icon}
                  onDelete={() => handleDeleteCategory(c)}
                />
              ))}
            </Stack>
            <Typography color="error" fontSize="0.8rem">
              {formik.errors.categories?.toString() || " "}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1">Ảnh banner</Typography>
            <ImageList cols={1} sx={{ width: "100%", m: 0 }}>
              {formik.values.campaignImg?.url ? (
                <ImageUpload
                  url={formik.values.campaignImg.url}
                  onChange={handleBannerImageChange}
                  onView={() =>
                    imageViewerDialogRef.current?.open(
                      [formik.values.campaignImg.url],
                      0
                    )
                  }
                  onDelete={handleBannerImageDelete}
                />
              ) : (
                <ImageUploadPlaceholder onChange={handleBannerImageChange} />
              )}
            </ImageList>
            <Typography color="error" fontSize="0.8rem">
              {formik.errors.campaignImg?.url || " "}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Thư viện ảnh
            </Typography>
            <ImageList cols={2} sx={{ width: "100%", m: 0, gap: 1 }}>
              {formik.values.gallery.map((g, idx) => (
                <ImageUpload
                  key={idx}
                  url={g.url}
                  onChange={(e) => handleGalleryChange(e, idx)}
                  onDelete={() => handleRemoveGalleryImage(idx)}
                  onView={() =>
                    imageViewerDialogRef.current?.open(
                      formik.values.gallery.map((x) => x.url),
                      idx
                    )
                  }
                />
              ))}
              <ImageUploadPlaceholder onChange={(e) => handleGalleryChange(e)} />
            </ImageList>
            <Typography color="error" fontSize="0.8rem">
              {formik.errors.gallery?.toString() || " "}
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="flex-end" gap={1} mt={1}>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {type === "update" ? "Cập nhật chiến dịch" : "Tạo chiến dịch"}
            </Button>
          </Stack>
        </Stack>
      </form>

      <ImageViewerDialog ref={imageViewerDialogRef} />
      <UpdatePhasesDialog ref={updatePhasesDialogRef} onUpdate={handleUpdatePhases} />
    </Stack>
  );
});
