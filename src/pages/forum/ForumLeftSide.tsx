import { Box, Divider, List, Typography } from "@mui/material";
import {
  Bookmark,
  History,
  GradeOutlined,
  ImportContactsOutlined,
} from "@mui/icons-material";
import { SidebarItem } from "../../components/forum/SideBarItem";
import { IForumPost } from "../../apis/forum";

interface IProps {
  saveds: IForumPost[];
  onOpenShortcut?: (post: IForumPost) => void;
}
const ForumLeftSide = ({ saveds, onOpenShortcut }: IProps) => {
  return (
    <Box
      sx={{
        width: 280,
        p: 1,
        position: "fixed",
        top: "calc(100vh-100px)",
        color: "black",
      }}
    >
      <List disablePadding>
        <SidebarItem
          label="User"
          avatarSrc="https://example.com/avatar.jpg"
        />
        <SidebarItem icon={<GradeOutlined color="primary" />} label="News" />
        <SidebarItem
          icon={<ImportContactsOutlined color="primary" />}
          label="Relatives"
        />
        <SidebarItem icon={<History color="secondary" />} label="Yours" />
        <SidebarItem icon={<Bookmark color="secondary" />} label="Saved" />
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="body2"
        fontWeight={600}
        px={2}
        pb={1}
        color="text.secondary"
      >
        Your shortcuts
      </Typography>

      <List disablePadding>
        {saveds.map((save) => {
          return (
            <SidebarItem
              key={save._id}
              avatarSrc="https://example.com/group-logo.jpg"
              label={save.content.slice(0, 15)}
              onClick={() => {
                onOpenShortcut && onOpenShortcut(save);
              }}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default ForumLeftSide;
