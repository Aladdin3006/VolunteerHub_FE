import { forwardRef, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  StackProps,
  TextField,
  Typography,
} from "@mui/material";
import { Edit } from "lucide-react";
import DotDivider from "../utils/DotDivider";
import { PhotoCamera } from "@mui/icons-material";
import MediaSlider from "../utils/MediaSlider";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CategorySearchInput from "../utils/CategorySearchInput";
import CategoryTag from "../utils/CategoryTag";
import { ICampaignDataUpload } from "../../apis/campaign-new";
import MapLocationPicker from "../utils/MapLocationPicker";

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
}

interface IProps extends StackProps {
  type?: "create" | "update";
  defaultData?: ICampaignFormData;
  onSubmitForm?: (data: ICampaignDataUpload) => void;
}

const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;
const DEFAULT_CAMPAIGN_IMG =
  "https://assets-global.website-files.com/62b2a013e2866c75039c37cb/62b2deb4f1619a0c63a58be3_home-banner.jpg";

export const CampaignForm = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { type, defaultData, onSubmitForm, ...rest } = props;

  const [form, setForm] = useState<ICampaignFormData>(
    defaultData || {
      campaignImg: {
        type: "image",
        url: DEFAULT_CAMPAIGN_IMG,
      },
      categories: [],
      description: "",
      endDate: new Date(),
      gallery: [],
      location: {
        address: "",
        coordinates: [21.0285, 105.8542],
      },
      name: "",
      startDate: new Date(),
    }
  );

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setForm({
        ...form,
        campaignImg: {
          ...form.campaignImg,
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
        gallery: [
          ...form.gallery,
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

  const handleRemoveGalleryImage = (index: number) => {
    setForm({
      ...form,
      gallery: form.gallery.filter((_, arrIndex) => arrIndex !== index),
    });
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.location.address.trim()
    );
  }, [form]);

  const submit = () => {
    onSubmitForm &&
      onSubmitForm({
        campaignImg: form.campaignImg.file ?? form.campaignImg.url,
        categories: form.categories.map((cate) => cate._id),
        description: form.description,
        endDate: form.endDate.toISOString(),
        startDate: form.startDate.toISOString(),
        gallery: form.gallery.map((g) => g.file ?? form.campaignImg.url),
        location: form.location,
        name: form.name,
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
          backgroundImage: `url(${form.campaignImg.url})`,
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
            width: ["100%", "450px", "600px"],
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
              fontFamily: '"Georgia", sans-serif',
              fontSize: "1.5em",
            }}
          >
            We need your help...
          </Typography>
          <TextField
            placeholder={`What's the title of campaign?`}
            multiline
            fullWidth
            minRows={2}
            maxRows={8}
            variant="standard"
            value={form.name}
            onChange={(e) => {
              const cleanedValue = e.target.value.replace(/[\r\n]+/g, " ");
              if (cleanedValue.length <= MAX_NAME_LENGTH) {
                setForm({
                  ...form,
                  name: cleanedValue,
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
                fontFamily: '"Shippori Mincho", sans-serif',
                fontWeight: 800,
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

          <DotDivider label="HELP US" />
          {/* Change banner button area */}
          <Button
            component="label"
            color="primary"
            startIcon={<Edit />}
            variant="contained"
            sx={{ borderRadius: 8, width: 200 }}
          >
            Edit banner
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
        {/* Gallery slider */}
        {form.gallery.length > 0 && (
          <Box sx={{ height: "300px" }}>
            <MediaSlider
              items={form.gallery}
              visibleCount={3}
              onDelete={handleRemoveGalleryImage}
            />
          </Box>
        )}
        {/* Add Gallery photos and Tags */}
        <Stack direction="row" spacing={1} justifyContent="center" mt={5}>
          <Button
            component="label"
            startIcon={<PhotoCamera />}
            variant="outlined"
            sx={{ borderRadius: 8, width: { xs: "100%", sm: "150px" } }}
          >
            Add Photo
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleGalleryChange}
            />
          </Button>

          <CategorySearchInput
            onChange={(value) => {
              if (value) {
                setForm({
                  ...form,
                  categories: [...form.categories, value],
                });
              }
            }}
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
            suggestText="ADD TAG"
          />
        </Stack>

        <Stack direction={"column"} gap={1}>
          {/* Tag list */}
          {form.categories.map((cate) => {
            return (
              <CategoryTag
                key={cate._id}
                name={cate.name}
                tagColor={cate.color}
                icon={cate.icon}
                onDelete={() => {}}
              />
            );
          })}
        </Stack>
      </Stack>

      <Divider variant="middle" />
      {/* Content */}
      <Box px={[1, "50px", "100px", "200px"]}>
        {/* Start date, End date and description */}
        <Stack sx={{ color: "black" }}>
          <Stack direction={"column"} gap={1}>
            <Typography
              sx={{
                textTransform: "capitalize",
                fontFamily: '"Georgia", sans-serif',
                fontSize: "1.5em",
              }}
            >
              What's about?
            </Typography>
            <Stack direction={"row"} gap={1} px={1}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={dayjs(form.startDate)}
                  onChange={(value) => {
                    if (value) {
                      setForm({
                        ...form,
                        startDate: value?.toDate(),
                      });
                    }
                  }}
                  slotProps={{
                    textField: {
                      variant: "standard",
                      InputProps: {
                        disableUnderline: true,
                        sx: {
                          bgcolor: "transparent",
                          border: "none",
                          px: 1,
                        },
                      },
                      InputLabelProps: {
                        sx: {
                          color: "text.secondary",
                        },
                      },
                    },
                  }}
                />
                <DatePicker
                  label="To"
                  value={dayjs(form.endDate)}
                  onChange={(value) => {
                    if (value) {
                      setForm({
                        ...form,
                        endDate: value?.toDate(),
                      });
                    }
                  }}
                  slotProps={{
                    textField: {
                      variant: "standard",
                      InputProps: {
                        disableUnderline: true,
                        sx: {
                          bgcolor: "transparent",
                          border: "none",
                          px: 1,
                        },
                      },
                      InputLabelProps: {
                        sx: {
                          color: "text.secondary",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Stack>
          </Stack>
          <Stack pt={1}>
            {/* <Typography
            sx={{
              textTransform: "capitalize",
              fontFamily: '"Georgia", sans-serif',
              fontSize: "1.5em",
            }}
          >
            What about Campaign?
          </Typography> */}
            <TextField
              placeholder={`Describe the campaign?`}
              multiline
              fullWidth
              minRows={10}
              maxRows={50}
              variant="standard"
              value={form.description}
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

        <Divider variant="middle" />

        {/* Location */}
        <Stack direction={"column"} py={1}>
          <Typography
            sx={{
              textTransform: "capitalize",
              fontFamily: '"Georgia", sans-serif',
              fontSize: "1.5em",
            }}
          >
            What's location?
          </Typography>
          <TextField
            placeholder={`Describe the location?`}
            fullWidth
            variant="standard"
            value={form.location.address}
            onChange={(e) => {
              setForm({
                ...form,
                location: {
                  ...form.location,
                  address: e.target.value,
                },
              });
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

          <MapLocationPicker
            mapHeight="400px"
            defaultLocation={{
              lat: form.location.coordinates[0],
              lng: form.location.coordinates[1],
            }}
            onPick={(coordinates) => {
              setForm({
                ...form,
                location: {
                  ...form.location,
                  coordinates: [coordinates.lat, coordinates.lng],
                },
              });
            }}
          />
        </Stack>
      </Box>

      <Divider />
      {/* Footer */}
      <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
        <Button
          component="label"
          variant="contained"
          sx={{ width: { xs: "100%", sm: "250px" } }}
          disabled={!onSubmitForm || isSubmitDisabled}
          onClick={submit}
        >
          Add campaign now
        </Button>
      </Stack>
    </Stack>
  );
});
