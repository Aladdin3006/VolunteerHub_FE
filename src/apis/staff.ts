import axios from "axios";
import { Category } from "./campaign";
import { log } from "console";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  createBy: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  phases: Phase[];
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
    avatar?: string;
    skills?: string[];
  };
  status: "pending" | "approved" | "rejected";
  departmentId?: string;
  registeredAt: Date;
}

export interface Checkin {
  _id: string;
  userId: string;
  campaignId: string;
  phaseId: string;
  phasedayId: string;
  method: "manual" | "qr" | "gps";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCheckinPayload {
  userId: string;
  campaignId: string;
  phaseId: string;
  phasedayId: string;
  method: "manual" | "qr" | "gps";
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
  phaseDayId: string;
  title: string;
  description?: string;
  leaderId: string;
  assignedUsers: {
    userId: {
      _id: string;
      fullName: string;
      email: string;
      phone: string;
      avatar?: string;
      skills?: string[];
      // Add other fields from the userId object as needed
    };
  }[];
  submission?: {
    content?: string;
    images: string[];
    submittedAt: Date;
    submittedBy: string;
  };
  peerReviews?: {
    reviewer: string;
    reviewee: string;
    score: number;
    comment?: string;
    reviewedAt: Date;
  }[];
  staffReview?: {
    evaluatedBy: string;
    finalScore?: number;
    overallComment?: string;
    reviewedAt: Date;
  };
  status: "in_progress" | "submitted" | "completed";
  campaignId?: string;
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

    const response = await axios.get(`${API_BASE}/phase/${campaignId}/phases`, {
      headers: getAuthHeaders(),
    });

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
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid start date");
    }
    if (isNaN(endDate.getTime())) {
      throw new Error("Invalid end date");
    }
    if (startDate >= endDate) {
      throw new Error("End date must be after start date");
    }

    const formattedPayload = {
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const response = await axios.post(
      `${API_BASE}/phase/${cleanCampaignId}/phases`,
      formattedPayload,
      { headers: getAuthHeaders() }
    );

    // Handle response
    const phaseData = response.data?.data;
    if (!phaseData?._id) {
      throw new Error("Invalid response format from server");
    }

    return {
      _id: phaseData._id,
      campaignId: phaseData.campaignId || cleanCampaignId,
      name: phaseData.name,
      description: phaseData.description || "",
      startDate: new Date(phaseData.startDate),
      endDate: new Date(phaseData.endDate),
      status: phaseData.status || "upcoming",
      phaseDays: phaseData.phaseDays || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating phase:", error.response?.data);
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to create phase"
      );
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

    const response = await axios.post(
      `${API_BASE}/phase/${phaseId}/days`,
      formattedPayload,
      {
        headers: getAuthHeaders(),
      }
    );

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

export const startPhase = async (phaseId: string): Promise<Phase> => {
  try {
    // Validate phaseId format
    if (!phaseId || !phaseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid phase ID format: ${phaseId}`);
    }

    const response = await axios.put(
      `${API_BASE}/phase/${phaseId}/start`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );

    const responseData = response.data.data || response.data;

    return {
      _id: responseData._id,
      campaignId: responseData.campaignId,
      name: responseData.name,
      description: responseData.description || "",
      startDate: new Date(responseData.startDate),
      endDate: new Date(responseData.endDate),
      status: responseData.status || "in-progress",
      phaseDays: (responseData.phaseDays || []).map((day: any) => ({
        _id: day._id,
        phaseId: day.phaseId || responseData._id,
        date: new Date(day.date),
        checkinLocation: day.checkinLocation,
        status: day.status || "upcoming",
        tasks: day.tasks || [],
      })),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error starting phase:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to start phase");
    } else {
      console.error("Error starting phase:", error);
      throw new Error("Failed to start phase");
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
        avatar: vol.user.avatar,
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
  volunteerId: string,
  campaignId: string
): Promise<Department[]> => {
  try {
    // Validate volunteerId and campaignId format
    if (!volunteerId || !volunteerId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid volunteer ID format: ${volunteerId}`);
    }
    if (!campaignId || !campaignId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid campaign ID format: ${campaignId}`);
    }

    const response = await axios.get(
      `${API_BASE}/campaigns/${campaignId}/departments/volunteer/${volunteerId}`,
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
      console.error(
        "Error fetching departments by volunteer:",
        error.response?.data
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch departments by volunteer"
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
    // Validate phaseDayId format
    if (!phaseDayId || !phaseDayId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid phaseDay ID format: ${phaseDayId}`);
    }

    const response = await axios.get(
      `${API_BASE}/task/phaseDay/${phaseDayId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    const tasksData = response.data.data || response.data;

    if (!tasksData) {
      return [];
    }

    const tasksArray = Array.isArray(tasksData) ? tasksData : [tasksData];

    return tasksArray.map((task: any) => ({
      _id: task._id || task.id,
      phaseDayId: task.phaseDayId || phaseDayId,
      title: task.title || task.name || "Untitled Task",
      description: task.description || "",
      leaderId: task.leaderId,
      assignedUsers:
        task.assignedUsers?.map((au: any) => ({
          userId: {
            _id: au.userId._id,
            fullName: au.userId.fullName,
            email: au.userId.email,
            phone: au.userId.phone,
            avatar: au.userId.avatar,
            skills: au.userId.skills,
            // Add other fields from userId as needed
          },
        })) || [],
      submission: task.submission
        ? {
            content: task.submission.content || "",
            images: task.submission.images || [],
            submittedAt: task.submission.submittedAt
              ? new Date(task.submission.submittedAt)
              : new Date(),
            submittedBy: task.submission.submittedBy || "",
          }
        : undefined,
      peerReviews:
        task.peerReviews?.map((pr: any) => ({
          reviewer: pr.reviewer,
          reviewee: pr.reviewee,
          score: pr.score,
          comment: pr.comment || "",
          reviewedAt: pr.reviewedAt ? new Date(pr.reviewedAt) : new Date(),
        })) || [],
      staffReview: task.staffReview
        ? {
            evaluatedBy: task.staffReview.evaluatedBy,
            finalScore: task.staffReview.finalScore,
            overallComment: task.staffReview.overallComment || "",
            reviewedAt: task.staffReview.reviewedAt
              ? new Date(task.staffReview.reviewedAt)
              : new Date(),
          }
        : undefined,
      status: task.status || "in_progress",
      campaignId: task.campaignId,
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching tasks:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to fetch tasks");
    } else {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks");
    }
  }
};

export const createTask = async (
  phaseDayId: string,
  payload: {
    title: string;
    description: string;
    leaderId: string;
    assignedUsers?: string[];
    phaseDayDate?: Date;
    submission?: {
      content?: string;
      images?: string[];
      submittedBy?: string;
    };
  }
): Promise<Task> => {
  try {
    const phaseDayDate = payload.phaseDayDate
      ? new Date(payload.phaseDayDate)
      : new Date();
    const checkinTime = new Date(phaseDayDate);
    checkinTime.setHours(7, 0, 0, 0);
    const checkoutTime = new Date(phaseDayDate);
    checkoutTime.setHours(20, 0, 0, 0);

    const backendPayload = {
      title: payload.title,
      description: payload.description,
      leaderId: payload.leaderId,
      assignedUsers: (payload.assignedUsers || []).map((userId) => ({
        userId,
      })),
      submission: payload.submission
        ? {
            content: payload.submission.content || "",
            images: payload.submission.images || [],
            submittedAt: new Date(),
            submittedBy: payload.submission.submittedBy || "",
          }
        : undefined,
    };

    const response = await axios.post(
      `${API_BASE}/task/create/${phaseDayId}`,
      backendPayload,
      { headers: getAuthHeaders() }
    );

    const taskData = response.data.data;
    return {
      _id: taskData._id,
      phaseDayId: taskData.phaseDayId || phaseDayId,
      title: taskData.title,
      description: taskData.description,
      leaderId: taskData.leaderId,
      assignedUsers:
        taskData.assignedUsers?.map((au: any) => ({
          userId: au.userId,
        })) || [],
      submission: taskData.submission
        ? {
            content: taskData.submission.content || "",
            images: taskData.submission.images || [],
            submittedAt: taskData.submission.submittedAt
              ? new Date(taskData.submission.submittedAt)
              : new Date(),
            submittedBy: taskData.submission.submittedBy || "",
          }
        : undefined,
      peerReviews:
        taskData.peerReviews?.map((pr: any) => ({
          reviewer: pr.reviewer,
          reviewee: pr.reviewee,
          score: pr.score,
          comment: pr.comment || "",
          reviewedAt: pr.reviewedAt ? new Date(pr.reviewedAt) : new Date(),
        })) || [],
      staffReview: taskData.staffReview
        ? {
            evaluatedBy: taskData.staffReview.evaluatedBy,
            finalScore: taskData.staffReview.finalScore,
            overallComment: taskData.staffReview.overallComment || "",
            reviewedAt: taskData.staffReview.reviewedAt
              ? new Date(taskData.staffReview.reviewedAt)
              : new Date(),
          }
        : undefined,
      status: taskData.status || "in_progress",
      campaignId: taskData.campaignId,
      updatedAt: taskData.updatedAt ? new Date(taskData.updatedAt) : new Date(),
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
    leaderId?: string;
    assignedUsers?: string[];
    phaseDayDate?: Date;
    submission?: {
      content?: string;
      images?: string[];
      submittedBy?: string;
    };
  }
): Promise<Task> => {
  try {
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid task ID: ${taskId}`);
    }

    const backendPayload = {
      title: payload.title,
      description: payload.description,
      leaderId: payload.leaderId,
      assignedUsers: payload.assignedUsers?.map((userId) => ({ userId })),
      submission: payload.submission
        ? {
            content: payload.submission.content || "",
            images: payload.submission.images || [],
            submittedAt: new Date(),
            submittedBy: payload.submission.submittedBy || "",
          }
        : undefined,
    };

    const response = await axios.patch(
      `${API_BASE}/task/update/${taskId}`,
      backendPayload,
      { headers: getAuthHeaders() }
    );

    const updatedTaskData = response.data.data || response.data;
    return {
      _id: updatedTaskData._id || updatedTaskData.id,
      phaseDayId: updatedTaskData.phaseDayId,
      title: updatedTaskData.title || updatedTaskData.name,
      description: updatedTaskData.description,
      leaderId: updatedTaskData.leaderId,
      assignedUsers:
        updatedTaskData.assignedUsers?.map((au: any) => ({
          userId: au.userId || au._id,
        })) || [],
      submission: updatedTaskData.submission
        ? {
            content: updatedTaskData.submission.content || "",
            images: updatedTaskData.submission.images || [],
            submittedAt: updatedTaskData.submission.submittedAt
              ? new Date(updatedTaskData.submission.submittedAt)
              : new Date(),
            submittedBy: updatedTaskData.submission.submittedBy || "",
          }
        : undefined,
      peerReviews:
        updatedTaskData.peerReviews?.map((pr: any) => ({
          reviewer: pr.reviewer,
          reviewee: pr.reviewee,
          score: pr.score,
          comment: pr.comment || "",
          reviewedAt: pr.reviewedAt ? new Date(pr.reviewedAt) : new Date(),
        })) || [],
      staffReview: updatedTaskData.staffReview
        ? {
            evaluatedBy: updatedTaskData.staffReview.evaluatedBy,
            finalScore: updatedTaskData.staffReview.finalScore,
            overallComment: updatedTaskData.staffReview.overallComment || "",
            reviewedAt: updatedTaskData.staffReview.reviewedAt
              ? new Date(updatedTaskData.staffReview.reviewedAt)
              : new Date(),
          }
        : undefined,
      status: updatedTaskData.status || "in_progress",
      campaignId: updatedTaskData.campaignId,
      updatedAt: updatedTaskData.updatedAt
        ? new Date(updatedTaskData.updatedAt)
        : new Date(),
    };
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid task ID: ${taskId}`);
    }
    await axios.delete(`${API_BASE}/task/delete/${taskId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
};

export const assignTaskToUsers = async (
  taskId: string,
  userIds: string[]
): Promise<Task> => {
  try {
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid task ID: ${taskId}`);
    }
    const response = await axios.post(
      `${API_BASE}/task/${taskId}/assign`,
      { userIds },
      { headers: getAuthHeaders() }
    );

    const taskData = response.data.data || response.data;
    return {
      _id: taskData._id,
      phaseDayId: taskData.phaseDayId,
      title: taskData.title,
      description: taskData.description,
      leaderId: taskData.leaderId,
      assignedUsers:
        taskData.assignedUsers?.map((au: any) => ({
          userId: au.userId,
        })) || [],
      submission: taskData.submission
        ? {
            content: taskData.submission.content || "",
            images: taskData.submission.images || [],
            submittedAt: taskData.submission.submittedAt
              ? new Date(taskData.submission.submittedAt)
              : new Date(),
            submittedBy: taskData.submission.submittedBy || "",
          }
        : undefined,
      peerReviews:
        taskData.peerReviews?.map((pr: any) => ({
          reviewer: pr.reviewer,
          reviewee: pr.reviewee,
          score: pr.score,
          comment: pr.comment || "",
          reviewedAt: pr.reviewedAt ? new Date(pr.reviewedAt) : new Date(),
        })) || [],
      staffReview: taskData.staffReview
        ? {
            evaluatedBy: taskData.staffReview.evaluatedBy,
            finalScore: taskData.staffReview.finalScore,
            overallComment: taskData.staffReview.overallComment || "",
            reviewedAt: taskData.staffReview.reviewedAt
              ? new Date(taskData.staffReview.reviewedAt)
              : new Date(),
          }
        : undefined,
      status: taskData.status || "in_progress",
      campaignId: taskData.campaignId,
      updatedAt: taskData.updatedAt ? new Date(taskData.updatedAt) : new Date(),
    };
  } catch (error) {
    console.error("Error assigning task:", error);
    throw new Error("Failed to assign task");
  }
};

export const staffReviewTask = async (
  taskId: string,
  staffId: string,
  finalScore: number,
  overallComment: string
): Promise<Task> => {
  try {
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid task ID: ${taskId}`);
    }
    if (!staffId || !staffId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid staff ID: ${staffId}`);
    }

    const response = await axios.post(
      `${API_BASE}/task/${taskId}/review/${staffId}`,
      {
        finalScore,
        overallComment,
      },
      { headers: getAuthHeaders() }
    );

    const updatedTaskData = response.data.task;
    return {
      _id: updatedTaskData._id,
      phaseDayId: updatedTaskData.phaseDayId,
      title: updatedTaskData.title,
      description: updatedTaskData.description,
      leaderId: updatedTaskData.leaderId,
      assignedUsers:
        updatedTaskData.assignedUsers?.map((au: any) => ({
          userId: au.userId,
        })) || [],
      submission: updatedTaskData.submission
        ? {
            content: updatedTaskData.submission.content || "",
            images: updatedTaskData.submission.images || [],
            submittedAt: updatedTaskData.submission.submittedAt
              ? new Date(updatedTaskData.submission.submittedAt)
              : new Date(),
            submittedBy: updatedTaskData.submission.submittedBy || "",
          }
        : undefined,
      peerReviews:
        updatedTaskData.peerReviews?.map((pr: any) => ({
          reviewer: pr.reviewer,
          reviewee: pr.reviewee,
          score: pr.score,
          comment: pr.comment || "",
          reviewedAt: pr.reviewedAt ? new Date(pr.reviewedAt) : new Date(),
        })) || [],
      staffReview: updatedTaskData.staffReview
        ? {
            evaluatedBy: updatedTaskData.staffReview.evaluatedBy,
            finalScore: updatedTaskData.staffReview.finalScore,
            overallComment: updatedTaskData.staffReview.overallComment || "",
            reviewedAt: updatedTaskData.staffReview.reviewedAt
              ? new Date(updatedTaskData.staffReview.reviewedAt)
              : new Date(),
          }
        : undefined,
      status: updatedTaskData.status || "completed",
      campaignId: updatedTaskData.campaignId,
      updatedAt: updatedTaskData.updatedAt
        ? new Date(updatedTaskData.updatedAt)
        : new Date(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error submitting staff review:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to submit staff review"
      );
    } else {
      console.error("Error submitting staff review:", error);
      throw new Error("Failed to submit staff review");
    }
  }
};

//check-in manual

export const createManualCheckin = async (
  payload: Omit<CreateCheckinPayload, "method">
): Promise<Checkin> => {
  try {
    // Add manual method to payload
    const manualCheckinPayload: CreateCheckinPayload = {
      ...payload,
      method: "manual",
    };

    const response = await axios.post(
      `${API_BASE}/checkin`,
      manualCheckinPayload,
      {
        headers: getAuthHeaders(),
      }
    );

    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating manual check-in:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to create manual check-in"
      );
    } else {
      console.error("Error creating manual check-in:", error);
      throw new Error("Failed to create manual check-in");
    }
  }
};

/**
 * Get check-in list for a specific phase day
 */
export const getCheckinListByPhaseDay = async (
  phasedayId: string
): Promise<
  Array<{
    userId: string;
    fullName: string;
    checkin: boolean;
    method?: string;
    checkinAt?: Date;
  }>
> => {
  try {
    const response = await axios.get(`${API_BASE}/checkin/${phasedayId}`, {
      headers: getAuthHeaders(),
    });

    // Convert string dates to Date objects
    return response.data.map((item: any) => ({
      ...item,
      checkinAt: item.checkinAt ? new Date(item.checkinAt) : undefined,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching check-in list:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to fetch check-in list"
      );
    } else {
      console.error("Error fetching check-in list:", error);
      throw new Error("Failed to fetch check-in list");
    }
  }
};
