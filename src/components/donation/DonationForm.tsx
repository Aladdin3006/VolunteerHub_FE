import { forwardRef, useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  StackProps,
  TextField,
  Typography,
} from "@mui/material";
import { Edit } from "lucide-react";
import DotDivider from "../utils/DotDivider";
import { PhotoCamera, VolunteerActivism } from "@mui/icons-material";
import MediaSlider from "../utils/MediaSlider";
import CategorySearchInput from "../utils/CategorySearchInput";
import CategoryTag from "../utils/CategoryTag";
import { ICategory } from "../../apis/campaign-new";
import { IMediaFile } from "../campaign/CampaignForm";
import { IDonationDataUpload } from "../../apis/donation";

export interface IDonationFormData {
  title: string;
  description: string;
  goalAmount: number;
  thumbnail: IMediaFile;
  images: IMediaFile[];
  categories: ICategory[];
}

interface IProps extends StackProps {
  type?: "create" | "update";
  defaultData?: IDonationFormData;
  onSubmitForm?: (data: IDonationDataUpload) => void;
}

const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_AMOUNT = 1000000;
const MAX_AMOUNT = Number.MAX_SAFE_INTEGER;
const MAX_IMAGES = 10;

const DEFAULT_CAMPAIGN_IMG = "/campaign-banner.jpg";

export const DonationForm = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { type, defaultData, onSubmitForm, ...rest } = props;

  const [form, setForm] = useState<IDonationFormData>(
    defaultData || {
      thumbnail: {
        type: "image",
        url: DEFAULT_CAMPAIGN_IMG,
      },
      categories: [],
      description: "",
      images: [],
      title: "",
      goalAmount: 1000000,
    }
  );

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setForm({
        ...form,
        thumbnail: {
          ...form.thumbnail,
          url: URL.createObjectURL(file),
          file: file,
        },
      });
    }

    // Update images, but limit to max images
    e.target.value = "";
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setForm({
        ...form,
        images: [
          ...form.images,
          {
            url: URL.createObjectURL(file),
            file: file,
            type: "image",
          },
        ],
      });
    }

    // Update images, but limit to max images
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setForm({
      ...form,
      images: form.images.filter((_, arrIndex) => arrIndex !== index),
    });
  };

  const isSubmitDisabled = useMemo(() => {
    return !form.title.trim() || !form.description.trim();
  }, [form]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value);

  const handleGoalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "");
    const numericValue = parseInt(raw || "0", 10);

    if (!isNaN(numericValue)) {
      setForm({
        ...form,
        goalAmount: numericValue,
      });
    }
  };

  const handleGoalAmountBlur = () => {
    const clamped = Math.min(Math.max(form.goalAmount, MIN_AMOUNT), MAX_AMOUNT);

    if (clamped !== form.goalAmount) {
      setForm({
        ...form,
        goalAmount: clamped,
      });
    }
  };

  const handleChangeCategory = (value: ICategory | null) => {
    if (value && !form.categories.find((cate) => cate._id === value._id)) {
      setForm({
        ...form,
        categories: [...form.categories, value],
      });
    }
  };

  const handleDeleteCategory = (value: ICategory) => {
    setForm({
      ...form,
      categories: form.categories.filter((cate) => cate._id !== value._id),
    });
  };

  const submit = () => {
    onSubmitForm &&
      onSubmitForm({
        thumbnail: form.thumbnail.file ?? form.thumbnail.url,
        categories: form.categories.map((cate) => cate._id),
        description: form.description,
        images: form.images.map((g) => g.file ?? g.url),
        title: form.title,
        goalAmount: form.goalAmount,
      });
  };

  return (
    <Stack
      ref={ref}
      direction={"column"}
      gap={0.5}
      borderRadius={"8px"}
      {...rest}
      sx={{
        pb: "5px",
        color: "#080809",
        ...rest.sx,
      }}
    >
      {/* Banner */}
      <Box
        sx={{
          height: ["550px", "600px"],
          backgroundColor: "#2e4049",
          backgroundImage: `url(${form.thumbnail.url})`,
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        {/* Title area */}
        <Stack
          direction={"column"}
          sx={{
            width: ["100%", "500px", "600px"],
            height: "100%",
            overflowY: "auto",
            justifyContent: "center",
            px: 5,
            background: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))`,
          }}
          boxShadow={1}
        >
          <Typography
            sx={{
              textTransform: "capitalize",
              color: "white",
              fontFamily: "Papyrus, fantasy",
              fontSize: "1.8em",
            }}
          >
            Hãy chung tay quyên góp...
          </Typography>
          <TextField
            placeholder={`Tiêu đề của chiến dịch là gì?`}
            multiline
            fullWidth
            minRows={2}
            maxRows={8}
            variant="standard"
            value={form.title}
            spellCheck={false}
            onChange={(e) => {
              const cleanedValue = e.target.value.replace(/[\r\n]+/g, " ");
              if (cleanedValue.length <= MAX_NAME_LENGTH) {
                setForm({
                  ...form,
                  title: cleanedValue,
                });
              }
            }}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: "2em",
                backgroundColor: "transparent",
                p: 0,
                color: "white",
                fontFamily: "Verdana, Geneva, sans-serif",
                fontWeight: 800,
                lineHeight: 1.2,
              },
            }}
            sx={{
              mb: 0,
              mt: 1,
              ".MuiInputBase-input": {
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
              },
            }}
          />

          {/* Goat amount */}
          <Stack
            direction={"row"}
            style={{ color: "white" }}
            my={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Typography
              sx={{
                textTransform: "capitalize",
                color: "white",
                fontFamily: "Verdana, Geneva, sans-serif",
                fontSize: "1.5em",
                fontWeight: 700,
              }}
            >
              Mục tiêu:
            </Typography>

            <TextField
              variant="standard"
              value={formatNumber(form.goalAmount)}
              onChange={handleGoalAmountChange}
              onBlur={handleGoalAmountBlur}
              type="text"
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <span
                      style={{
                        color: "white",
                        fontSize: "1.2em",
                        textAlign: "end",
                        fontFamily: "Verdana, Geneva, sans-serif",
                      }}
                    >
                      VNĐ
                    </span>
                  </InputAdornment>
                ),
                sx: {
                  color: "white",
                  backgroundColor: "transparent",
                  border: "none",
                  px: 0,
                  py: 0,
                },
              }}
              inputProps={{
                style: {
                  color: "yellow",
                  textAlign: "right",
                  appearance: "textfield", // Firefox
                  fontSize: "1.5em",
                  fontFamily: "Verdana, Geneva, sans-serif",
                },
              }}
              sx={{
                backgroundColor: "transparent",
                "& .MuiInputBase-root": {
                  backgroundColor: "transparent",
                },
                width: "250px",
              }}
            />
          </Stack>

          <DotDivider label="HELP US" />
          {/* Change banner button area */}
          <Button
            component="label"
            color="primary"
            startIcon={<Edit />}
            variant="contained"
            sx={{ borderRadius: 8, width: 200 }}
          >
            SỬA ẢNH
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleBannerImageChange}
            />
          </Button>
        </Stack>
      </Box>

      {/* Tags and Images */}
      <Stack
        direction={"column"}
        sx={{
          transform: "translateY(-25%)",
        }}
      >
        {/* Images slider */}
        {form.images.length > 0 && (
          <Box sx={{ height: "300px" }}>
            <MediaSlider
              items={form.images}
              visibleCount={3}
              onDelete={handleRemoveImage}
            />
          </Box>
        )}
        {/* Add Gallery photos and Tags */}
        <Stack direction="row" spacing={1} justifyContent="center" mt={5}>
          <Button
            component="label"
            startIcon={<PhotoCamera />}
            variant="outlined"
            sx={{ borderRadius: 8, width: "200px" }}
            disabled={form.images.length >= 10}
          >
            ẢNH {`${form.images.length}/${MAX_IMAGES}`}
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleGalleryChange}
            />
          </Button>

          <CategorySearchInput
            onChange={handleChangeCategory}
            textfieldSx={{
              width: 200,
              borderRadius: 10,
              "& .MuiOutlinedInput-root": {
                borderRadius: 10,
              },
            }}
            autoCompleteSx={{
              width: "fit-content",
            }}
            suggestText="CHỦ ĐỀ"
          />
        </Stack>

        <Stack
          direction={"row"}
          gap={1}
          justifyContent={"center"}
          mt={2}
          sx={{ flexWrap: "wrap" }}
        >
          {/* Tag list */}
          {form.categories.map((cate) => {
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
      </Stack>

      {/* Content */}
      <Stack alignItems={"center"}>
        {/* Description */}
        <Stack
          px={1}
          py={3}
          sx={{
            color: "black",
            width: ["100%", "600px", "950px"],
            borderRadius: 3,
          }}
          direction={"column"}
          boxShadow={1}
        >
          <Typography
            sx={{
              textTransform: "capitalize",
              fontFamily: '"Verdana", sans-serif',
              fontSize: "1.5em",
            }}
          >
            Thông tin chiến dịch
          </Typography>
          <Stack mt={1}>
            <TextField
              placeholder={`Mô tả nội dung chiến dịch...`}
              multiline
              fullWidth
              minRows={10}
              maxRows={50}
              variant="standard"
              value={form.description}
              spellCheck={false}
              onChange={(e) => {
                const cleanedValue = e.target.value;
                if (cleanedValue.length <= MAX_DESCRIPTION_LENGTH) {
                  setForm({
                    ...form,
                    description: cleanedValue,
                  });
                }
              }}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "1em",
                  backgroundColor: "transparent",
                  p: 1,
                  fontFamily: '"Shippori Mincho", sans-serif',
                  lineHeight: 1.2,
                },
              }}
              sx={{
                mb: 0,
                ".MuiInputBase-input": {
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#ccc",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                  },
                },
              }}
            />
            <Typography
              align="right"
              color="text.secondary"
              fontSize={12}
              pr={1}
            >
              {form.description.length}/{MAX_DESCRIPTION_LENGTH}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Footer */}
      <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
        <Button
          component="label"
          variant="contained"
          startIcon={<VolunteerActivism />}
          onClick={submit}
          disabled={!onSubmitForm || isSubmitDisabled}
          sx={{
            width: { xs: "100%", sm: "300px" },
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
          }}
        >
          Tạo chiến dịch ngay bây giờ
        </Button>
      </Stack>
    </Stack>
  );
});
