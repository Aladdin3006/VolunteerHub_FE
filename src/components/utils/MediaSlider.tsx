import Slider, { Settings } from "react-slick";
import { Box, BoxProps, IconButton } from "@mui/material";
import {
  ArrowBackIos,
  ArrowForwardIos,
  Delete,
  Visibility,
} from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export interface ISlideItem {
  url: string;
  type: "image";
}

const DEFAULT_VISIBLE_COUNT = 3;

interface IProps extends BoxProps {
  items: ISlideItem[];
  visibleCount?: number;
  onView?: (index: number, item: ISlideItem, items: ISlideItem[]) => void;
  onDelete?: (index: number, item: ISlideItem, items: ISlideItem[]) => void;
}

export default function MediaSlider(props: IProps) {
  const { items, visibleCount, onView, onDelete, ...rest } = props;

  const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: visibleCount || DEFAULT_VISIBLE_COUNT,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <ArrowForwardIos sx={{ color: "#000" }} />,
    prevArrow: <ArrowBackIos sx={{ color: "#000" }} />,
  };

  return (
    <Box
      {...rest}
      sx={{
        position: "relative",
        height: "100%",
        px: 5,
        ...rest.sx,
        "& .slick-slider, & .slick-list, & .slick-track": {
          height: "100%",
          ".slick-slide>div": {
            height: "100%",
          },
        },
      }}
    >
      <Slider {...settings}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              px: 0.5,
              position: "relative",
              height: "100%",
            }}
            className="Rootsjhfdhjk"
          >
            <Box
              sx={{
                position: "relative",
                height: "100%",
                overflow: "hidden",
                borderRadius: 2,
                "&:hover .overlay": {
                  opacity: 1,
                },
              }}
            >
              <img
                src={item.url}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                  display: "block",
                }}
              />
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                {onView && (
                  <IconButton
                    onClick={() => onView(index, item, items)}
                    sx={{
                      color: "white",
                    }}
                  >
                    <Visibility />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton
                    onClick={() => onDelete(index, item, items)}
                    sx={{
                      color: "white",
                    }}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}
