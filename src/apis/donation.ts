import { ICategory } from "./campaign";
import {
  axiosInstance,
  IAxiosExtraConfigOptions,
  IDataResponseSuccess,
  toBase64,
} from "./utils";
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
    const res = await axiosInstance.put(`/donate/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Res trả về:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("❌ Lỗi thực tế khi gọi API:", err.response?.data || err.message);
    throw err;
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
      `http://localhost:4000/donate/${id}/approve`,
      {}, // no body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi duyệt chiến dịch");
  }
};


export const rejectDonationCampaign = async (id: string) => {
  try {
    const userStr = localStorage.getItem("user");
    const token = userStr ? JSON.parse(userStr).token : null;

    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.post(
      `http://localhost:4000/donate/${id}/reject`,
      {}, // không có body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi từ chối chiến dịch");
  }
};

