const API_BASE = "http://localhost:4000";

export const registerUser = async (data: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  date_of_birth: string;
}) => {
  const response = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    // Handle structured errors array
    if (Array.isArray(result.errors)) {
      const messages = result.errors.map((err: any) => err.msg).join("\n");
      throw new Error(messages);
    }
    throw new Error(result.message || "Registration failed");
  }

  return result;
};
