const API_BASE = "http://localhost:4000";
import axios from "axios";

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  thumbnail: string;
  images: string[];
  tags?: { name: string }[];
  createdBy: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DonationTransaction {
  _id: string;
  donorName: string;
  amount: number;
  createdAt: string;
  anonymous: boolean;
  message: string;
}

export interface CampaignDetailResponse {
  campaign: Campaign;
  transactions: DonationTransaction[];
}

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const res = await axios.get("http://localhost:4000/donate");
    const campaignData = res.data.data;

    if (Array.isArray(campaignData)) {
      return campaignData;
    } else {
      throw new Error("Dữ liệu trả về không phải là mảng");
    }
  } catch (error) {
    console.error("Lỗi khi fetch campaigns:", error);
    throw error;
  }
};


const getCampaignDetail = async (campaignId: string): Promise<CampaignDetailResponse> => {
  const response = await fetch(`${API_BASE}/donate/${campaignId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lỗi khi lấy campaign: ${errorText}`);
  }

  const data = await response.json();
  return data.data;
};

export default getCampaignDetail;

