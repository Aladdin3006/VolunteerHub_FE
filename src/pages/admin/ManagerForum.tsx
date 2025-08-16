import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManagerNews.css"; // Reuse existing CSS
import newsService, { NewsItem } from "../../apis/news";

const ManagerForum: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forumItems, setForumItems] = useState<NewsItem[]>([]);
  const itemsPerPage = 10;

  // Fetch forum posts from API
  const fetchForumPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await newsService.getAllNews();
      const forumPosts = data.filter((item) => item.type === "forum");
      setForumItems(forumPosts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load forum posts"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForumPosts();
  }, []);

  // Filter and sort forum posts
  const filteredForumPosts = forumItems
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
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
  const totalPages = Math.ceil(filteredForumPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredForumPosts.slice(
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
    navigate(`/admin/forum/${id}`);
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
          <h1 className="page-title">Forum Management</h1>
        </div>
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
            <p>Loading forum posts...</p>
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
            <button onClick={fetchForumPosts} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="filters-section">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search forum posts..."
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
              {paginatedPosts.length > 0 ? (
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
                    {paginatedPosts.map((post, index) => (
                      <tr key={post.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          {post.images?.length > 0 ? (
                            <img
                              src={post.images[0]}
                              alt={post.title}
                              className="news-image"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
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
                          <div className="news-title" title={post.title}>
                            {post.title}
                          </div>
                        </td>
                        <td>
                          <div
                            className="news-content"
                            title={stripHtmlTags(post.content)}
                          >
                            {stripHtmlTags(post.content)}
                          </div>
                        </td>
                        <td className="date-cell">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="date-cell">
                          {formatDate(post.updatedAt)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleView(post.id)}
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
                  <p>No forum posts found</p>
                  <p>Try adjusting your search terms</p>
                </div>
              )}
            </div>

            {filteredForumPosts.length > 0 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredForumPosts.length
                  )}{" "}
                  of {filteredForumPosts.length} results
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

export default ManagerForum;
