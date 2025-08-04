import { Category } from "./campaign";

const API_BASE = "http://localhost:4000";

export interface Volunteer {
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  status: "pending" | "approved" | "rejected";
  evaluation?: string;
  feedback?: string;
}

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
  volunteers?: Volunteer[];
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  };
};

export const managerCampaignService = {
  getListCampaigns: async (): Promise<Campaign[]> => {
    try {
      const response = await fetch(`${API_BASE}/campaigns?all=true`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch campaigns: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      const campaignsData = result.result?.campaigns || [];
      return campaignsData.map((campaign: any) => ({
        ...campaign,
        _id: campaign._id || campaign.id,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate),
        gallery: campaign.gallery || [],
        categories: campaign.categories || [],
        status: campaign.status || "pending",
        acceptStatus: campaign.acceptStatus || "pending",
      }));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    try {
      const response = await fetch(`${API_BASE}/campaigns/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch campaign: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      const campaign = result.data;
      return {
        ...campaign,
        _id: campaign._id || campaign.id,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate),
        gallery: campaign.gallery || [],
        categories: campaign.categories || [],
        status: campaign.status || "pending",
        acceptStatus: campaign.acceptStatus || "pending",
        volunteers: campaign.volunteers || [],
      };
    } catch (error) {
      console.error("Error fetching campaign:", error);
      throw error;
    }
  },

  evaluateVolunteer: async (
    campaignId: string,
    userId: string,
    evaluation: string,
    feedback: string
  ): Promise<{
    message: string;
    userId: string;
    evaluation: string;
    feedback: string;
  }> => {
    try {
      const response = await fetch(
        `${API_BASE}/campaigns/${campaignId}/evaluate/${userId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ evaluation, feedback }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to evaluate volunteer: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error evaluating volunteer:", error);
      throw error;
    }
  },

  approveCampaign: async (id: string): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/campaigns/${id}/approve`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to approve campaign: ${errorText}`);
    }

    return await response.json();
  },

  rejectCampaign: async (id: string): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/campaigns/${id}/reject`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to reject campaign: ${errorText}`);
    }

    return await response.json();
  },

  startCampaign: async (id: string): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/campaigns/${id}/start`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start campaign: ${errorText}`);
    }

    return await response.json();
  },

  endCampaign: async (
    id: string,
    options: { certificate: string }
  ): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/campaigns/${id}/end`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to end campaign: ${errorText}`);
    }

    return await response.json();
  },
};
