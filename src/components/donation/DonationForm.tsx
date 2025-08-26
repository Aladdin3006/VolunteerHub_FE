import { forwardRef, useRef } from "react";
import {
  Box,
  Button,
  ImageList,
  InputAdornment,
  Stack,
  StackProps,
  TextField,
  Typography,
} from "@mui/material";
import CategorySearchInput from "../utils/CategorySearchInput";
import CategoryTag from "../utils/CategoryTag";
import * as Yup from "yup";
import { useFormik } from "formik";
import ImageUploadPlaceholder from "../utils/ImageUploadPlacehoder";
import ImageUpload from "../utils/ImageUpload";
import {
  IImageViewerDialogRef,
  ImageViewerDialog,
} from "../forum/ImageViewerDialog";
import { ICategory, IMediaFile } from "../campaign/CampaignForm";
import { IDonationDataUpload } from "../../apis/donation";
import { VolunteerActivism } from "@mui/icons-material";

export interface IDonationFormData {
  title: string;
  description: string;
  goalAmount: number;
  thumbnail: IMediaFile;
  images: IMediaFile[];
  tags: ICategory[];
  endDate: number; // Thêm trường này
}

interface IProps extends StackProps {
  type?: "create" | "update";
  defaultData?: IDonationFormData;
  onSubmitForm?: (data: IDonationDataUpload) => Promise<void>;
}

const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_AMOUNT = 10000;
const MAX_IMAGES = 5;

const initialValue: IDonationFormData = {
  title: "",
  description: "",
  goalAmount: MIN_AMOUNT,
  thumbnail: { url: "", type: "image" },
  images: [],
  tags: [],
  endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,   // xoa
};

const validationSchema = Yup.object({
  title: Yup.string().required("Thiếu tên chiến dịch"),
  goalAmount: Yup.number()
    .min(MIN_AMOUNT, "Số tiền không hợp lệ")
    .required("Thiếu số tiền mục tiêu"),
  description: Yup.string().required("Thiếu mô tả chiến dịch"),
  thumbnail: Yup.object({
    url: Yup.string().required("Ảnh là bắt buộc"),
  }),
  tags: Yup.array().min(1, "Vui lòng chọn ít nhất 1 danh mục"),
  images: Yup.array().min(1, "Vui lòng chọn ít nhất 1 ảnh"),
  endDate: Yup.number()                                        //xoa
    .min(Date.now(), "Ngày kết thúc phải ở tương lai")
    .required("Thiếu ngày kết thúc"),
});

export const DonationForm = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { type, defaultData, onSubmitForm, ...rest } = props;
  const imageViewerDialogRef = useRef<IImageViewerDialogRef | null>(null);

  const submit = async (values: IDonationFormData) => {
    if (!onSubmitForm) return;

    const payload: IDonationDataUpload = {
      thumbnail: values.thumbnail.file ?? values.thumbnail.url,
      images: values.images.map((g) => g.file ?? g.url),
      description: values.description,
      title: values.title,
      goalAmount: values.goalAmount,
      tags: values.tags.map((cate) => cate._id),
      endDate: values.endDate,                       //xoa
    };

    await onSubmitForm(payload);
  };

  const formik = useFormik<IDonationFormData>({
    initialValues: defaultData || initialValue,
    enableReinitialize: true, // ← cần thêm
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await submit(values);
      setSubmitting(false);
    },
  });

  const handleThumbnailImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      formik.setFieldValue("thumbnail", {
        ...formik.values.thumbnail,
        url: URL.createObjectURL(file),
        file: file,
      });
    }

    e.target.value = "";
    e.target.files = null;
  };

  const handleThumbnailImageDelete = () => {
    formik.setFieldValue("thumbnail", {
      url: "",
    });
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      if (index != null) {
        formik.setFieldValue(
          "images",
          formik.values.images.map((g, gIndex) => {
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
        formik.setFieldValue("images", [
          ...formik.values.images,
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

  const handleRemoveImage = (index: number) => {
    formik.setFieldValue(
      "images",
      formik.values.images.filter((_, arrIndex) => arrIndex !== index)
    );
  };

  const handleChangeCategory = (value: ICategory | null) => {
    if (value && !formik.values.tags.find((cate) => cate._id === value._id)) {
      formik.setFieldValue("tags", [...formik.values.tags, value]);
    }
  };

  const handleDeleteCategory = (value: ICategory) => {
    formik.setFieldValue(
      "tags",
      formik.values.tags.filter((cate) => cate._id !== value._id)
    );
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
          Chiến dịch quyên góp
        </Typography>
        <Stack spacing={2} className="form-body">
          <TextField
            label="Tên chiến dịch"
            name="title"
            fullWidth
            value={formik.values.title}
            inputProps={{ maxLength: MAX_NAME_LENGTH }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.touched.title && !!formik.errors.title}
            helperText={(formik.touched.title && formik.errors.title) || " "}
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

          <TextField
            label="Mục tiêu quyên góp"
            name="goalAmount"
            fullWidth
            type="number"
            value={formik.values.goalAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.touched.goalAmount && !!formik.errors.goalAmount}
            helperText={
              (formik.touched.goalAmount && formik.errors.goalAmount) || " "
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
              inputMode: "numeric",
              sx: {
                input: {
                  textAlign: "right",
                  "&::-webkit-outer-spin-button": { display: "none" },
                  "&::-webkit-inner-spin-button": { display: "none" },
                  MozAppearance: "textfield",
                },
              },
            }}
            inputProps={{
              min: MIN_AMOUNT,
              step: 1,
            }}
          />

          <TextField             /// xoa
            label="Ngày kết thúc"
            name="endDate"
            fullWidth
            type="date"
            value={new Date(formik.values.endDate).toISOString().split("T")[0]} // Chuyển timestamp thành định dạng YYYY-MM-DD
            onChange={(e) => {
              formik.setFieldValue("endDate", new Date(e.target.value).getTime());
            }}
            onBlur={formik.handleBlur}
            error={!!formik.touched.endDate && !!formik.errors.endDate}
            helperText={(formik.touched.endDate && formik.errors.endDate) || " "}
            InputLabelProps={{
              shrink: true, // Đảm bảo label không bị che khuất
            }}
          />

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
              {values.tags.map((cate) => {
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
              {(formik.errors.tags && String(formik.errors.tags)) || " "}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1">Ảnh thumbnail</Typography>
            <ImageList
              cols={1}
              sx={{
                width: "100%",
                m: 0,
              }}
            >
              {formik.values.thumbnail?.url && (
                <ImageUpload
                  url={formik.values.thumbnail?.url}
                  onChange={handleThumbnailImageChange}
                  onView={() => {
                    imageViewerDialogRef.current?.open(
                      [formik.values.thumbnail?.url],
                      0
                    );
                  }}
                  onDelete={handleThumbnailImageDelete}
                />
              )}

              {!formik.values.thumbnail?.url && (
                <ImageUploadPlaceholder onChange={handleThumbnailImageChange} />
              )}
            </ImageList>

            <Typography color="error" fontSize="0.8rem">
              {formik.errors.thumbnail?.url || " "}
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
              {formik.values.images.map(({ url }, index) => {
                return (
                  <ImageUpload
                    key={index}
                    url={url}
                    onChange={(e) => handleImageChange(e, index)}
                    onView={() => {
                      imageViewerDialogRef.current?.open(
                        formik.values.images.map((g) => g.url),
                        index
                      );
                    }}
                    onDelete={() => handleRemoveImage(index)}
                  />
                );
              })}

              {formik.values.images.length < MAX_IMAGES && (
                <ImageUploadPlaceholder onChange={handleImageChange} />
              )}
            </ImageList>

            <Typography color="error" fontSize="0.8rem">
              {(formik.errors.images && String(formik.errors.images)) || " "}
            </Typography>
          </Box>
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
    </Stack>
  );
});
