import React from "react";
import { Avatar, Chip, ChipProps } from "@mui/material";
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
        {...rest}
        label={name}
        icon={
          icon ? (
            <Avatar
              src={icon}
              sx={{
                width: 20,
                height: 20,
              }}
            />
          ) : <Tag fontSize="small" />
        }
        sx={{
          borderRadius: "999px",
          fontWeight: 500,
          width: "fit-content",
          px: 1,
          color: tagColor || "primary.main",
          "& .MuiChip-icon": {
            color: tagColor || "primary.main",
          },
          "& .MuiChip-deleteIcon": {
            color: tagColor || "primary.main",
            opacity: 0,
            transition: "opacity 0.2s ease",
          },
          "&:hover .MuiChip-deleteIcon": {
            opacity: 1,
          },
          ...sx,
        }}
        {...rest}
      />
    );
  }
);

export default CategoryTag;
