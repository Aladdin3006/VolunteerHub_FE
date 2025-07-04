import { getAccessToken, handleResponse, IDataResponse, toBase64 } from "./utils";

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

export const fakeCategories: ICategory[] = [
  {
    _id: "0",
    name: "cate1",
  },
];

/**
 * Campaign data
 */
export interface ICampaignData {
  name: string;
  description: string;
  location: ILocation;
  startDate: string;
  endDate: string;
  /**
   * Image (one)
   */
  campaignImg: string[];
  /**
   * Images (up to 10)
   */
  gallery: string[];
  /**
   * categories ids
   */
  categories: string[];
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

const API_BASE = "http://localhost:4000";
export const CAMPAIGN_API = {
  async searchCategories(name: string, skip = 0, limit = 20) {
    const response = await fetch(
      `${API_BASE}/category?q=${name}&skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      }
    );
    return handleResponse<
      IDataResponse<ICategory[]>,
      IDataResponse<ICategory[]>
    >(response);
  },

  async createCampaign(data: ICampaignDataUpload) {
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
    const response = await fetch(`${API_BASE}/campaigns`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    });
    return handleResponse<unknown, unknown>(response);
  },
} as const;
