const API_BASE = "http://localhost:4000";
import axios from "axios";

/* ---------- Kiểu dữ liệu ---------- */
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

/** ✅ Đổi tên từ Campaign2 thành CampaignVolunteer */
export interface CampaignVolunteer {
  _id: string;
  name: string;
  description: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
    address?: string;
  };
  status?: "upcoming" | "in-progress" | "completed";
  volunteers?: unknown[];      // thêm nếu cần
  
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

const getCampaignDetail = async (
  campaignId: string
): Promise<CampaignDetailResponse> => {
  const response = await fetch(`${API_BASE}/donate/${campaignId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lỗi khi lấy campaign: ${errorText}`);
  }

  const data = await response.json();
  return data.data;
};

/** ✅ getCampaigns2 trả về CampaignVolunteer */
export const getCampaignVolunteer = async (): Promise<CampaignVolunteer[]> => {
  const res = await axios.get(`${API_BASE}/campaigns`);

  // Lấy đúng mảng campaigns trong result
  const campaigns = res.data?.result?.campaigns;

  if (Array.isArray(campaigns)) {
    return campaigns;
  }

  // Nếu backend lỗi cấu trúc, trả mảng rỗng để tránh crash
  console.error("Unexpected volunteer campaigns payload:", res.data);
  return [];
};


export const getCampaignVolunteerDetail = async (
  campaignId: string
): Promise<CampaignVolunteer> => {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}`);
  if (!res.ok) {
    throw new Error(`Lỗi khi lấy campaign: ${await res.text()}`);
  }

  const raw = await res.json();
  console.log("Kết quả từ API:", raw); // ✅ in ra full response

  // Cách 1: nếu backend trả về { data: {...} }
  if (raw.data) return raw.data;

  // Cách 2: nếu backend trả về {...} trực tiếp
  return raw;
};






export default getCampaignDetail;
