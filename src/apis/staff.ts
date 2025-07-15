import axios from "axios";
import { Category } from "./campaign";

const API_BASE = "http://localhost:4000";

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  createBy: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  startDate: Date;
  endDate: Date;
  gallery: string[];
  image: string;
  categories: Category[];
  status: "upcoming" | "in-progress" | "completed";
  acceptStatus: "pending" | "approved" | "rejected";
}

export interface Phase {
  _id: string;
  campaignId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "upcoming" | "in-progress" | "completed";
  phaseDays: PhaseDay[];
}

export interface PhaseDay {
  _id: string;
  phaseId: string;
  date: Date;
  checkinLocation: {
    type: "Point";
    coordinates: [number, number];
    address: string;
  };
  status: "upcoming" | "in-progress" | "completed";
  tasks: Task[];
}

export interface CreatePhasePayload {
  campaignId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface CreatePhaseDayPayload {
  date: Date;
  checkinLocation: {
    coordinates: [number, number];
    address: string;
  };
}

export interface CreateTaskPayload {
  name: string;
  description: string;
}

export interface Department {
  _id: string;
  campaignId: string;
  name: string;
  description: string;
  maxMembers: number;
  memberIds: string[];
}

export interface CreateDepartmentPayload {
  campaignId: string;
  name: string;
  description?: string;
  maxMembers?: number;
}

export interface Volunteer {
  id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    skills?: string[];
  };
  status: "pending" | "approved" | "rejected";
  departmentId?: string;
  registeredAt: Date;
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  };
};

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: {
    status:
      | "not-started"
      | "in_progress"
      | "submitted"
      | "approved"
      | "rejected";
    submittedAt?: Date;
    feedback?: string;
    evaluation?: "excellent" | "good" | "average" | "poor";
  };
  assignedUsers: string[];
  phaseDayId: string;
  campaignId: string;
  updatedAt: Date;
}

export const getStaffCampaigns = async (): Promise<Campaign[]> => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const response = await axios.get(`${API_BASE}/campaigns`, {
      params: {
        acceptStatus: "approved",
        createdBy: user._id,
      },
      headers: getAuthHeaders(),
    });

    if (
      response.data &&
      response.data.result &&
      response.data.result.campaigns
    ) {
      return response.data.result.campaigns.map((campaign: any) => ({
        ...campaign,
        _id: campaign._id,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching staff campaigns:", error);
    throw error;
  }
};

export const getPhasesByCampaignId = async (
  campaignId: string
): Promise<Phase[]> => {
  try {
    // Validate campaignId format
    if (!campaignId || !campaignId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid campaign ID format: ${campaignId}`);
    }

    console.log("API: Fetching phases for campaign:", campaignId);

    const response = await axios.get(`${API_BASE}/phase/${campaignId}/phases`, {
      headers: getAuthHeaders(),
    });

    console.log("API: Phases response:", response.data);

    // Handle both response.data and response.data.data cases
    const phasesData = response.data.data || response.data || [];

    return phasesData.map((phase: any) => ({
      _id: phase._id,
      campaignId: phase.campaignId,
      name: phase.name,
      description: phase.description || "",
      startDate: new Date(phase.startDate),
      endDate: new Date(phase.endDate),
      status: phase.status || "upcoming",
      phaseDays: (phase.phaseDays || []).map((day: any) => ({
        _id: day._id,
        phaseId: day.phaseId || phase._id,
        date: new Date(day.date),
        checkinLocation: day.checkinLocation,
        status: day.status || "upcoming",
        tasks: day.tasks || [],
      })),
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching phases:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to fetch phases"
      );
    } else {
      console.error("Error fetching phases:", error);
      throw new Error("Failed to fetch phases");
    }
  }
};

export const createPhase = async (
  payload: CreatePhasePayload
): Promise<Phase> => {
  try {
    // Clean campaign ID
    const cleanCampaignId = payload.campaignId.replace(/[^0-9a-fA-F]/g, "");
    if (cleanCampaignId.length !== 24) {
      throw new Error(`Invalid campaignId: ${cleanCampaignId}`);
    }

    // Create properly formatted dates (ensure they're valid Date objects first)
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format provided");
    }

    // Format dates to ISO string (UTC) - try both with and without campaignId in body
    const formattedPayload = {
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const response = await axios.post(
      `${API_BASE}/phase/${cleanCampaignId}/phases`,
      formattedPayload,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating phase:", error.response?.data);

      // Log detailed error information
      if (error.response) {
        console.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2)
        );
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        // Log specific error details if available
        if (error.response.data?.errors) {
          console.error(
            "Validation errors:",
            JSON.stringify(error.response.data.errors, null, 2)
          );
          error.response.data.errors.forEach((err: any, index: number) => {
            console.error(`Error ${index + 1}:`, JSON.stringify(err, null, 2));
          });
        }
      }

      // Create a more specific error message
      let errorMessage = "Failed to create phase";
      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        // Extract the first error message
        const firstError = error.response.data.errors[0];
        if (typeof firstError === "string") {
          errorMessage = firstError;
        } else if (firstError.message) {
          errorMessage = firstError.message;
        } else if (firstError.msg) {
          errorMessage = firstError.msg;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      throw new Error(errorMessage);
    } else {
      console.error("Error creating phase:", error);
      throw new Error("Failed to create phase");
    }
  }
};

export const updatePhase = async (
  phaseId: string,
  payload: Partial<Phase>
): Promise<Phase> => {
  try {
    const response = await axios.put(`${API_BASE}/phase/${phaseId}`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error updating phase:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to update phase"
      );
    } else {
      console.error("Error updating phase:", error);
      throw new Error("Failed to update phase");
    }
  }
};

export const deletePhase = async (phaseId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/phase/${phaseId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error deleting phase:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to delete phase"
      );
    } else {
      console.error("Error deleting phase:", error);
      throw new Error("Failed to delete phase");
    }
  }
};

export const createPhaseDay = async (
  phaseId: string,
  payload: CreatePhaseDayPayload
): Promise<PhaseDay> => {
  try {
    // Validate phaseId format
    if (!phaseId || !phaseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid phase ID format: ${phaseId}`);
    }

    // Ensure date is properly formatted
    const formattedPayload = {
      date: new Date(payload.date).toISOString(),
      checkinLocation: {
        type: "Point" as const,
        coordinates: payload.checkinLocation.coordinates,
        address: payload.checkinLocation.address,
      },
    };

    console.log(
      "API: Creating phase day with formatted payload:",
      formattedPayload
    );
    console.log("API: Phase ID:", phaseId);

    const response = await axios.post(
      `${API_BASE}/phase/${phaseId}/days`,
      formattedPayload,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log("API: Phase day creation response:", response.data);

    // Handle both response.data and response.data.data cases
    const responseData = response.data.data || response.data;

    return {
      _id: responseData._id || responseData.id,
      phaseId: responseData.phaseId || phaseId,
      date: new Date(responseData.date),
      checkinLocation: responseData.checkinLocation,
      status: responseData.status || "upcoming",
      tasks: responseData.tasks || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating phase day:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error config:", error.config);

      let errorMessage = "Failed to create phase day";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        errorMessage =
          error.response.data.errors[0].message ||
          error.response.data.errors[0];
      }

      throw new Error(errorMessage);
    } else {
      console.error("Error creating phase day:", error);
      throw new Error("Failed to create phase day");
    }
  }
};

export const updatePhaseDay = async (
  phaseDayId: string,
  payload: Partial<PhaseDay>
): Promise<PhaseDay> => {
  try {
    const response = await axios.patch(
      `${API_BASE}/phase/days/${phaseDayId}`,
      payload,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error updating phase day:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to update phase day"
      );
    } else {
      console.error("Error updating phase day:", error);
      throw new Error("Failed to update phase day");
    }
  }
};

export const deletePhaseDay = async (phaseDayId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/phase/days/${phaseDayId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting phase day:", error);
    throw new Error("Failed to delete phase day");
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/phase/tasks/${taskId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
};

// volunteer
export const acceptVolunteer = async (
  campaignId: string,
  userId: string
): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE}/campaigns/${campaignId}/accept/${userId}`,
      {},
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error("Error accepting volunteer:", error);
    throw new Error("Failed to accept volunteer");
  }
};

export const rejectVolunteer = async (
  campaignId: string,
  userId: string
): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE}/campaigns/${campaignId}/reject/${userId}`,
      {},
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error("Error rejecting volunteer:", error);
    throw new Error("Failed to reject volunteer");
  }
};

// Update getCampaignVolunteers to include user ID
export const getCampaignVolunteers = async (
  campaignId: string
): Promise<Volunteer[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}/campaigns/${campaignId}/volunteers`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.volunteers.map((vol: any) => ({
      userId: vol._id, // User ID
      user: {
        _id: vol.user._id, // User ID
        fullName: vol.user.fullName,
        email: vol.user.email,
        phone: vol.user.phone,
      },
      status: vol.status,
      departmentId: vol.departmentId,
      registeredAt: new Date(vol.registeredAt),
    }));
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    throw new Error("Failed to fetch volunteers");
  }
};

//Department 
export const getDepartmentsByCampaignId = async (
  campaignId: string
): Promise<Department[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}/campaigns/${campaignId}/departments`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.map((dept: any) => ({
      ...dept,
      _id: dept._id, // Map 'id' to '_id'
      createdAt: new Date(dept.createdAt),
      updatedAt: new Date(dept.updatedAt),
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching departments:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to fetch departments"
      );
    } else {
      console.error("Error fetching departments:", error);
      throw new Error("Failed to fetch departments");
    }
  }
};

export const getDepartmentsByVolunteerId = async (
  volunteerId: string
): Promise<Department[]> => {
  try {
    // Validate volunteerId format
    if (!volunteerId || !volunteerId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid volunteer ID format: ${volunteerId}`);
    }

    const response = await axios.get(
      `${API_BASE}/campaigns/departments/volunteer/${volunteerId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    // Handle both response.data and response.data.data cases
    const departmentsData = response.data.data || response.data || [];

    return departmentsData.map((dept: any) => ({
      _id: dept._id,
      campaignId: dept.campaignId,
      name: dept.name,
      description: dept.description || "",
      maxMembers: dept.maxMembers || 0,
      memberIds: dept.memberIds || [],
      createdAt: dept.createdAt ? new Date(dept.createdAt) : new Date(),
      updatedAt: dept.updatedAt ? new Date(dept.updatedAt) : new Date(),
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching departments by volunteer:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to fetch departments by volunteer"
      );
    } else {
      console.error("Error fetching departments by volunteer:", error);
      throw new Error("Failed to fetch departments by volunteer");
    }
  }
};

export const createDepartment = async (
  payload: CreateDepartmentPayload
): Promise<Department> => {
  try {
    // Extract campaignId and create a clean body without it
    const { campaignId, ...body } = payload;

    const response = await axios.post(
      `${API_BASE}/campaigns/${campaignId}/departments`,
      body, // Send only the department data without campaignId
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating department:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to create department"
      );
    } else {
      console.error("Error creating department:", error);
      throw new Error("Failed to create department");
    }
  }
};

export const updateDepartment = async (
  departmentId: string,
  payload: Partial<Department>
): Promise<Department> => {
  try {
    // Remove campaignId from payload if it exists
    const { campaignId, ...updateData } = payload;

    const response = await axios.put(
      `${API_BASE}/campaigns/departments/${departmentId}`,
      updateData, // Send only the update data
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error updating department:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to update department"
      );
    } else {
      console.error("Error updating department:", error);
      throw new Error("Failed to update department");
    }
  }
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/campaigns/departments/${departmentId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    throw new Error("Failed to delete department");
  }
};

export const addMemberToDepartment = async (
  departmentId: string,
  userId: string // Change to user ID
): Promise<Department> => {
  try {
    const response = await axios.patch(
      `${API_BASE}/campaigns/departments/${departmentId}/members/${userId}`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error adding member:", error);
    throw new Error("Failed to add member");
  }
};

export const removeMemberFromDepartment = async (
  departmentId: string,
  userId: string
): Promise<Department> => {
  try {
    const response = await axios.delete(
      `${API_BASE}/campaigns/departments/${departmentId}/members/${userId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error removing member:", error);
    throw new Error("Failed to remove member");
  }
};

//Task

export const getTasksByPhaseDayId = async (
  phaseDayId: string
): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_BASE}/phase/${phaseDayId}/tasks`, {
      headers: getAuthHeaders(),
    });

    // Log the raw response for debugging
    console.log("Raw tasks response:", response.data);

    // Handle both response.data and response.data.data cases
    const responseData = response.data.data || response.data;

    // Transform the backend response to match our frontend Task interface
    return responseData.map((task: any) => ({
      _id: task._id || task.id, // Use either _id or id from backend
      phaseDayId: task.phaseDayId,
      title: task.title || task.name, // Use either title or name from backend
      description: task.description,
      status: task.status || { status: "not-started" }, // Default status if missing
      assignedUsers:
        task.assignedUsers?.map((u: any) => u.userId._id || u._id) || [],
      campaignId: task.campaignId,
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
};

export const createTask = async (
  phaseDayId: string,
  payload: {
    title: string;
    description: string;
    status?: Task["status"];
    assignedUsers?: string[];
    phaseDayDate?: Date; // Use the passed date
  }
): Promise<Task> => {
  try {
    // Use the provided phaseDayDate or default to current date if not provided
    const phaseDayDate = payload.phaseDayDate ? new Date(payload.phaseDayDate) : new Date();

    // Set checkinTime to 7 AM and checkoutTime to 8 PM of the phaseDay date
    const checkinTime = new Date(phaseDayDate);
    checkinTime.setHours(7, 0, 0, 0); // 7:00 AM
    const checkoutTime = new Date(phaseDayDate);
    checkoutTime.setHours(20, 0, 0, 0); // 8:00 PM

    // Transform to backend format with calculated times
    const backendPayload = {
      ...payload,
      assignedUsers: (payload.assignedUsers || []).map((userId) => ({
        userId,
        checkinTime: checkinTime.toISOString(),
        checkoutTime: checkoutTime.toISOString(),
      })),
    };

    const response = await axios.post(
      `${API_BASE}/phase/${phaseDayId}/tasks`,
      backendPayload,
      { headers: getAuthHeaders() }
    );

    const taskData = response.data.data;
    return {
      ...taskData,
      assignedUsers: taskData.assignedUsers?.map((u: any) => u.userId) || [],
    };
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
};

export const updateTask = async (
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    status?: Partial<Task["status"]>;
    assignedUsers?: string[];
    evaluation?: "excellent" | "good" | "average" | "poor";
    feedback?: string;
    phaseDayDate?: Date; // Use the passed date
  }
): Promise<Task> => {
  try {
    // Validate task ID
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid task ID: ${taskId}`);
    }

    // Use the provided phaseDayDate or default to current date if not provided
    const phaseDayDate = payload.phaseDayDate ? new Date(payload.phaseDayDate) : new Date();

    // Set checkinTime to 7 AM and checkoutTime to 8 PM of the phaseDay date
    const checkinTime = new Date(phaseDayDate);
    checkinTime.setHours(7, 0, 0, 0); // 7:00 AM
    const checkoutTime = new Date(phaseDayDate);
    checkoutTime.setHours(20, 0, 0, 0); // 8:00 PM

    // Transform to backend format with calculated times
    const backendPayload = {
      ...payload,
      ...(payload.assignedUsers && {
        assignedUsers: payload.assignedUsers.map((userId) => ({
          userId,
          checkinTime: checkinTime.toISOString(),
          checkoutTime: checkoutTime.toISOString(),
        })),
      }),
    };

    const response = await axios.patch(
      `${API_BASE}/phase/tasks/${taskId}`,
      backendPayload,
      { headers: getAuthHeaders() }
    );

    const updatedTaskData = response.data.data || response.data;
    return {
      _id: updatedTaskData._id || updatedTaskData.id,
      phaseDayId: updatedTaskData.phaseDayId,
      title: updatedTaskData.title || updatedTaskData.name,
      description: updatedTaskData.description,
      status: updatedTaskData.status || { status: "not-started" },
      assignedUsers:
        updatedTaskData.assignedUsers?.map((u: any) => u.userId || u._id) || [],
      campaignId: updatedTaskData.campaignId,
      updatedAt: updatedTaskData.updatedAt ? new Date(updatedTaskData.updatedAt) : new Date(),
    };
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
};
