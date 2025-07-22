const API_BASE = "http://localhost:4000";
import axios from "axios";
import {
  axiosInstance,
  IAxiosExtraConfigOptions,
  IDataResponseSuccess,
  toBase64,
} from "./utils";

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
/** Thông tin mỗi tình nguyện viên đã đăng ký */
export interface VolunteerRecord {
  user: { _id: string }; // Có thể bổ sung fullName, avatar...
  status: "pending" | "approved" | "rejected";
  registeredAt?: string;
}

/** Chiến dịch Volunteer */
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
  phases?: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    description?: string;
    phaseDays?: {
      _id: string;
      date: string;
      name?: string;
      description?: string;
      tasks?: {
        _id: string;
        phaseDayId: string;
        title: string;
        description?: string;
        status: {
          status: string;
        };
        assignedUsers: {
          _id: string;
          userId: string;
          checkinTime: string | null;
          checkoutTime: string | null;
        }[];
      }[];
    }[];
  }[];
  status?: "upcoming" | "in-progress" | "completed";

  /** 👇 mảng tình nguyện viên */
  volunteers?: VolunteerRecord[];
}


export interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

export interface ILocation {
  /**
   * [lat, lng]
   */
  coordinates: [number, number];
  address: string;
}

export enum ECampaignAcceptStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface ICategory {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface IPhaseDayData {
  _id: string;
  date: Date;
  location: ILocation;
}

export interface IPhaseData {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  phaseDays: IPhaseDayData[];
}

/**
 * Campaign data
 */
export interface ICampaignDataItem {
  name: string;
  description: string;
  location: ILocation;
  startDate: string;
  endDate: string;
  /**
   * Image (one)
   */
  image: string;
  /**
   * Images (up to 10)
   */
  gallery: string[];
  /**
   * categories ids
   */
  categories: ICategory[];

  phases: IPhaseData[];
}

/**
 * Campaign data
 */
export interface ICampaignDataUpload {
  name: string;
  description: string;
  location: ILocation;
  startDate: string;
  endDate: string;
  /**
   * Image (one)
   */
  campaignImg: string | File;
  /**
   * Images (up to 10)
   */
  gallery: (string | File)[];
  /**
   * categories ids
   */
  categories: string[];
}

export const CAMPAIGN_API = {
  async searchCategories(
    name: string,
    skip = 0,
    limit = 20,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<ICategory[]>> {
    return axiosInstance.get(
      `/category?q=${name}&skip=${skip}&limit=${limit}`,
      {
        extraOptions: {
          ...options,
        },
      }
    );
  },

  async createCampaign(
    data: ICampaignDataUpload,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    const campaignImg =
      typeof data.campaignImg === "string"
        ? data.campaignImg
        : await toBase64(data.campaignImg);
    const gallery = await Promise.all(
      data.gallery.map(async (img) => {
        return typeof img === "string" ? img : await toBase64(img);
      })
    );
    const submitData: ICampaignDataUpload = {
      ...data,
      campaignImg: campaignImg,
      gallery: gallery,
    };

    return axiosInstance.post(`/campaigns`, submitData, {
      extraOptions: {
        ...options,
      },
    });
  },

  async updateCampaign(
    id: string,
    data: ICampaignDataUpload,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    const campaignImg =
      typeof data.campaignImg === "string"
        ? data.campaignImg
        : await toBase64(data.campaignImg);
    const gallery = await Promise.all(
      data.gallery.map(async (img) => {
        return typeof img === "string" ? img : await toBase64(img);
      })
    );
    const submitData: ICampaignDataUpload = {
      ...data,
      campaignImg: campaignImg,
      gallery: gallery,
    };
    return axiosInstance.put(`/campaigns/${id}`, submitData, {
      extraOptions: {
        ...options,
      },
    });
  },

  async getById(
    id: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<ICampaignDataItem> {
    return axiosInstance.get(`/campaigns/${id}`, {
      extraOptions: {
        ...options,
      },
    });
  },
} as const;

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

  const campaigns = res.data?.result?.campaigns;

  if (Array.isArray(campaigns)) {
    return campaigns;
  }

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

  if (raw.data) return raw.data;
  return raw;
};

/* ---------- API JOIN CAMPAIGN ---------- */
export const joinCampaign = async (campaignId: string): Promise<string> => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${user.token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // backend trả { error: { message } }
    const err = await res.json();
    throw new Error(err.error?.message || "Đã có lỗi xảy ra");
  }

  const data = await res.json(); // { message: "Registration submitted, waiting for admin approval" }
  return data.message as string;
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await axios.get(`${API_BASE}/category`);
    const categoryData = res.data.data;

    if (Array.isArray(categoryData)) {
      return categoryData;
    } else {
      throw new Error("Dữ liệu danh mục trả về không phải là mảng");
    }
  } catch (error) {
    console.error("Lỗi khi fetch categories:", error);
    throw error;
  }
};

export default getCampaignDetail;
