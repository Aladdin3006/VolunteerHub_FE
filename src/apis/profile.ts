const API_BASE = "http://localhost:4000";

export const updateUserAvatar = async (
  userId: string,
  avatarFile: File,
  token?: string
) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  try {
    const response = await fetch(`${API_BASE}/users/update-user/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
      body: formData,
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    return {
      user: result.user || result,  // Handle different response structures
      id: result.id,
      message: result.message,
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to server");
    } else if (error instanceof Error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    } else {
      throw new Error("Unknown error during avatar upload");
    }
  }
};