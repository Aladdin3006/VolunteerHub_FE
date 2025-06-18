import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManagerNews.css";
import newsService, { NewsItem } from "../../apis/news"; // Import the service and interface

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

  // Fetch news from API
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await newsService.getAllNews();
      setNewsItems(data);
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

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="news-page">
      <div className="page-header">
        <div className="header-left">
          <div className="page-icon">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h1 className="page-title">News Management</h1>
        </div>
        <button className="add-news-btn" onClick={handleAddNews}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add News
        </button>
      </div>

      <div className="content-card">
        {isLoading ? (
          <div className="loading-state">
            <svg
              className="animate-spin h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p>Loading news...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{error}</p>
            <button onClick={fetchNews} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="filters-section">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <svg
                  className="search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>

            <div className="table-container">
              {paginatedNews.length > 0 ? (
                <table className="news-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Content</th>
                      <th>Created Date</th>
                      <th>Updated Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedNews.map((news, index) => (
                      <tr key={news.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          {news.images?.length > 0 ? (
                            <img
                              src={news.images[0]}
                              alt={news.title}
                              className="news-image"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                // Add fallback content
                                const fallback = document.createElement("div");
                                fallback.className = "no-image";
                                fallback.textContent = "No Image";
                                target.parentNode?.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </td>
                        <td>
                          <div className="news-title" title={news.title}>
                            {news.title}
                          </div>
                        </td>
                        <td>
                          <div
                            className="news-content"
                            title={stripHtmlTags(news.content)}
                          >
                            {stripHtmlTags(news.content)}
                          </div>
                        </td>
                        <td className="date-cell">
                          {formatDate(news.createdAt)}
                        </td>
                        <td className="date-cell">
                          {formatDate(news.updatedAt)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleView(news.id)}
                              className="action-btn view-btn"
                              title="View Details"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(news.id)}
                              className="action-btn edit-btn"
                              title="Edit"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(news.id)}
                              className="action-btn delete-btn"
                              title="Delete"
                              disabled={deletingId === news.id}
                            >
                              {deletingId === news.id ? (
                                <>
                                  <svg
                                    className="w-4 h-4 inline mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  <p>No news articles found</p>
                  <p>Try adjusting your search terms or create a new article</p>
                  <button onClick={handleAddNews} className="add-btn">
                    Create News
                  </button>
                </div>
              )}
            </div>

            {filteredNews.length > 0 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredNews.length)} of{" "}
                  {filteredNews.length} results
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`pagination-btn ${
                          page === currentPage ? "active" : ""
                        }`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerNews;
