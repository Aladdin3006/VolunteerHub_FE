const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface NewsItem {
  id: string;
  type: "news" | "forum";
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateNewsData {
  title: string;
  content: string;
  type: "news" | "forum";
  images?: File[];
}

export interface UpdateNewsData {
  title?: string;
  content?: string;
  type?: "news" | "forum";
  images?: File[];
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
  };
};

export const newsService = {
  // Get all news
  getAllNews: async (): Promise<NewsItem[]> => {
    const response = await fetch(`${API_BASE}/news`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

    // Map _id to id for each news item
    return data.map((item: any) => ({
      ...item,
      id: item._id || item.id, // Use _id if id is not present
    }));
  },

  // Get news by ID
  getNewsById: async (id: string): Promise<NewsItem> => {
    const response = await fetch(`${API_BASE}/news/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

    return {
      ...data,
      id: data._id || data.id, // Map _id to id
    };
  },

  // Create new news
  createNews: async (data: CreateNewsData): Promise<NewsItem> => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("type", data.type);

      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${API_BASE}/news`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Create news error:", error);
      throw error;
    }
  },

  // Update news
  updateNews: async (id: string, data: UpdateNewsData): Promise<NewsItem> => {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.content) formData.append("content", data.content);
    if (data.type) formData.append("type", data.type);

    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await fetch(`${API_BASE}/news/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      if (Array.isArray(result.errors)) {
        const messages = result.errors.map((err: any) => err.msg).join("\n");
        throw new Error(messages);
      }
      throw new Error(
        result.error || result.message || "Failed to update news"
      );
    }

    return result;
  },

  // Delete news
  deleteNews: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/news/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(
        result.error || result.message || "Failed to delete news"
      );
    }
  },
};

export default newsService;
