import { getAccessToken } from "./utils";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** ================================
 * 🧠 Interface kiểu dữ liệu Storm
================================ */
export interface Storm {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  centerLocation?: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  status: "active" | "ended";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface StormPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  centerLocation?: {
    lat: number;
    lng: number;
  };
  isActive?: boolean;
  startDate?: string;
}

/** ================================
 * 🚀 API gọi tới backend
================================ */
export const StormAPI = {
  async createStorm(data: StormPayload): Promise<Storm> {
    const res = await fetch(`${API_BASE}/storm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Tạo bão thất bại");
    return res.json();
  },

  async getActiveStorm(): Promise<Storm | null> {
    const res = await fetch(`${API_BASE}/storm/active`, {
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });

    if (!res.ok) return null;
    return res.json();
  },

  async getAllStorms(): Promise<Storm[]> {
    const res = await fetch(`${API_BASE}/storm`, {
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });

    if (!res.ok) throw new Error("Lỗi khi lấy danh sách bão");
    return res.json();
  },

  async deactivateStorm(id: string): Promise<Storm> {
    const res = await fetch(`${API_BASE}/storm/${id}/deactivate`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Không thể kết thúc bão");
    return res.json();
  },

   async activateStorm(id: string): Promise<Storm> {
    const res = await fetch(`${API_BASE}/storm/${id}/activate`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Không thể bắt đầu bão");
    return res.json();
  },
};
