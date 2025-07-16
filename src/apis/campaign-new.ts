import {
  getAccessToken,
  handleResponse,
  IDataResponse,
  toBase64,
} from "./utils";

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
  campaignImg: string;
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
  phases: IPhaseData[];
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

  async updateCampaign(id: string, data: ICampaignDataUpload) {
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
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
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
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
      },
    });
    return handleResponse<
      IDataResponse<ICampaignDataItem>,
      IDataResponse<ICampaignDataItem>
    >(response);
  },
} as const;
