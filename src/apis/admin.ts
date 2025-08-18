const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  date_of_birth: string;
  status: "active" | "inactive";
  role: string;
  communeId?: string;
}

export interface CreateManagerData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  date_of_birth: string;
  communeId: string;
}

export interface CreateStaffData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  date_of_birth: string;
}

export interface ImportStaffData {
  file: File;
  role: string;
}

export interface Commune {
  id: string;
  name: string;
  district: string;
  province: string;
}

export interface Certificate {
  id: string;
  volunteerId: { id: string; fullName: string; email: string };
  campaignId: { id: string; name: string };
  fileUrl: string;
  verifyCode: string;
  issuedDate: string;
}

export interface Campaign {
  id: string;
  name: string;
}

export interface Donation {
  id: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCampaigns: number;
  totalDonations: number;
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
  };
};

export const usersService = {
  // Get all users
  getAllUsers: async (
    filters: { role?: string; district?: string; province?: string } = {}
  ): Promise<User[]> => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_BASE}/users${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    return data.data.map((item: any) => ({
      ...item,
      id: item._id || item.id,
      date_of_birth: item.date_of_birth || "",
      status: item.status || "active",
    }));
  },

  // Get all communes
  getAllCommunes: async (): Promise<Commune[]> => {
    const response = await fetch(`${API_BASE}/users/commune`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch communes");
    }

    const data = await response.json();
    return data.map((item: any) => ({
      id: item._id || item.id,
      name: item.name || "",
      district: item.district || "",
      province: item.province || "",
    }));
  },

  // Get all campaigns
  getAllCampaigns: async (): Promise<Campaign[]> => {
    const response = await fetch(`${API_BASE}/campaigns`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch campaigns");
    }

    const result = await response.json();
    // Extract campaigns from result.campaigns
    const data = Array.isArray(result.result?.campaigns)
      ? result.result.campaigns
      : [];

    return data.map((item: any) => ({
      id: item._id || item.id,
      name: item.name || "",
      description: item.description || "", // Include description if needed
    }));
  },

  // Get all donations
  getAllDonations: async (): Promise<Donation[]> => {
    const response = await fetch(`${API_BASE}/donate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch donations");
    }

    const result = await response.json();
    // Assuming the API returns { data: [...] }
    const data = Array.isArray(result.data)
      ? result.data
      : result.data
      ? [result.data]
      : [];
    return data.map((item: any) => ({
      id: item._id || item.id,
    }));
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const [campaigns, donations, allUsers] = await Promise.all([
        usersService.getAllCampaigns(),
        usersService.getAllDonations(),
        usersService.getAllUsers(), // Fetch all users without role filter for total count
      ]);

      const totalUsers = allUsers.length;
      const totalCampaigns = campaigns.length;
      const totalDonations = donations.length;

      return { totalUsers, totalCampaigns, totalDonations };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Create manager
  createManager: async (data: CreateManagerData): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE}/users/manager`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return {
        ...result.data,
        id: result.data._id || result.data.id,
      };
    } catch (error) {
      console.error("Create manager error:", error);
      throw error;
    }
  },

  // Create staff (organization)
  createStaff: async (data: CreateStaffData): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE}/users/create-organization`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return {
        ...result.data,
        id: result.data._id || result.data.id,
      };
    } catch (error) {
      console.error("Create staff error:", error);
      throw error;
    }
  },

  // Import staff from Excel
  importStaff: async (
    data: ImportStaffData
  ): Promise<{ successCount: number; failed: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("role", data.role);

      const response = await fetch(`${API_BASE}/users/import-staffs`, {
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
      console.error("Import staff error:", error);
      throw error;
    }
  },

  // Disable user
  disableUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/users/${id}/disable`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to disable user");
    }
  },

  // Enable user
  enableUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/users/${id}/enable`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to enable user");
    }
  },

  // Get all certificates
  getAllCertificates: async (
    params: {
      page?: number;
      limit?: number;
      searchUser?: string;
      searchCampaign?: string;
    } = {}
  ): Promise<{
    data: Certificate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> => {
    const query = new URLSearchParams({
      page: params.page?.toString() || "1",
      limit: params.limit?.toString() || "100",
      ...(params.searchUser && { searchUser: params.searchUser }),
      ...(params.searchCampaign && { searchCampaign: params.searchCampaign }),
      _ts: new Date().getTime().toString(),
    }).toString();

    const response = await fetch(
      `${API_BASE}/certificate${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    if (!response.ok && response.status !== 304) {
      throw new Error("Failed to fetch certificates");
    }

    if (response.status === 304) {
      return {
        data: [],
        pagination: {
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 20,
          total: 0,
        },
      };
    }

    const result = await response.json();
    const data = Array.isArray(result.data)
      ? result.data
      : result.result?.data || [];
    const pagination = result.pagination ||
      result.result?.pagination || {
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 20,
        total: 0,
      };

    return {
      data: data.map((item: any) => ({
        id: item._id || item.id,
        volunteerId: {
          id: item.volunteerId?._id || item.volunteerId?.id,
          fullName: item.volunteerId?.fullName,
          email: item.volunteerId?.email,
        },
        campaignId: {
          id: item.campaignId?._id || item.campaignId?.id,
          name: item.campaignId?.name,
        },
        fileUrl: item.fileUrl,
        verifyCode: item.verifyCode,
        issuedDate: item.issuedDate,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
      },
    };
  },

  deleteCertificate: async (certificateId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/certificate/${certificateId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Delete certificate error:", error);
      throw error;
    }
  },
};

export default usersService;
