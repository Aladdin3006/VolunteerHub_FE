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
import ImageGallery from "../../components/image/ImageGallery";

interface ReplyState {
  [commentId: string]: string;
}

const DetailNews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState<ReplyState>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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

  const updateCommentVotes = (
    comments: Comment[],
    commentId: string,
    result: {
      upvotes: number;
      downvotes: number;
      userVote: "upvote" | "downvote" | null;
    }
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          upvotes: result.upvotes,
          downvotes: result.downvotes,
          userVote: result.userVote,
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentVotes(comment.replies, commentId, result),
        };
      }
      return comment;
    });
  };

  const handleUpvote = async (commentId: string) => {
    if (!commentId) {
      console.error("Comment ID is undefined");
      return;
    }
    try {
      const result = await commentsService.upvoteComment(commentId);
      setComments((prev) => updateCommentVotes(prev, commentId, result));
    } catch (error) {
      console.error("Failed to upvote comment:", error);
    }
  };

  const handleDownvote = async (commentId: string) => {
    if (!commentId) {
      console.error("Comment ID is undefined");
      return;
    }
    try {
      const result = await commentsService.downvoteComment(commentId);
      setComments((prev) => updateCommentVotes(prev, commentId, result));
    } catch (error) {
      console.error("Failed to downvote comment:", error);
    }
  };

  const sortedAndFilteredComments = [...comments]
    .filter((comment) =>
      comment.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "mostVotes":
          return (b.upvotes || 0) - (a.upvotes || 0);
        default:
          return 0;
      }
    });

  const renderComment = (
    comment: Comment,
    level = 0,
    parentName: string | null = null
  ) => {
    const isChild = level > 0;
    return (
      <Box
        key={comment.id}
        sx={{
          backgroundColor: "#fff",
          p: 2,
          mb: 2,
          ml: level * 2,
          ...(isChild
            ? { borderRadius: 0, boxShadow: "none" }
            : { borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <img
            src={comment.createdBy.avatar || "user-default.png"}
            alt={comment.createdBy.fullName}
            style={{ width: 40, height: 40, borderRadius: "50%", mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {comment.createdBy.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(comment.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, comment)}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {isChild && parentName ? (
            <>
              <Box component="span" sx={{ color: "primary.main" }}>
                @{parentName}
              </Box>{" "}
              {comment.content}
            </>
          ) : (
            comment.content
          )}
        </Typography>
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Upvote">
            <IconButton size="small" onClick={() => handleUpvote(comment.id)}>
              <ThumbUp
                fontSize="small"
                color={comment.userVote === "upvote" ? "primary" : "inherit"}
              />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">{comment.upvotes ?? 0}</Typography>
          <Tooltip title="Downvote">
            <IconButton size="small" onClick={() => handleDownvote(comment.id)}>
              <ThumbDown
                fontSize="small"
                color={comment.userVote === "downvote" ? "primary" : "inherit"}
              />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">{comment.downvotes ?? 0}</Typography>
          <Button
            size="small"
            onClick={() => handleReply(comment.id)}
            sx={{ textTransform: "none" }}
          >
            Trả lời
          </Button>
        </Box>
        {replyingTo === comment.id && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={replyContent[comment.id] || ""}
              onChange={(e) =>
                setReplyContent((prev) => ({
                  ...prev,
                  [comment.id]: e.target.value,
                }))
              }
              placeholder="Viết trả lời..."
              variant="outlined"
              inputRef={replyInputRef}
              InputProps={{
                endAdornment: (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSubmitReply(comment.id)}
                      sx={{ mr: 1 }}
                    >
                      <Send fontSize="small" />
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancelReply}
                    >
                      Hủy
                    </Button>
                  </>
                ),
              }}
            />
          </Box>
        )}
        {(comment.replies || []).map((reply) =>
          renderComment(reply, level + 1, comment.createdBy.fullName)
        )}
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
          upvotes: 0,
          downvotes: 0,
          userVote: null,
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
                  upvotes: 0,
                  downvotes: 0,
                  userVote: null,
                  createdBy: {
                    ...newReply.createdBy,
                    avatar: newReply.createdBy.avatar || "user-default.png",
                  },
                },
              ],
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === parentCommentId
                  ? {
                      ...reply,
                      replies: [
                        ...(reply.replies || []),
                        {
                          ...newReply,
                          upvotes: 0,
                          downvotes: 0,
                          userVote: null,
                          createdBy: {
                            ...newReply.createdBy,
                            avatar:
                              newReply.createdBy.avatar || "user-default.png",
                          },
                        },
                      ],
                    }
                  : reply
              ),
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

  const handleReportSubmit = () => {
    if (currentComment) {
      setOpenSnackbar(true);
      setReportDialogOpen(false);
      setReportReason("");
    }
  };

  const handleDeleteComment = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (currentComment) {
      try {
        await commentsService.deleteComment(currentComment.id);
        setComments((prev) => prev.filter((c) => c.id !== currentComment.id));
        setDeleteDialogOpen(false);
        setCurrentComment(null);
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  return (
    <div>
      <Header />
      <Box
        sx={{
          marginTop: "100px",
          padding: { xs: 2, md: 4 },
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {isLoading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6">Đang tải bài viết...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4, color: "error.main" }}>
            <Typography variant="h6">{error}</Typography>
          </Box>
        ) : news ? (
          <Box>
            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                p: 3,
                mb: 4,
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {news.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {new Date(news.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
              <ImageGallery images={news.images} />
              <Box
                sx={{ mt: 2 }}
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                p: 3,
                mb: 4,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Bình luận ({comments.length})
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                variant="outlined"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                    >
                      <Send />
                    </Button>
                  ),
                }}
              />
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Select
                  value={sortOption}
                  onChange={(e: SelectChangeEvent) =>
                    setSortOption(e.target.value as string)
                  }
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="oldest">Cũ nhất</MenuItem>
                  <MenuItem value="mostVotes">Nhiều vote nhất</MenuItem>
                </Select>
                <TextField
                  variant="outlined"
                  placeholder="Tìm kiếm bình luận..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                {sortedAndFilteredComments.length > 0 ? (
                  sortedAndFilteredComments.map((comment) =>
                    renderComment(comment)
                  )
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        ) : null}

        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            p: 3,
            mt: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Tin tức liên quan
          </Typography>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {[
              "Chính phủ hỗ trợ miền Trung sau lũ lụt",
              "Chiến dịch hiến máu nhân đạo tháng 7",
              "Thanh niên tình nguyện vì cộng đồng",
            ].map((item, index) => (
              <li key={index} style={{ marginBottom: 1 }}>
                <a
                  href="#"
                  style={{ textDecoration: "none", color: "#1976d2" }}
                >
                  {item}
                </a>
              </li>
            ))}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReportClick}>
          <Report sx={{ mr: 1 }} /> Báo cáo
        </MenuItem>
        <MenuItem onClick={handleDeleteComment}>
          <Delete sx={{ mr: 1 }} /> Xóa
        </MenuItem>
      </Menu>

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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCurrentComment(null);
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
