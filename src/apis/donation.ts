import { ICategory } from "./campaign";
import {
  axiosInstance,
  IAxiosExtraConfigOptions,
  IDataResponseSuccess,
  toBase64,
} from "./utils";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";
/**
 * Donation data
 */
export interface IDonationDataUpload {
  title: string;
  description: string;
  goalAmount: number;
  /**
   * Image (one)
   */
  thumbnail: string | File;
  /**
   * Images (up to 10)
   */
  images: (string | File)[];
  /**
   * categories ids
   */
  tags: string[];
}

export interface IDonationDataItem {
  _id: string;
  title: string;
  description: string;
  goalAmount: number;
  thumbnail: string;
  images: string[];
  tags: ICategory[];
}

export const DONATION_API = {
  async createDonation(
    data: IDonationDataUpload,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<unknown>> {
    const campaignImg =
      typeof data.thumbnail === "string"
        ? data.thumbnail
        : await toBase64(data.thumbnail);
    const gallery = await Promise.all(
      data.images.map(async (img) => {
        return typeof img === "string" ? img : await toBase64(img);
      })
    );
    const submitData: IDonationDataUpload = {
      ...data,
      thumbnail: campaignImg,
      images: gallery,
    };
    return axiosInstance.post(`/donate`, submitData, {
      extraOptions: {
        ...options,
      },
    });
  },

  async updateDonation(id: string, data: IDonationDataUpload): Promise<any> {
    try {
      const formData = new FormData();

      formData.append("title", data.title || "");
      formData.append("description", data.description || "");
      formData.append("goalAmount", data.goalAmount.toString());

      if (data.thumbnail instanceof File) {
        formData.append("thumbnail", data.thumbnail);
      } else {
        formData.append("thumbnail", data.thumbnail); // nếu là base64 hoặc URL
      }

      data.images.forEach((img) => {
        formData.append("images", img); // img có thể là File hoặc base64/URL
      });

      data.tags.forEach((tagId) => {
        formData.append("tags[]", tagId);
      });

      const res = await axiosInstance.put(`/donate/${id}`, formData);

      if (!res.data) throw new Error("Không có dữ liệu trả về");

      return res.data;
    } catch (err: any) {
      // In rõ toàn bộ lỗi để debug
      console.error("❌ Axios error:", err);

      if (err.response) {
        console.error("📛 Response data:", err.response.data);
        throw {
          message: err.response.data?.message || "Request failed",
          origin: err,
        };
      } else if (err.request) {
        console.error("📛 Request không phản hồi:", err.request);
        throw {
          message: "No response received from server",
          origin: err,
        };
      } else {
        console.error("📛 Lỗi khác:", err.message);
        throw {
          message: err.message || "axios error",
          origin: err,
        };
      }
    }
  },

  async getById(
    id: string,
    options?: IAxiosExtraConfigOptions
  ): Promise<IDataResponseSuccess<IDonationDataItem>> {
    return axiosInstance.get(`/donate/${id}`, {
      extraOptions: {
        ...options,
      },
    });
  },
} as const;

export const approveDonationCampaign = async (id: string) => {
  try {
    const userStr = localStorage.getItem("user");
    const token = userStr ? JSON.parse(userStr).token : null;

    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.put(
      `${API_BASE}/donate/${id}/approve`,
      {}, // no body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi duyệt chiến dịch"
    );
  }
};

export const rejectDonationCampaign = async (id: string) => {
  try {
    const userStr = localStorage.getItem("user");
    const token = userStr ? JSON.parse(userStr).token : null;

    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.post(
      `${API_BASE}/donate/${id}/reject`,
      {}, // không có body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi từ chối chiến dịch"
    );
  }
};

export const completeDonationCampaign = async (id: string) => {
  try {
    const userStr = localStorage.getItem("user");
    const token = userStr ? JSON.parse(userStr).token : null;

    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.put(
      `${API_BASE}/donate/${id}/complete`,
      {}, // không có body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi kết thúc chiến dịch"
    );
  }
};
