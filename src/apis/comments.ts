const API_BASE = "http://localhost:4000";

export interface Comment {
  id: string;
  content: string;
  createdBy: {
    id: string;
    fullName: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

interface CreateCommentData {
  content: string;
  refType: string;
  refId: string;
  parentComment?: string | null;
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  };
};

export const commentsService = {
  createComment: async (data: CreateCommentData): Promise<Comment> => {
    const response = await fetch(`${API_BASE}/comment`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create comment: ${errorText}`);
    }

    return await response.json();
  },

  getComments: async (refType: string, refId: string): Promise<Comment[]> => {
    const response = await fetch(
      `${API_BASE}/comment?refType=${refType}&refId=${refId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get comments: ${errorText}`);
    }

    const data = await response.json();
    return data.map((comment: any) => ({
      ...comment,
      id: comment._id || comment.id,
    }));
  },

  deleteComment: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/comment/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete comment: ${errorText}`);
    }
  },
};

export default commentsService;