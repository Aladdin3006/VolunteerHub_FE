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
}: {
  icon?: React.ReactNode;
  label: string;
  avatarSrc?: string;
  onClick?: () => void;
}) => (
  <ListItem disablePadding onClick={onClick}>
    <ListItemButton>
      {avatarSrc ? (
        <ListItemAvatar>
          <Avatar src={avatarSrc} sx={{ width: 32, height: 32 }} />
        </ListItemAvatar>
      ) : (
        <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      )}
      <ListItemText primary={label} />
    </ListItemButton>
  </ListItem>
);
