import {
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

export const SidebarItem = ({
  icon,
  label,
  avatarSrc,
  onClick,
  selected,
}: {
  icon?: React.ReactNode;
  label: string;
  avatarSrc?: string;
  onClick?: () => void;
  selected?: boolean;
}) => (
  <ListItem disablePadding onClick={onClick}>
    <ListItemButton selected={selected}>
      {avatarSrc ? (
        <ListItemAvatar>
          <Avatar src={avatarSrc} sx={{ width: 32, height: 32 }}>
            {label.slice(0, 2)}
          </Avatar>
        </ListItemAvatar>
      ) : (
        <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      )}
      <ListItemText primary={label} />
    </ListItemButton>
  </ListItem>
);
