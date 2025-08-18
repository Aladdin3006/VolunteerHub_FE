import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputAdornment,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  SvgIcon,
} from "@mui/material";
import { NewsItem } from "../../apis/news";
import newsService from "../../apis/news";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArticleIcon from "@mui/icons-material/Article";

const ManagerNews: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch news from API, filtering for type: "news"
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await newsService.getAllNews();
      const newsPosts = data.filter((item) => item.type === "news");
      setNewsItems(newsPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle news deletion
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      setDeletingId(id);
      try {
        await newsService.deleteNews(id);
        setNewsItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete news");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Filter and sort news
  const filteredNews = newsItems
    .filter(
      (news) =>
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const handleView = (id: string) => {
    navigate(`/admin/news/${id}`);
  };

  const handleEdit = (id: string) => {
    if (!id) {
      console.error("Cannot edit news item: ID is undefined");
      return;
    }
    navigate(`/admin/news/edit/${id}`);
  };

  const handleAddNews = () => {
    navigate("/admin/news/create");
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.default",
        minHeight: "100vh",
        ml: { xs: 0, md: "240px" }, // Adjust for sidebar
        transition: "margin-left 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SvgIcon
            component={ArticleIcon}
            sx={{ fontSize: 32, color: "primary.main" }}
          />
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            News Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNews}
          sx={{ borderRadius: 2 }}
        >
          Add News
        </Button>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 5,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading news...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchNews}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 300 } }}
              variant="outlined"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ width: { xs: "100%", sm: 200 } }}
              variant="outlined"
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="title">Sort by Title</MenuItem>
            </Select>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNews}
              sx={{ borderRadius: 2 }}
            >
              Add News
            </Button>
          </Box>

          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 3,
              overflowX: "auto",
            }}
          >
            {paginatedNews.length > 0 ? (
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "primary.light" }}>
                    <TableCell
                      sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                    >
                      Sr. No.
                    </TableCell>
                    <TableCell
                      sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                    >
                      Image
                    </TableCell>
                    <TableCell
                      sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                    >
                      Title
                    </TableCell>
                    <TableCell
                      sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                    >
                      Content
                    </TableCell>
                    <TableCell
                      sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                    >
                      Created Date
                    </TableCell>
                    <TableCell
                      sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                    >
                      Updated Date
                    </TableCell>
                    <TableCell
                      sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedNews.map((news, index) => (
                    <TableRow
                      key={news.id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      }}
                    >
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>
                        {news.images?.length > 0 ? (
                          <img
                            src={news.images[0]}
                            alt={news.title}
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "contain",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No Image
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={news.title}
                        >
                          {news.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxHeight: "4.5em",
                            lineHeight: "1.5em",
                          }}
                          title={stripHtmlTags(news.content)}
                        >
                          {stripHtmlTags(news.content)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(news.createdAt)}</TableCell>
                      <TableCell>{formatDate(news.updatedAt)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            color="primary"
                            title="View Details"
                            onClick={() => handleView(news.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="info"
                            title="Edit"
                            onClick={() => handleEdit(news.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            title="Delete"
                            onClick={() => handleDelete(news.id)}
                            disabled={deletingId === news.id}
                          >
                            {deletingId === news.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 3,
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    flexGrow: 1,
                  }}
                >
                  <TextField
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: { xs: "100%", sm: 300 } }}
                    variant="outlined"
                  />
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 200 } }}
                    variant="outlined"
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="title">Sort by Title</MenuItem>
                  </Select>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNews}
                  sx={{ borderRadius: 2 }}
                >
                  Add News
                </Button>
              </Box>
            )}
          </Box>

          {filteredNews.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredNews.length)} of{" "}
                {filteredNews.length} results
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "contained" : "outlined"}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outlined"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ManagerNews;
