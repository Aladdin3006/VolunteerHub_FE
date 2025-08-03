import axios from "axios";
import { IAxiosExtraConfigOptions, IDataResponseSuccess } from "./utils";

const API_BASE = "http://localhost:4000";

export interface Issue {
  _id: string;
  type: "task_issue" | "campaign_withdrawal";
  title: string;
  relatedEntity: {
    type: "Task" | "Campaign";
    entityId: string;
  };
  description: string;
  reportedBy: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  assignedTo?: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueData {
  type: "task_issue" | "campaign_withdrawal";
  title: string;
  relatedEntity: {
    type: "Task" | "Campaign";
    entityId: string;
  };
  status: "open" | "closed";
  description: string;
}

export const ISSUE_API = {
  async createIssue(
    data: CreateIssueData,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<Issue>> {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return axios.post(`${API_BASE}/issue`, data, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      extraOptions: {
        ...options,
      },
    });
  },

  async getIssues(
    filters: { type?: string; status?: string },
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<Issue[]>> {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const query = new URLSearchParams(filters).toString();
    return axios.get(`${API_BASE}/issue${query ? `?${query}` : ""}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      extraOptions: {
        ...options,
      },
    });
  },

  async getIssueById(
    id: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<Issue>> {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return axios.get(`${API_BASE}/issue/${id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      extraOptions: {
        ...options,
      },
    });
  },

  async updateIssue(
    id: string,
    data: Partial<CreateIssueData>,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<Issue>> {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return axios.put(`${API_BASE}/issue/${id}`, data, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      extraOptions: {
        ...options,
      },
    });
  },

  async deleteIssue(
    id: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<void> {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return axios.delete(`${API_BASE}/issue/${id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      extraOptions: {
        ...options,
      },
    });
  },
} as const;
