import { getAccessToken, handleResponse } from "./utils";

/**
 * A simple tag
 * @link models\category.model.js
 */
export interface ITag {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

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

/**
 * Fetch the forum data
 * @param skip
 * @param limit
 * @returns
 */
export const getForumPosts = async (
  skip: number,
  limit: number
): Promise<{ data: IForumPost[] }> => {
  const result: IForumPost[] = [];
  for (let i = 0; i < limit; ++i) {
    result.push(fakeAnForumPosts());
  }
  return {
    data: result,
  };
};

let id = 0;
const fakeAnForumPosts = (): IForumPost => {
  let _id = String(++id);
  return {
    _id: _id,
    commentsCount: 100,
    content:
      "This is a sample postttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt",
    createdAt: new Date().toISOString(),
    downvotes: ["a", "b", "c"],
    upvotes: ["a", "b", "c"],
    images: [
      "https://media.gettyimages.com/id/1382389831/photo/volunteering-for-the-community.jpg?s=612x612&w=gi&k=20&c=FfKQmYoNrWEiPKKB4IqmxV9NT1wn9OyV_BOYeOpLqec=",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1WDk9rj5CpVOyH_6T4CHmXmWh_6ljyvQhpg&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbddISqvE7qVgYGXzWCX5_vJWQUl6EuP3j2w&s",
      "https://www.globalcops.org/wp-content/uploads/2017/07/VOLUNTEER-770x330.jpg",
    ],
    tags: [
      {
        _id: "0",
        color: "red",
        name: "Tag1",
        icon: "https://www.svgrepo.com/show/532036/cloud-rain-alt.svg",
      },
      {
        _id: "1",
        name: "Tag2",
        color: "green",
        icon: "https://www.svgrepo.com/show/532036/cloud-rain-alt.svg",
      },
    ],
    updatedAt: new Date().toISOString(),
    createdBy: {
      _id: "0",
      fullName: "Test user",
      avatar:
        "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
    },
    comments: [
      {
        _id: "0",
        content:
          "Comment 1 shdafhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
        createdAt: new Date().toISOString(),
        createdBy: {
          _id: "0",
          fullName: "Test user",
          avatar:
            "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
        },
        downvotes: ["a", "b", "c"],
        upvotes: ["a", "b", "c"],
        parentComment: "a",
        updatedAt: new Date().toISOString(),
        comments: [
          {
            _id: "1",
            content:
              "Rep Comment 1ákjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
            createdAt: new Date().toISOString(),
            createdBy: {
              _id: "0",
              fullName: "Test user",
              avatar:
                "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
            },
            downvotes: ["a", "b", "c"],
            upvotes: ["a", "b", "c"],
            parentComment: "a",
            updatedAt: new Date().toISOString(),
            comments: [],
          },
          {
            _id: "2",
            content:
              "Rep Comment 1ákjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
            createdAt: new Date().toISOString(),
            createdBy: {
              _id: "0",
              fullName: "Test user",
              avatar:
                "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
            },
            downvotes: ["a", "b", "c"],
            upvotes: ["a", "b", "c"],
            parentComment: "a",
            updatedAt: new Date().toISOString(),
            comments: [],
          },
        ],
      },
      {
        _id: "0",
        content:
          "Comment 1 shdafhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
        createdAt: new Date().toISOString(),
        createdBy: {
          _id: "0",
          fullName: "Test user",
          avatar:
            "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
        },
        downvotes: ["a", "b", "c"],
        upvotes: ["a", "b", "c"],
        parentComment: "a",
        updatedAt: new Date().toISOString(),
        comments: [
          {
            _id: "1",
            content:
              "Rep Comment 1ákjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
            createdAt: new Date().toISOString(),
            createdBy: {
              _id: "0",
              fullName: "Test user",
              avatar:
                "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
            },
            downvotes: ["a", "b", "c"],
            upvotes: ["a", "b", "c"],
            parentComment: "a",
            updatedAt: new Date().toISOString(),
            comments: [],
          },
          {
            _id: "2",
            content:
              "Rep Comment 1ákjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
            createdAt: new Date().toISOString(),
            createdBy: {
              _id: "0",
              fullName: "Test user",
              avatar:
                "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
            },
            downvotes: ["a", "b", "c"],
            upvotes: ["a", "b", "c"],
            parentComment: "a",
            updatedAt: new Date().toISOString(),
            comments: [],
          },
        ],
      },
    ],
  };
};

const API_BASE = "http://localhost:4000";

export interface IForumPostData {
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
}

export interface ICommentListItem {
  _id: string;
  content: string;
  createdAt: string;
  commentsCount: number;
  isUpvoted: boolean;
  isDownvoted: boolean;
  createdBy: IUserShort;
}

export const FORUM_API = {
  async createNewPost(data: IForumPostData) {
    const response = await fetch(`${API_BASE}/forum`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<unknown, unknown>(response);
  },

  async updatePost(postId: string, data: IForumPostData) {
    const response = await fetch(`${API_BASE}/forum/${postId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<unknown, unknown>(response);
  },

  async deletePost(postId: string) {
    const response = await fetch(`${API_BASE}/forum/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<unknown, unknown>(response);
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
    return handleResponse<IForumPostListItem[], IForumPostListItem[]>(response);
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
    return handleResponse<IForumPostListItem[], IForumPostListItem[]>(response);
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
    return handleResponse<IForumPostListItem[], IForumPostListItem[]>(response);
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
    return handleResponse<IForumPostListItem[], IForumPostListItem[]>(response);
  },

  async getForumPostDetail(postId: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<IForumPostListItem, IForumPostListItem>(response);
  },

  async upvoteForumPost(postId: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}/upvotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<unknown, unknown>(response);
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
    return handleResponse<unknown, unknown>(response);
  },

  async unvoteForumPost(postId: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}/votes`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<unknown, unknown>(response);
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
    return handleResponse<IUserShort[], IUserShort[]>(response);
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
    return handleResponse<IUserShort[], IUserShort[]>(response);
  },

  async commentForumPost(postId: string, content: string) {
    const response = await fetch(`${API_BASE}/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
      body: JSON.stringify({ content: content }),
    });
    return handleResponse<unknown, unknown>(response);
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
        },
        body: JSON.stringify({ content: content }),
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
    return handleResponse<unknown, unknown>(response);
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
    return handleResponse<unknown, unknown>(response);
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
    return handleResponse<unknown, unknown>(response);
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
    return handleResponse<ICommentListItem[], ICommentListItem[]>(response);
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
    return handleResponse<ICommentListItem[], ICommentListItem[]>(response);
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
    return handleResponse<IUserShort[], IUserShort[]>(response);
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
    return handleResponse<IUserShort[], IUserShort[]>(response);
  },
} as const;
