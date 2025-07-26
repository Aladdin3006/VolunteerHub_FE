import { forwardRef, useRef } from "react";
import {
  Box,
  Button,
  ImageList,
  Stack,
  StackProps,
  TextField,
  Typography,
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
import { VolunteerActivism } from "@mui/icons-material";
import {
  IUpdatePhasesDialogRef,
  UpdatePhasesDialog,
} from "../phase/UpdatePhasesDialog";

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
    // [lat, lng]
    coordinates: [number, number];
    address: string;
  };
  startDate: Date;
  endDate: Date;
  campaignImg: IMediaFile;
  gallery: IMediaFile[];
  categories: ICategory[];
  // phases: IPhaseData[];
}

interface IProps extends StackProps {
  type?: "create" | "update";
  defaultData?: ICampaignFormData;
  onSubmitForm?: (data: ICampaignDataUpload) => Promise<void>;
}

const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_IMAGES = 5;

const getDefaultStartDate = () => {
  const result = new Date();
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
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

const validationSchema = Yup.object({
  name: Yup.string().required("Thiếu tên chiến dịch"),
  description: Yup.string().required("Thiếu mô tả chiến dịch"),
  location: Yup.object({
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

export const CampaignForm = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { type, defaultData, onSubmitForm, ...rest } = props;
  const imageViewerDialogRef = useRef<IImageViewerDialogRef | null>(null);
  const updatePhasesDialogRef = useRef<IUpdatePhasesDialogRef | null>(null);

  const submit = async (values: ICampaignFormData) => {
    if (onSubmitForm) {
      await onSubmitForm({
        campaignImg: values.campaignImg.file ?? values.campaignImg.url,
        categories: values.categories.map((cate) => cate._id),
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

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      formik.setFieldValue("campaignImg", {
        ...formik.values.campaignImg,
        url: URL.createObjectURL(file),
        file: file,
      });
    }

    e.target.value = "";
    e.target.files = null;
  };

  const handleBannerImageDelete = () => {
    formik.setFieldValue("campaignImg", {
      url: "",
    });
  };

  const handleGalleryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      if (index != null) {
        formik.setFieldValue(
          "gallery",
          formik.values.gallery.map((g, gIndex) => {
            if (index === gIndex) {
              return {
                url: URL.createObjectURL(file),
                file: file,
                type: "image",
              };
            } else {
              return g;
            }
          })
        );
      } else {
        formik.setFieldValue("gallery", [
          ...formik.values.gallery,
          {
            url: URL.createObjectURL(file),
            file: file,
            type: "image",
          },
        ]);
      }
    }

    e.target.value = "";
    e.target.files = null;
  };

  const handleRemoveGalleryImage = (index: number) => {
    formik.setFieldValue(
      "gallery",
      formik.values.gallery.filter((_, arrIndex) => arrIndex !== index)
    );
  };

  const handleChangeCategory = (value: ICategory | null) => {
    if (
      value &&
      !formik.values.categories.find((cate) => cate._id === value._id)
    ) {
      formik.setFieldValue("categories", [...formik.values.categories, value]);
    }
  };

  const handleDeleteCategory = (value: ICategory) => {
    formik.setFieldValue(
      "categories",
      formik.values.categories.filter((cate) => cate._id !== value._id)
    );
  };

  const handleUpdatePhases = (phases: IPhaseData[]) => {
    formik.setFieldValue("phases", phases);
  };

  const values = formik.values;

  return (
    <Stack
      ref={ref}
      direction={"column"}
      gap={0.5}
      borderRadius={"8px"}
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
            helperText={
              (formik.touched.description && formik.errors.description) || " "
            }
          />

          <Box display="flex" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={dayjs(values.startDate)}
                format="YYYY/MM/DD HH:mm"
                name="startDate"
                onChange={(value) => {
                  formik.setFieldValue("startDate", value?.toDate());
                }}
                slotProps={{
                  textField: {
                    name: "startDate",
                    id: "startDate",
                    onBlur: formik.handleBlur,
                    label: "Bắt đầu",
                    error:
                      formik.touched.startDate &&
                      Boolean(formik.errors.startDate),
                    helperText:
                      (formik.touched.startDate &&
                        formik.errors.startDate &&
                        String(formik.errors.startDate)) ||
                      " ",
                  },
                }}
              />
              <DateTimePicker
                value={dayjs(values.endDate)}
                format="YYYY/MM/DD HH:mm"
                name="endDate"
                onChange={(value) => {
                  formik.setFieldValue("endDate", value?.toDate());
                }}
                slotProps={{
                  textField: {
                    name: "endDate",
                    id: "endDate",
                    onBlur: formik.handleBlur,
                    label: "Kết thúc",
                    error:
                      formik.touched.endDate && Boolean(formik.errors.endDate),
                    helperText:
                      (formik.touched.endDate &&
                        formik.errors.endDate &&
                        String(formik.errors.endDate)) ||
                      " ",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Vị trí
            </Typography>

            <TextField
              label="Địa chỉ"
              name="location.address"
              fullWidth
              value={formik.values.location.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                !!formik.touched.location?.address &&
                !!formik.errors.location?.address
              }
              helperText={
                (formik.touched.location?.address &&
                  formik.errors.location?.address) ||
                " "
              }
            />

            <MapLocationPicker
              mapHeight="300px"
              defaultLocation={{
                lat: values.location.coordinates[0],
                lng: values.location.coordinates[1],
              }}
              onPick={(coordinates) => {
                formik.setFieldValue("location", {
                  ...values.location,
                  coordinates: [coordinates.lat, coordinates.lng],
                });
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1">Chủ đề</Typography>

            <CategorySearchInput
              onChange={handleChangeCategory}
              suggestText="Tìm kiếm"
            />

            <Stack
              direction={"row"}
              gap={1}
              mt={2}
              sx={{ flexWrap: "wrap" }}
              justifyContent={"left"}
            >
              {/* Tag list */}
              {values.categories.map((cate) => {
                return (
                  <CategoryTag
                    key={cate._id}
                    name={cate.name}
                    tagColor={cate.color}
                    icon={cate.icon}
                    onDelete={() => handleDeleteCategory(cate)}
                  />
                );
              })}
            </Stack>

            <Typography color="error" fontSize="0.8rem">
              {(formik.errors.categories &&
                formik.errors.categories &&
                String(formik.errors.categories)) ||
                " "}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1">Ảnh banner</Typography>
            <ImageList
              cols={1}
              sx={{
                width: "100%",
                m: 0,
              }}
            >
              {formik.values.campaignImg?.url && (
                <ImageUpload
                  url={formik.values.campaignImg?.url}
                  onChange={handleBannerImageChange}
                  onView={() => {
                    imageViewerDialogRef.current?.open(
                      [formik.values.campaignImg?.url],
                      0
                    );
                  }}
                  onDelete={handleBannerImageDelete}
                />
              )}

              {!formik.values.campaignImg?.url && (
                <ImageUploadPlaceholder onChange={handleBannerImageChange} />
              )}
            </ImageList>

            <Typography color="error" fontSize="0.8rem">
              {formik.errors.campaignImg?.url || " "}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1">Ảnh chiến dịch</Typography>
            <ImageList
              cols={2}
              sx={{
                width: "100%",
                m: 0,
              }}
            >
              {formik.values.gallery.map(({ url }, index) => {
                return (
                  <ImageUpload
                    key={index}
                    url={url}
                    onChange={(e) => handleGalleryChange(e, index)}
                    onView={() => {
                      imageViewerDialogRef.current?.open(
                        formik.values.gallery.map((g) => g.url),
                        index
                      );
                    }}
                    onDelete={() => handleRemoveGalleryImage(index)}
                  />
                );
              })}

              {formik.values.gallery.length < MAX_IMAGES && (
                <ImageUploadPlaceholder onChange={handleGalleryChange} />
              )}
            </ImageList>

            <Typography color="error" fontSize="0.8rem">
              {(formik.errors.gallery && String(formik.errors.gallery)) || " "}
            </Typography>
          </Box>

          {/* {type === "update" && (
            <Box>
              <Typography variant="subtitle1">Giai đoạn chiến dịch</Typography>
              {values.phases.map((phase) => {
                return (
                  <Accordion key={phase._id} expanded={false}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      onClick={() => {
                        updatePhasesDialogRef.current?.open(values.phases, {
                          defaultExpand: phase._id,
                        });
                      }}
                    >
                      <Typography variant="subtitle1">{phase.name}</Typography>
                    </AccordionSummary>{" "}
                  </Accordion>
                );
              })}
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  updatePhasesDialogRef.current?.open(values.phases, {
                    createNew: true,
                  });
                }}
                sx={{ mt: 2 }}
              >
                Thêm giai đoạn
              </Button>
            </Box>
          )} */}
        </Stack>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!formik.isValid || formik.isSubmitting}
          startIcon={<VolunteerActivism />}
          sx={{
            backgroundColor: "#43a047",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "999px",
            textTransform: "none",
            fontSize: "1rem",
            py: 1.2,
            boxShadow: 3,
            "&:hover": {
              backgroundColor: "#388e3c",
              boxShadow: 4,
            },
            mt: 5,
          }}
          className="form-submit-btn"
        >
          {type === "create" ? "Tạo chiến dịch" : "Cập nhật chiến dịch"}
        </Button>
      </form>
      <ImageViewerDialog ref={imageViewerDialogRef} />
      <UpdatePhasesDialog
        ref={updatePhasesDialogRef}
        onSave={handleUpdatePhases}
      />
    </Stack>
  );
});
