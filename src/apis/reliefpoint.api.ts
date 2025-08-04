// Nếu chưa có types, bạn có thể định nghĩa interface ReliefPoint ở đây dựa trên schema
interface ReliefPoint {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  type: 'need' | 'supply';
  stormId: string; // ObjectId as string
  needs?: Array<{
    type: 'người mắc kẹt' | 'bị thương' | 'thiếu đồ ăn' | 'thiếu nước' | 'thiếu thuốc' | 'khác';
    quantity?: number;
    note?: string;
  }>;
  surplus?: Array<{
    type: 'thực phẩm' | 'nước uống' | 'quần áo' | 'thuốc men' | 'chăn màn' | 'dụng cụ y tế' | 'khác';
    quantity?: number;
    note?: string;
  }>;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  contact?: string;
  verified: boolean;
  verifiedBy?: string; // ObjectId as string
  responders?: Array<{
    userId: string;
    note?: string;
    joinedAt?: string; // Date as ISO string
  }>;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdBy?: string; // ObjectId as string
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
}

const BASE_URL = 'http://localhost:4000/relief-point'; // Thay đổi nếu cần (ví dụ: process.env.API_URL)

export const ReliefPointAPI = {
  // Tạo mới điểm cứu trợ
  createReliefPoint: async (data: Partial<ReliefPoint>): Promise<ReliefPoint> => {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần auth: 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi tạo điểm cứu trợ:', error);
      throw error;
    }
  },

  // Lấy danh sách điểm cứu trợ với filters
  getAllReliefPoints: async (filters: {
    stormId?: string;
    type?: 'need' | 'supply';
    verified?: boolean;
    status?: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  } = {}): Promise<ReliefPoint[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.stormId) params.append('stormId', filters.stormId);
      if (filters.type) params.append('type', filters.type);
      if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`${BASE_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi tải danh sách điểm cứu trợ:', error);
      return [];
    }
  },

  // Lấy chi tiết một điểm cứu trợ theo ID
  getReliefPointById: async (id: string): Promise<ReliefPoint | null> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi tải chi tiết điểm cứu trợ:', error);
      return null;
    }
  },

  // Xác minh điểm cứu trợ (cần auth nếu có)
  verifyReliefPoint: async (id: string): Promise<ReliefPoint> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần auth: 'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi xác minh điểm cứu trợ:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái điểm cứu trợ
  updateStatus: async (id: string, status: 'pending' | 'in-progress' | 'resolved' | 'rejected'): Promise<ReliefPoint> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần auth: 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      throw error;
    }
  },

  // Đăng ký hỗ trợ cho điểm cứu trợ (cần auth nếu có)
  respondToReliefPoint: async (id: string, note?: string): Promise<ReliefPoint> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần auth: 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi đăng ký hỗ trợ:', error);
      throw error;
    }
  },

  // Xóa điểm cứu trợ theo ID
  deleteReliefPoint: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần auth: 'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa điểm cứu trợ:', error);
      throw error;
    }
  },
};