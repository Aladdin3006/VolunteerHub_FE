import { Box, Divider, List, Typography } from "@mui/material";
import { History, GradeOutlined } from "@mui/icons-material";
import { SidebarItem } from "../../components/forum/SideBarItem";
import { IForumPostListItem } from "../../apis/forum";
import { useSearchParams } from "react-router-dom";

interface IProps {
  shortcuts: IForumPostListItem[];
  onOpenShortcut?: (post: IForumPostListItem) => void;
}
const ForumLeftSide = ({ shortcuts, onOpenShortcut }: IProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openMyForumPosts = () => {
    setSearchParams({
      ref: "my",
    });
  };

  const openNewForumPosts = () => {
    setSearchParams({
      ref: "news",
    });
  };

  const ref = searchParams.get("ref");

  return (
    <Box
      sx={{
        width: 280,
        p: 1,
        position: "sticky",
        top: "100px",
        color: "black",
      }}
    >
      <List disablePadding>
        {/* <SidebarItem
          label="User"
          avatarSrc="https://example.com/avatar.jpg"
        /> */}
        <SidebarItem
          icon={<GradeOutlined color="primary" />}
          label="Mới nhất"
          onClick={openNewForumPosts}
          selected={!ref || ref === "news"}
        />
        {/* <SidebarItem
          icon={<ImportContactsOutlined color="primary" />}
          label="Relatives"
        /> */}
        <SidebarItem
          icon={<History color="secondary" />}
          label="Của bạn"
          onClick={openMyForumPosts}
          selected={ref === "my"}
        />
        {/* <SidebarItem icon={<Bookmark color="secondary" />} label="Saved" /> */}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="body2"
        fontWeight={600}
        px={2}
        pb={1}
        color="text.secondary"
      >
        Lối tắt
      </Typography>

      <List disablePadding>
        {shortcuts.map((save) => {
          return (
            <SidebarItem
              key={save._id}
              avatarSrc={save.createdBy.avatar}
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
