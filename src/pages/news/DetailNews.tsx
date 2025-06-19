import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import newsService, { NewsItem } from "../../apis/news";
import commentsService, { Comment } from "../../apis/comments";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem as SelectMenuItem,
  InputAdornment,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Comment as CommentIcon,
  Share,
  Send,
  MoreVert,
  Report,
  Delete,
} from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import "./DetailNews.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

interface ReplyState {
  [commentId: string]: string;
}

const DetailNews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvotes, setUpvotes] = useState(42);
  const [downvotes, setDownvotes] = useState(3);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState<ReplyState>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // Add state for comment menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await newsService.getNewsById(id);
        setNews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      try {
        const data = await commentsService.getComments("NewsPost", id);
        setComments(data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchNews();
    fetchComments();
  }, [id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    const years = Math.floor(months / 12);
    return `${years} năm trước`;
  };

  const renderImages = (images: string[]) => {
    if (!images || images.length === 0) return null;

    const imageCount = images.length;
    let imageStyle = {};

    switch (imageCount) {
      case 1:
        imageStyle = { width: "500px", height: "400px" };
        break;
      case 2:
        imageStyle = { width: "300px", height: "250px" };
        break;
      case 3:
        imageStyle = { width: "200px", height: "200px" };
        break;
      case 4:
        imageStyle = { width: "150px", height: "150px" };
        break;
      case 5:
        imageStyle = { width: "120px", height: "120px" };
        break;
      default:
        imageStyle = { width: "100px", height: "100px" };
    }

    return (
      <Box className="image-container">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`News ${idx + 1}`}
            style={imageStyle}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "default-image.png";
            }}
          />
        ))}
      </Box>
    );
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !id) return;

    try {
      const commentData = {
        content: newComment,
        refType: "NewsPost",
        refId: id,
        parentComment: null,
      };

      const newCommentData = await commentsService.createComment(commentData);
      setComments((prev) => [
        ...prev,
        {
          ...newCommentData,
          replies: [],
          createdBy: {
            ...newCommentData.createdBy,
            avatar: newCommentData.createdBy.avatar || "user-default.png",
          },
        },
      ]);
      setNewComment("");
      const updatedComments = await commentsService.getComments("NewsPost", id);
      setComments(updatedComments);
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setTimeout(() => {
      if (replyInputRef.current) {
        replyInputRef.current.focus();
      }
    }, 100);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent({});
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent[parentCommentId]?.trim() || !id) return;

    try {
      const replyData = {
        content: replyContent[parentCommentId],
        refType: "NewsPost",
        refId: id,
        parentComment: parentCommentId,
      };

      const newReply = await commentsService.createComment(replyData);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  ...newReply,
                  createdBy: {
                    ...newReply.createdBy,
                    avatar: newReply.createdBy.avatar || "user-default.png",
                  },
                },
              ],
            };
          }
          return comment;
        })
      );
      setReplyContent((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyingTo(null);
      const updatedComments = await commentsService.getComments("NewsPost", id);
      setComments(updatedComments);
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    comment: Comment
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentComment(null);
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    handleMenuClose();
  };

  const handleReportSubmit = async () => {
    if (currentComment) {
      console.log(
        "Reported comment:",
        currentComment.id,
        "Reason:",
        reportReason
      );
      setOpenSnackbar(true);
      setReportDialogOpen(false);
      setReportReason("");
    }
  };

  const handleDeleteComment = () => {
    setAnchorEl(null); // Only close menu, don't reset currentComment
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (currentComment && id) {
      try {
        await commentsService.deleteComment(currentComment.id);
        const updatedComments = await commentsService.getComments(
          "NewsPost",
          id
        );
        setComments(updatedComments);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete comment:", error);
        setError("Failed to delete comment. Please try again.");
      }
    }
  };

  const sortComments = (comments: Comment[]) => {
    let sortedComments = [...comments];
    switch (sortOption) {
      case "newest":
        sortedComments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        sortedComments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "mostVotes":
        sortedComments;
        break;
      default:
        break;
    }
    return sortedComments;
  };

  const filterComments = (comments: Comment[]) => {
    if (!searchTerm) return comments;
    return comments.filter(
      (comment) =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.createdBy.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  };

  const renderComment = (comment: Comment, level = 0) => (
    <Box
      key={comment.id}
      className="comment"
      sx={{ marginLeft: level * 1.5 + "rem", marginTop: 0 }}
    >
      <Box className="comment-header">
        <img
          src={comment.createdBy.avatar || "user-default.png"}
          alt={`${comment.createdBy.fullName}'s avatar`}
          className="comment-avatar"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "user-default.png";
          }}
        />
        <Box sx={{ flex: "row" }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: "space-between" }}
          >
            <Typography variant="subtitle2" className="comment-author">
              {comment.createdBy.fullName}
            </Typography>
            <Tooltip title="More actions">
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, comment)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" className="comment-time">
            {formatTimeAgo(comment.createdAt)}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        className="comment-content"
        sx={{ textAlign: "left" }}
      >
        {comment.content}
      </Typography>
      <Box className="comment-actions">
        <Tooltip title="Upvote">
          <IconButton size="small">
            <ThumbUp fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption">{0}</Typography>
        <Tooltip title="Downvote">
          <IconButton size="small">
            <ThumbDown fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption">{0}</Typography>
        <Tooltip title="Reply">
          <IconButton size="small" onClick={() => handleReply(comment.id)}>
            <CommentIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share">
          <IconButton
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setOpenSnackbar(true);
            }}
          >
            <Share fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {replyingTo === comment.id && (
        <Box className="reply-form" sx={{ ml: 2, mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={replyContent[comment.id] || ""}
            onChange={(e) =>
              setReplyContent({
                ...replyContent,
                [comment.id]: e.target.value,
              })
            }
            placeholder={`Reply to ${comment.createdBy.fullName}...`}
            variant="outlined"
            inputRef={replyInputRef}
            InputProps={{
              endAdornment: (
                <>
                  <Button
                    size="small"
                    onClick={handleCancelReply}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSubmitReply(comment.id)}
                  >
                    Reply
                  </Button>
                </>
              ),
            }}
          />
        </Box>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <Box className="replies">
          {comment.replies.map((reply: any) => renderComment(reply, level + 1))}
        </Box>
      )}
    </Box>
  );

  if (isLoading) {
    return (
      <div className="detail-news-page">
        <Header />
        <Box className="loading-container">
          <Box className="loading-spinner"></Box>
          <Typography>Đang tải...</Typography>
        </Box>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-news-page">
        <Header />
        <Box className="error-container">
          <Typography>{error}</Typography>
          <Button variant="contained" onClick={() => navigate("/news")}>
            Quay lại trang tin tức
          </Button>
        </Box>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="detail-news-page">
        <Header />
        <Box className="not-found-container">
          <Typography>Không tìm thấy bài viết</Typography>
          <Button variant="contained" onClick={() => navigate("/news")}>
            Quay lại trang tin tức
          </Button>
        </Box>
        <Footer />
      </div>
    );
  }

  const sortedAndFilteredComments = filterComments(sortComments(comments));

  return (
    <div className="detail-news-page">
      <Header />
      <Box className="main-layout">
        <Box className="container">
          <Box className="news-header">
            <Box className="logo-container">
              <img src="/logo.png" alt="Logo" className="logo-image" />
            </Box>
            <Box className="news-info">
              <Typography variant="subtitle1" className="news-source">
                VolunteerHub Hà Tĩnh
              </Typography>
              <Typography variant="caption" className="news-time">
                {formatTimeAgo(news.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Typography variant="h4" className="news-title">
            {news.title}
          </Typography>

          {news.images && news.images.length > 0 && renderImages(news.images)}

          <div
            className="news-content"
            dangerouslySetInnerHTML={{ __html: news.content }}
          ></div>

          <Box className="action-bar">
            <Box className="vote-section">
              <Tooltip title="Upvote">
                <IconButton
                  size="small"
                  onClick={() => setUpvotes(upvotes + 1)}
                >
                  <ThumbUp fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="caption">{upvotes - downvotes}</Typography>
              <Tooltip title="Downvote">
                <IconButton
                  size="small"
                  onClick={() => setDownvotes(downvotes + 1)}
                >
                  <ThumbDown fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className="comments-section">
              <Tooltip title="Comments">
                <IconButton size="small">
                  <CommentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="caption">{comments.length}</Typography>
            </Box>
            <Box className="share-section">
              <Tooltip title="Share">
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setOpenSnackbar(true);
                  }}
                >
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box className="comments-container">
            <Typography variant="h6" className="comments-title">
              Bình luận ({comments.length})
            </Typography>
            <Box className="comment-form">
              <TextField
                fullWidth
                multiline
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Thêm bình luận..."
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSubmitComment}
                      sx={{ marginLeft: 1, height: "40px" }}
                    >
                      <Send fontSize="small" />
                    </Button>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              <Box
                sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}
              >
                <Typography variant="caption">Sắp xếp theo:</Typography>
                <Select
                  value={sortOption}
                  onChange={(e: SelectChangeEvent) =>
                    setSortOption(e.target.value as string)
                  }
                  size="small"
                  sx={{
                    ml: 1,
                    borderRadius: "20px",
                    height: "32px",
                  }}
                >
                  <SelectMenuItem value="newest">Mới nhất</SelectMenuItem>
                  <SelectMenuItem value="oldest">Cũ nhất</SelectMenuItem>
                  <SelectMenuItem value="mostVotes">
                    Nhiều vote nhất
                  </SelectMenuItem>
                </Select>
                <TextField
                  variant="outlined"
                  placeholder="Tìm kiếm bình luận..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{
                    borderRadius: "20px",
                    height: "32px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      paddingLeft: "8px",
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>
            <Box className="comments-list">
              {sortedAndFilteredComments.length > 0 ? (
                sortedAndFilteredComments.map((comment) =>
                  renderComment(comment)
                )
              ) : (
                <Typography variant="body2" sx={{ textAlign: "center", py: 3 }}>
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box className="sidebar">
          <Typography variant="h6" className="related-title">
            📰 Tin tức liên quan
          </Typography>
          <ul className="related-list">
            <li>
              <a href="#">Chính phủ hỗ trợ miền Trung sau lũ lụt</a>
            </li>
            <li>
              <a href="#">Chiến dịch hiến máu nhân đạo tháng 7</a>
            </li>
            <li>
              <a href="#">Thanh niên tình nguyện vì cộng đồng</a>
            </li>
          </ul>
        </Box>
      </Box>
      <Footer />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success">Đã sao chép liên kết!</Alert>
      </Snackbar>

      {/* Comment menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReportClick}>
          <Report fontSize="small" sx={{ mr: 1 }} /> Báo cáo
        </MenuItem>
        <MenuItem onClick={handleDeleteComment}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Xóa
        </MenuItem>
      </Menu>

      {/* Report dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
      >
        <DialogTitle>Báo cáo bình luận</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do báo cáo"
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleReportSubmit}>Gửi báo cáo</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCurrentComment(null); // Reset here instead
        }}
      >
        <DialogTitle>Xác nhận xóa bình luận</DialogTitle>
        <DialogContent>
          <Typography>Bạn muốn xóa bình luận này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DetailNews;
