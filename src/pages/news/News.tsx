import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./News.css";
import { useNavigate } from "react-router-dom";
import newsService, { NewsItem } from "../../apis/news"; // Import the news service

const News: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"ongoing" | "finished">("ongoing");
  const [newsArticles, setNewsArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getAllNews();
        setNewsArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Handle article click to navigate to detail page
  const handleArticleClick = (id: string) => {
    navigate(`/news/${id}`);
  };

  // Format date to Vietnamese locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Strip HTML tags and create excerpt
  const createExcerpt = (html: string, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, "");
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Calculate reading time based on word count
  const calculateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} phút đọc`;
  };

  return (
    <div className="newsPage">
      <div className="heroSection">
        <Header />
        <div className="heroContent">
          <h1 className="title">Cộng đồng</h1>
          <div className="breadcrumbs">
            <span>Trang chủ</span>
            <span className="breadcrumbDivider">/</span>
            <span className="current">Cộng đồng</span>
          </div>
        </div>
      </div>

      <div>
        <ul className="tab-list">
          <li
            className={activeTab === "ongoing" ? "active" : ""}
            onClick={() => setActiveTab("ongoing")}
          >
            Tin tức
          </li>
          <li
            className={activeTab === "finished" ? "active" : ""}
            onClick={() => {
              navigate("/forum")
            }}
          >
            Diễn đàn
          </li>
        </ul>
      </div>

      <div className="newsContent">
        <div className="container">
          <div className="contentWrapper">
            <div className="mainContent">
              <div className="categoryFilter">
                <h2>Khám phá Tin tức</h2>
              </div>

              {isLoading ? (
                <div className="loadingState">
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
                  <p>Đang tải Tin tức...</p>
                </div>
              ) : error ? (
                <div className="errorState">
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
                </div>
              ) : (
                <div className="articlesGrid">
                  {newsArticles.map((article) => (
                    <article
                      key={article.id}
                      className="articleCard"
                      onClick={() => handleArticleClick(article.id)}
                    >
                      <div className="articleImage">
                        {article.images && article.images.length > 0 ? (
                          <img
                            src={article.images[0]}
                            alt={article.title}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback = document.createElement("div");
                              fallback.className = "no-image-fallback";
                              fallback.textContent = "Không có hình ảnh";
                              target.parentNode?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="no-image-fallback">
                            Không có hình ảnh
                          </div>
                        )}
                        <div className="readTime">
                          {calculateReadTime(article.content)}
                        </div>
                      </div>
                      <div className="articleContent">
                        <div className="articleMeta">
                          <span className="date">
                            {formatDate(article.createdAt)}
                          </span>
                        </div>
                        <h3 className="articleTitle">{article.title}</h3>
                        <p className="articleExcerpt">
                          {createExcerpt(article.content)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!isLoading && !error && newsArticles.length === 0 && (
                <div className="noArticles">
                  <h3>Không có Tin tức nào</h3>
                  <p>Hiện tại chưa có Tin tức nào.</p>
                </div>
              )}
            </div>

            <div className="sidebar">
              <div className="sidebarWidget">
                <h3>Tin tức phổ biến</h3>
                {!isLoading && !error && newsArticles.length > 0 && (
                  <div className="popularArticles">
                    {newsArticles.slice(0, 3).map((article) => (
                      <div
                        key={article.id}
                        className="popularArticle"
                        onClick={() => handleArticleClick(article.id)}
                      >
                        {article.images && article.images.length > 0 ? (
                          <img
                            src={article.images[0]}
                            alt={article.title}
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
                          <h4>{article.title}</h4>
                          <span className="popularReadTime">
                            {calculateReadTime(article.content)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sidebarWidget">
                <h3>Theo dõi cập nhật</h3>
                <p>Đăng ký nhận thông báo về các bài viết mới nhất</p>
                <div className="subscribeForm">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="subscribeInput"
                  />
                  <button className="subscribeButton">Đăng ký</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default News;
