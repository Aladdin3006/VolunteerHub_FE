const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
  upvotes: number;
  downvotes: number;
  parentComment?: string | null;
  refType: string;
  refId: string;
  userVote: "upvote" | "downvote" | null;
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
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get comments: ${errorText}`);
    }

    const data = await response.json();
    const normalizeComments = (comments: any[]): Comment[] => {
      return comments.map((comment: any) => ({
        ...comment,
        id: comment._id || comment.id,
        upvotes: Array.isArray(comment.upvotes)
          ? comment.upvotes.length
          : comment.upvotes || 0,
        downvotes: Array.isArray(comment.downvotes)
          ? comment.downvotes.length
          : comment.downvotes || 0,
        userVote: comment.upvotes?.includes(
          JSON.parse(localStorage.getItem("user") || "{}").id
        )
          ? "upvote"
          : comment.downvotes?.includes(
              JSON.parse(localStorage.getItem("user") || "{}").id
            )
          ? "downvote"
          : null,
        replies: normalizeComments(comment.replies || []),
      }));
    };
    return normalizeComments(data);
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

  upvoteComment: async (
    id: string
  ): Promise<{
    upvotes: number;
    downvotes: number;
    userVote: "upvote" | "downvote" | null;
  }> => {
    const response = await fetch(`${API_BASE}/comment/${id}/upvote`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upvote comment: ${errorText}`);
    }

    const result = await response.json();
    return {
      ...result,
      userVote: result.upvotes?.includes(
        JSON.parse(localStorage.getItem("user") || "{}").id
      )
        ? "upvote"
        : result.downvotes?.includes(
            JSON.parse(localStorage.getItem("user") || "{}").id
          )
        ? "downvote"
        : null,
    };
  },

  downvoteComment: async (
    id: string
  ): Promise<{
    upvotes: number;
    downvotes: number;
    userVote: "upvote" | "downvote" | null;
  }> => {
    const response = await fetch(`${API_BASE}/comment/${id}/downvote`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to downvote comment: ${errorText}`);
    }

    const result = await response.json();
    return {
      ...result,
      userVote: result.upvotes?.includes(
        JSON.parse(localStorage.getItem("user") || "{}").id
      )
        ? "upvote"
        : result.downvotes?.includes(
            JSON.parse(localStorage.getItem("user") || "{}").id
          )
        ? "downvote"
        : null,
    };
  },
};

export default commentsService;
