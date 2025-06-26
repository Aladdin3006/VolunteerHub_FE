const API_BASE = "http://localhost:4000";

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

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
  };
};

export const usersService = {
  // Get all users
  getAllUsers: async (filters: { role?: string; district?: string; province?: string } = {}): Promise<User[]> => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/users${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

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
  importStaff: async (data: ImportStaffData): Promise<{ successCount: number; failed: any[] }> => {
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
};

export default usersService;