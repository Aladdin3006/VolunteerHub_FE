// types
interface ReliefPoint {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  type: "need" | "supply";
  stormId: string;
  needs?: Array<{
    type:
    | "người mắc kẹt"
    | "bị thương"
    | "thiếu đồ ăn"
    | "thiếu nước"
    | "thiếu thuốc"
    | "khác";
    quantity?: number;
    note?: string;
  }>;
  surplus?: Array<{
    type:
    | "thực phẩm"
    | "nước uống"
    | "quần áo"
    | "thuốc men"
    | "chăn màn"
    | "dụng cụ y tế"
    | "khác";
    quantity?: number;
    note?: string;
  }>;
  status: "pending" | "in-progress" | "resolved" | "rejected";
  contact?: string;
  verified: boolean;
  verifiedBy?: string;
  responders?: Array<{
    userId: string;
    note?: string;
    joinedAt?: string;
  }>;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  createdBy?: string;
  rescueStatus?: boolean;
  rescueList?: Array<{
    rescuedAt?: string;
    rescueNote?: string;
    rescueProofs?: Array<{
      images: string[];
      note?: string;
      uploadedAt?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

type RescuePayload = {
  images?: File[];
  rescueNote?: string;
  note?: string;
  rescuedAt?: string;
  markAsRescued?: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE}/relief-point`;

export const ReliefPointAPI = {
  createReliefPoint: async (data: Partial<ReliefPoint>): Promise<ReliefPoint> => {
    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getAllReliefPoints: async (filters: {
    stormId?: string;
    type?: "need" | "supply";
    verified?: boolean;
    status?: "pending" | "in-progress" | "resolved" | "rejected";
  } = {}): Promise<ReliefPoint[]> => {
    const params = new URLSearchParams();
    if (filters.stormId) params.append("stormId", filters.stormId);
    if (filters.type) params.append("type", filters.type);
    if (filters.verified !== undefined) params.append("verified", String(filters.verified));
    if (filters.status) params.append("status", filters.status);
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  getReliefPointById: async (id: string): Promise<ReliefPoint | null> => {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  verifyReliefPoint: async (id: string): Promise<ReliefPoint> => {
    const res = await fetch(`${BASE_URL}/${id}/verify`, { method: "PATCH" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  updateStatus: async (
    id: string,
    status: "pending" | "in-progress" | "resolved" | "rejected"
  ): Promise<ReliefPoint> => {
    const res = await fetch(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  respondToReliefPoint: async (id: string, note?: string): Promise<ReliefPoint> => {
    const res = await fetch(`${BASE_URL}/${id}/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  deleteReliefPoint: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  addRescueEntry: async (id: string, payload: RescuePayload): Promise<ReliefPoint> => {
    const fd = new FormData();
    if (payload.images) payload.images.forEach(f => fd.append("images", f));
    if (payload.rescueNote) fd.append("rescueNote", payload.rescueNote);
    if (payload.note) fd.append("note", payload.note);
    if (payload.rescuedAt) fd.append("rescuedAt", payload.rescuedAt);
    if (payload.markAsRescued !== undefined) fd.append("markAsRescued", String(payload.markAsRescued));
    const res = await fetch(`${BASE_URL}/${id}/rescues`, {
      method: "POST",
      body: fd
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};
