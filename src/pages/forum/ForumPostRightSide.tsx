import { IForumPostListItem } from "@/apis/forum";
import userForumData from "./useForumData";
import "../news/News.css";
import { Box, Skeleton } from "@mui/material";
import ErrorMessage from "@/components/utils/ErrorMessage";

interface IProps {
  onClick?: (post: IForumPostListItem) => void;
}

export default function ForumPostRightSide({ onClick }: IProps) {
  const { posts, state, fetch } = userForumData("news");

  // Calculate reading time based on word count
  const calculateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} phút đọc`;
  };

  return (
    <Box
      className="sidebar"
      sx={{
        width: 280,
        p: 1,
        position: "sticky",
        top: "100px",
        color: "black",
      }}
    >
      <div className="sidebarWidget">
        <h3>Tin tức phổ biến</h3>
        <div className="popularArticles">
          {posts.slice(0, 3).map((post) => (
            <div
              key={post._id}
              className="popularArticle"
              onClick={() => onClick && onClick(post)}
            >
              {post.images && post.images.length > 0 ? (
                <img
                  src={post.images[0]}
                  alt={post.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.className = "no-image-small";
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              ) : (
                <div className="no-image-small"></div>
              )}
              <div className="popularArticleContent">
                <h4>{post.title}</h4>
                <span className="popularReadTime">
                  {calculateReadTime(post.content)}
                </span>
              </div>
            </div>
          ))}
          {state === "fetching" && (
            <Skeleton
              variant="rectangular"
              sx={{ width: "100%", height: "100%" }}
            />
          )}
          {state === "error" && (
            <ErrorMessage onRetry={() => fetch("news", 0, 10)} />
          )}
        </div>
      </div>
    </Box>
  );
}
