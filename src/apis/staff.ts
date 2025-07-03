// src/services/staff.ts
import axios from "axios";
import { Campaign } from "./campaign";

const API_BASE = "http://localhost:4000";

/* ---------- Phase Interfaces ---------- */
export interface Phase {
  _id: string;
  campaignId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "in-progress" | "completed";
  phaseDays: PhaseDay[];
}

export interface PhaseDay {
  _id: string;
  phaseId: string;
  date: string;
  checkinLocation: {
    type: "Point";
    coordinates: [number, number];
    address: string;
  };
  status: "upcoming" | "in-progress" | "completed";
  tasks: Task[];
}

export interface Task {
  _id: string;
  name: string;
  description: string;
}

export interface CreatePhasePayload {
  campaignId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CreatePhaseDayPayload {
  date: string;
  checkinLocation: {
    coordinates: [number, number];
    address: string;
  };
}

export interface CreateTaskPayload {
  name: string;
  description: string;
}

/* ---------- Department Interfaces ---------- */
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

/* ---------- Phase API Calls ---------- */
export const createPhase = async (payload: CreatePhasePayload): Promise<Phase> => {
  try {
    const response = await axios.post(`${API_BASE}/phases/campaigns/${payload.campaignId}/phases`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating phase:", error);
      throw new Error(error.response?.data?.message || "Failed to create phase");
    } else {
      console.error("Error creating phase:", error);
      throw new Error("Failed to create phase");
    }
  }
};

export const updatePhase = async (phaseId: string, payload: Partial<Phase>): Promise<Phase> => {
  try {
    const response = await axios.put(`${API_BASE}/phases/${phaseId}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating phase:", error);
    throw new Error( "Failed to update phase");
  }
};

export const deletePhase = async (phaseId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/phases/${phaseId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
  } catch (error) {
    console.error("Error deleting phase:", error);
    throw new Error( "Failed to delete phase");
  }
};

export const createPhaseDay = async (phaseId: string, payload: CreatePhaseDayPayload): Promise<PhaseDay> => {
  try {
    const response = await axios.post(`${API_BASE}/phases/${phaseId}/days`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating phase day:", error);
    throw new Error( "Failed to create phase day");
  }
};

export const updatePhaseDay = async (phaseDayId: string, payload: Partial<PhaseDay>): Promise<PhaseDay> => {
  try {
    const response = await axios.patch(`${API_BASE}/phases/days/${phaseDayId}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating phase day:", error);
    throw new Error( "Failed to update phase day");
  }
};

export const deletePhaseDay = async (phaseDayId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/phases/days/${phaseDayId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
  } catch (error) {
    console.error("Error deleting phase day:", error);
    throw new Error( "Failed to delete phase day");
  }
};

export const createTask = async (phaseDayId: string, payload: CreateTaskPayload): Promise<Task> => {
  try {
    const response = await axios.post(`${API_BASE}/phases/${phaseDayId}/tasks`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error( "Failed to create task");
  }
};

export const updateTask = async (taskId: string, payload: Partial<Task>): Promise<Task> => {
  try {
    const response = await axios.patch(`${API_BASE}/phases/tasks/${taskId}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error( "Failed to update task");
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/phases/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error( "Failed to delete task");
  }
};

/* ---------- Department API Calls ---------- */
export const createDepartment = async (payload: CreateDepartmentPayload): Promise<Department> => {
  try {
    const response = await axios.post(
      `${API_BASE}/campaigns/${payload.campaignId}/departments`, 
      payload,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw new Error( "Failed to create department");
  }
};

export const updateDepartment = async (departmentId: string, payload: Partial<Department>): Promise<Department> => {
  try {
    const response = await axios.put(
      `${API_BASE}/campaigns/departments/${departmentId}`, 
      payload,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating department:", error);
    throw new Error( "Failed to update department");
  }
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/campaigns/departments/${departmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    throw new Error( "Failed to delete department");
  }
};

export const addMemberToDepartment = async (departmentId: string, userId: string): Promise<Department> => {
  try {
    const response = await axios.patch(
      `${API_BASE}/campaigns/departments/${departmentId}/members`, 
      { userId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error adding member:", error);
    throw new Error( "Failed to add member");
  }
};

export const removeMemberFromDepartment = async (departmentId: string, userId: string): Promise<Department> => {
  try {
    const response = await axios.delete(
      `${API_BASE}/campaigns/departments/${departmentId}/members/${userId}`, 
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error removing member:", error);
    throw new Error( "Failed to remove member");
  }
};

/* ---------- Volunteer Registration ---------- */
export const registerVolunteer = async (campaignId: string, departmentId: string): Promise<Campaign> => {
  try {
    const response = await axios.post(
      `${API_BASE}/campaigns/${campaignId}/register`,
      { departmentId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error registering volunteer:", error);
    throw new Error( "Failed to register volunteer");
  }
};