import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { Tag } from "@mui/icons-material";
import * as Icons from "lucide-react";

const toPascalCase = (str: string) => {
  return str
    .replace(/[-_ ]+/, " ")
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

interface IProps extends Omit<ChipProps, "icon"> {
  tagColor?: string;
  name: string;
  icon?: string;
}
const CategoryTag = React.forwardRef<HTMLDivElement, IProps>(
  ({ tagColor, name, icon, sx, ...rest }, ref) => {
    const pascalName = toPascalCase(icon ?? "");
    const LucideIcon = (Icons as any)[pascalName];
    return (
      <Chip
        ref={ref}
        {...rest}
        label={name}
        icon={
          icon && LucideIcon ? (
            <LucideIcon color={tagColor} />
          ) : (
            <Tag fontSize="small" />
          )
        }
        sx={{
          borderRadius: "999px",
          fontWeight: 500,
          width: "fit-content",
          px: 1,
          color: tagColor || "primary.main",
          backgroundColor: "transparent",
          border: "1px solid",
          borderColor: tagColor || "primary.main",
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
