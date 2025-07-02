import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { Tag } from "@mui/icons-material";

interface IProps extends Omit<ChipProps, "icon"> {
  tagColor?: string;
  name: string;
  icon?: string;
}
const CategoryTag = React.forwardRef<HTMLDivElement, IProps>(
  ({ tagColor, name, icon, sx, ...rest }, ref) => {
    return (
      <Chip
        ref={ref}
        label={`${name}`}
        icon={<Tag fontSize="small" />}
        sx={{
          borderRadius: "999px",
          fontWeight: 500,
          width: "fit-content",
          px: 1,
          color: "primary.main",
          "& .MuiChip-icon": {
            color: "primary.main",
          },
          "& .MuiChip-deleteIcon": {
            color: "primary.main",
            "&:hover": {
              color: "primary.dark",
            },
          },
          ...sx,
        }}
        {...rest}
      />
    );
  }
);

export default CategoryTag;
