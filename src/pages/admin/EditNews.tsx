import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import newsService, { NewsItem, UpdateNewsData } from "../../apis/news";
import "./EditNews.css";

const EditNews: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch news data when component mounts
  useEffect(() => {
    if (id) {
      const fetchNews = async () => {
        try {
          const newsItem = await newsService.getNewsById(id);
          setFormData({
            title: newsItem.title,
            content: newsItem.content,
          });
          setExistingImages(newsItem.images || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load news");
        }
      };
      fetchNews();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + selectedImages.length + existingImages.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    // Validate file size (max 5MB per file)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Each image must be less than 5MB");
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      setError("Only image files are allowed");
      return;
    }

    setError("");

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...files]);
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(imagePreviewUrls[index]);
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const updateData: UpdateNewsData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        images: selectedImages,
      };

      await newsService.updateNews(id!, updateData);

      // Clean up preview URLs
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

      navigate("/admin/news");
    } catch (err) {
      console.error("Update error:", err);
      let errorMessage = "Failed to update news";
      if (err instanceof Error) {
        if (err.message.includes("useful")) {
          errorMessage = "Server configuration error. Please contact support.";
        } else if (err.message.includes("500")) {
          errorMessage = "Internal server error. Please try again later.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    navigate("/admin/news");
  };

  return (
    <div className="edit-news-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={handleCancel} type="button">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="page-title">Edit News Article</h1>
        </div>
      </div>

      <div className="edit-form-container">
        <form onSubmit={handleSubmit} className="edit-news-form">
          {error && (
            <div className="error-message">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter news title..."
                className="form-input title-input"
                maxLength={200}
                required
              />
              <div className="character-count">{formData.title.length}/200</div>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Content <span className="required">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your news content here..."
                className="form-textarea content-input"
                rows={15}
                required
              />
              <div className="character-count">
                {formData.content.length} characters
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Images (Optional)</label>
              <div className="image-upload-section">
                <div className="upload-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="file-input"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    <div className="upload-content">
                      <svg
                        className="upload-icon"
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
                      <p className="upload-text">Click to upload images</p>
                      <p className="upload-subtext">
                        Maximum 5 images, 5MB each
                      </p>
                    </div>
                  </label>
                </div>

                {(existingImages.length > 0 || imagePreviewUrls.length > 0) && (
                  <div className="image-preview-grid">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="image-preview-item">
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="remove-image-btn"
                          title="Remove image"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <div className="image-info">
                          <span className="image-name">
                            Existing Image {index + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                    {imagePreviewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="image-preview-item">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="remove-image-btn"
                          title="Remove image"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <div className="image-info">
                          <span className="image-name">
                            {selectedImages[index]?.name}
                          </span>
                          <span className="image-size">
                            {(
                              selectedImages[index]?.size /
                              1024 /
                              1024
                            ).toFixed(1)}
                            MB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={
                isSubmitting ||
                !formData.title.trim() ||
                !formData.content.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                "Update News"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNews;