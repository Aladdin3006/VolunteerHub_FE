const API_BASE = "http://localhost:4000";

export const resetPassword = async (data: { email: string }) => {
  const response = await fetch(`${API_BASE}/users/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send reset password link");
  }

  return result;
};

export const resetPasswordFinal = async (data: { token: string; newPassword: string }) => {
  const response = await fetch(`${API_BASE}/users/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to reset password");
  }

  return result;
};

