const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    if (Array.isArray(result.errors)) {
      const messages = result.errors.map((err: any) => err.msg).join("\n");
      throw new Error(messages);
    }
    throw new Error(result.message || "Login failed");
  }

  return {
    user: {
      ...result.result, // user profile fields
      id: result.id,
      role: result.role,
      token: result.access_token,
      expiresAt: result.expires_at,
    },
  };
};

export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE}/dashboard/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add authorization token if required, e.g., from loginUser
      // "Authorization": `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch dashboard stats");
  }

  return result.result;
};
