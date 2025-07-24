import { ICategory } from "./campaign";
import {
  axiosInstance,
  getAccessToken,
  handleResponse,
  IAxiosExtraConfigOptions,
  IDataResponse,
  IDataResponseSuccess,
} from "./utils";

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
  async createNewPost(
    data: IForumPostUploadData,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<IForumPostListItem>> {
    return axiosInstance.post(`/forum`, data, {
      extraOptions: {
        ...options,
      },
    });
  },

  async updatePost(
    postId: string,
    data: IForumPostUploadData,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.put(`/forum/${postId}`, data, {
      extraOptions: {
        ...options,
      },
    });
  },

  async deletePost(
    postId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.delete(`/forum/${postId}`, {
      extraOptions: {
        ...options,
      },
    });
  },

  async getNewForumPosts(
    skip: number,
    limit = 20,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<IForumPostListItem[]>> {
    return axiosInstance.get(`/forum/news?skip=${skip}&limit=${limit}`, {
      extraOptions: {
        ...options,
      },
    });
  },

  async getUserForumPosts(
    userId: string,
    skip: number,
    limit = 20,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<IForumPostListItem[]>> {
    return axiosInstance.get(
      `/forum/posts/users/${userId}?skip=${skip}&limit=${limit}`,
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async getForumPostDetail(
    postId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<IForumPostListItem>> {
    return axiosInstance.get(`/forum/posts/${postId}`, {
      extraOptions: {
        ...options,
      },
    });
  },

  async upvoteForumPost(
    postId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.post(
      `/forum/posts/${postId}/upvotes`,
      {},
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async downvoteForumPost(
    postId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.post(
      `/forum/posts/${postId}/downvotes`,
      {},
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async unvoteForumPost(
    postId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.delete(`/forum/posts/${postId}/votes`, {
      extraOptions: {
        ...options,
      },
    });
  },

  async commentForumPost(
    postId: string,
    content: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<IComment>> {
    return axiosInstance.post(
      `/forum/posts/${postId}/comments`,
      { content: content },
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async replyForumPostComment(
    postId: string,
    commentId: string,
    content: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<IComment>> {
    return axiosInstance.post(
      `/forum/posts/${postId}/comments/${commentId}/comments`,
      { content: content },
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async upvoteForumPostComment(
    postId: string,
    commentId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.post(
      `/forum/posts/${postId}/comments/${commentId}/upvotes`,
      {},
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async downvoteForumPostComment(
    postId: string,
    commentId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.post(
      `/forum/posts/${postId}/comments/${commentId}/downvotes`,
      {},
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async unvoteForumPostComment(
    postId: string,
    commentId: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    return axiosInstance.delete(
      `/forum/posts/${postId}/comments/${commentId}/votes`,
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async getForumPostComments(
    postId: string,
    skip: number,
    limit = 20,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<ICommentListItem[]>> {
    return axiosInstance.get(
      `/forum/posts/${postId}/comments?skip=${skip}&limit=${limit}`,
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async getForumPostCommentRelies(
    postId: string,
    commentId: string,
    skip: number,
    limit = 20,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<ICommentListItem[]>> {
    return axiosInstance.get(
      `/forum/posts/${postId}/comments/${commentId}/comments?skip=${skip}&limit=${limit}`,
      {
        extraOptions: {
          ...options,
        },
      }
    );
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
