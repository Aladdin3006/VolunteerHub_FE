import { ICategory } from "./campaign";
import {
  getAccessToken,
  handleResponse,
  IDataResponse,
  toBase64,
} from "./utils";

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

const API_BASE = "http://localhost:4000";
export const DONATION_API = {
  async createDonation(data: IDonationDataUpload) {
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
    const response = await fetch(`${API_BASE}/donate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    });
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async updateDonation(id: string, data: IDonationDataUpload) {
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
    const response = await fetch(`${API_BASE}/donate/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    });
    return handleResponse<IDataResponse<unknown>, IDataResponse<unknown>>(
      response
    );
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE}/donate/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<
      IDataResponse<IDonationDataItem>,
      IDataResponse<IDonationDataItem>
    >(response);
  },
} as const;
