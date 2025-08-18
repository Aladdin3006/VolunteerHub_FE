const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getUserProfile = async (userId: string, token: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const result = await response.json();
    return {
      user: result.user || result,
      message: result.message,
    };
  } catch (error) {
    console.error("Fetch user profile error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server");
    } else if (error instanceof Error) {
      throw new Error(`Fetch user profile failed: ${error.message}`);
    } else {
      throw new Error("Unknown error during user profile fetch");
    }
  }
};

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const result = await response.json();
    return {
      user: result.user || result,
      id: result.id,
      message: result.message,
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server");
    } else if (error instanceof Error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    } else {
      throw new Error("Unknown error during avatar upload");
    }
  }
};

export const getSkillsVolunteer = async (userId: string, token: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/skills`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const result = await response.json();
    return {
      message: result.message,
      data: result.data, // assuming this contains the skills array
    };
  } catch (error) {
    console.error("Get skills error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server");
    } else if (error instanceof Error) {
      throw new Error(`Get skills failed: ${error.message}`);
    } else {
      throw new Error("Unknown error during skills retrieval");
    }
  }
};

export const addSkillsToUser = async (
  userId: string,
  skills: string[],
  token: string
) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/skills`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skills }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const result = await response.json();
    return {
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("Add skills error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server");
    } else if (error instanceof Error) {
      throw new Error(`Add skills failed: ${error.message}`);
    } else {
      throw new Error("Unknown error during skills addition");
    }
  }
};

export const updateSkillsOfUser = async (
  userId: string,
  skills: string[],
  token: string
) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/skills`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skills }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const result = await response.json();
    return {
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("Update skills error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server");
    } else if (error instanceof Error) {
      throw new Error(`Update skills failed: ${error.message}`);
    } else {
      throw new Error("Unknown error during skills update");
    }
  }
};
