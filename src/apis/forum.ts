import { ICategory } from "./campaign";
import { getAccessToken, handleResponse, IDataResponse } from "./utils";

/**
 * A simple tag
 * @link models\category.model.js
 */
export interface ITag extends ICategory {}

/**
 * A simple user info
 * @link models\users.model.js
 */
export interface IUserShort {
  _id: string;
  fullName: string;
  avatar?: string;
}

export interface IComment {
  _id: string;
  content: string;
  createdBy: IUserShort;
  // Id of parent comment
  parentComment: string;
  /**
   * List of user ids upvotes this comment
   */
  upvotes: string[];
  /**
   * List of user ids downvotes this comment
   */
  downvotes: string[];
  createdAt: string;
  updatedAt: string;
  /**
   * Nested comments
   */
  comments: IComment[];
}

/**
 * A simple forum post
 * @link models\newsPost.model.js
 */
export interface IForumPost {
  _id: string;
  content: string;
  images: string[];
  tags: ITag[];
  createdBy: IUserShort;
  commentsCount: number;
  /**
   * List of user ids upvotes this post
   */
  upvotes: string[];
  /**
   * List of user ids downvotes this post
   */
  downvotes: string[];
  createdAt: string;
  updatedAt: string;
  /**
   * List of comments
   */
  comments: IComment[];
}

const API_BASE = "http://localhost:4000";

export interface IForumPostUploadData {
  title: string;
  images: string[];
  content: string;
  tags: string[];
}

export interface IForumPostListItem {
  _id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  tags: ITag[];
  createdBy: IUserShort;
  upvotesCount: number;
  downvotesCount: number;
  isUpvoted: boolean;
  isDownvoted: boolean;

  comments?: ICommentListItem[];
  isLoadingComments?: boolean;
  isErrorComments?: boolean;
  isLoadedAllComments?: boolean;
  sendingCommentIds?: string[];
}

export interface ICommentListItem {
  _id: string;
  content: string;
  createdAt: string;
  commentsCount: number;
  isUpvoted: boolean;
  isDownvoted: boolean;
  createdBy: IUserShort;

  comments?: ICommentListItem[];
  isLoadingComments?: boolean;
  isErrorComments?: boolean;
  isLoadedAllComments?: boolean;
  sendingCommentIds?: string[];
  updateCount?: number;
}

export const FORUM_API = {
  async createNewPost(data: IForumPostUploadData) {
    const response = await fetch(`${API_BASE}/forum`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<
      IDataResponse<IForumPostListItem>,
      IDataResponse<IForumPostListItem>
    >(response);
  },

  async updatePost(postId: string, data: IForumPostUploadData) {
    const response = await fetch(`${API_BASE}/forum/${postId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async deletePost(postId: string) {
    const response = await fetch(`${API_BASE}/forum/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async getNewForumPosts(skip: number, limit = 20) {
    const response = await fetch(
      `${API_BASE}/forum/news?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IForumPostListItem[]>,
      IDataResponse<IForumPostListItem[]>
    >(response);
  },

  async getRelativeForumPosts(skip: number, limit = 20) {
    const response = await fetch(
      `${API_BASE}/forum/relatives?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IForumPostListItem[]>,
      IDataResponse<IForumPostListItem[]>
    >(response);
  },

  async getSavedForumPosts(skip: number, limit = 20) {
    const response = await fetch(
      `${API_BASE}/forum/saved?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IForumPostListItem[]>,
      IDataResponse<IForumPostListItem[]>
    >(response);
  },

  async getUserForumPosts(userId: string, skip: number, limit = 20) {
    const response = await fetch(
      `${API_BASE}/forum/posts/users/${userId}?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IForumPostListItem[]>,
      IDataResponse<IForumPostListItem[]>
    >(response);
  },

  async getForumPostDetail(postId: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<
      IDataResponse<IForumPostListItem>,
      IDataResponse<IForumPostListItem>
    >(response);
  },

  async upvoteForumPost(postId: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}/upvotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async downvoteForumPost(postId: string) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/downvotes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async unvoteForumPost(postId: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}/votes`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async saveForumPost(postId: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}/save`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<unknown, unknown>(response);
  },

  async getUpvoteForumPostUsers(postId: string, skip: number, limit = 20) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/upvotes?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IUserShort[]>,
      IDataResponse<IUserShort[]>
    >(response);
  },

  async getDownvoteForumPostUsers(postId: string, skip: number, limit = 20) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/downvotes?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IUserShort[]>,
      IDataResponse<IUserShort[]>
    >(response);
  },

  async commentForumPost(postId: string, content: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: content }),
    });
    return handleResponse<IDataResponse<IComment>, IDataResponse<IComment>>(
      response
    );
  },

  async deleteCommentForumPost(postId: string, commentId: string) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<unknown, unknown>(response);
  },

  async replyForumPostComment(
    postId: string,
    commentId: string,
    content: string
  ) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      }
    );
    return handleResponse<IDataResponse<IComment>, IDataResponse<IComment>>(
      response
    );
  },

  async deleteReplyForumPostComment(postId: string, commentId: string) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<unknown, unknown>(response);
  },

  async upvoteForumPostComment(postId: string, commentId: string) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}/upvotes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async downvoteForumPostComment(postId: string, commentId: string) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}/downvotes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async unvoteForumPostComment(postId: string, commentId: string) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}/votes`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async getForumPostComments(postId: string, skip: number, limit = 20) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<ICommentListItem[]>,
      IDataResponse<ICommentListItem[]>
    >(response);
  },

  async getForumPostCommentRelies(
    postId: string,
    commentId: string,
    skip: number,
    limit = 20
  ) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}/comments?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<ICommentListItem[]>,
      IDataResponse<ICommentListItem[]>
    >(response);
  },

  async getUpvoteForumPostCommentUsers(
    postId: string,
    commentId: string,
    skip: number,
    limit = 20
  ) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}/upvotes?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IUserShort[]>,
      IDataResponse<IUserShort[]>
    >(response);
  },

  async getDownvoteForumPostCommentUsers(
    postId: string,
    commentId: string,
    skip: number,
    limit = 20
  ) {
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/comments/${commentId}/downvotes?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<IUserShort[]>,
      IDataResponse<IUserShort[]>
    >(response);
  },
} as const;
