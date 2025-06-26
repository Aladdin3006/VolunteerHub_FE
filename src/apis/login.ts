const API_BASE = "http://localhost:4000";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
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
    },
  };
};
