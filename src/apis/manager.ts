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
  categories: Category[];
  status: "upcoming" | "in-progress" | "completed";
  acceptStatus: "pending" | "approved" | "rejected";
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  };
};

export const managerCampaignService = {
  // Get campaigns with filtering
  getListCampaigns: async (
    filters: {
      status?: string;
      acceptStatus?: string;
    } = {}
  ): Promise<Campaign[]> => {
    const query = new URLSearchParams(filters).toString();
    try {
      const response = await fetch(`${API_BASE}/campaigns?${query}`, {
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

      // Extract campaigns from new response structure
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

  // Approve campaign
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

  // Reject campaign
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

  // Start campaign
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

  // End campaign
  endCampaign: async (id: string): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/campaigns/${id}/end`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to end campaign: ${errorText}`);
    }

    return await response.json();
  },
};
