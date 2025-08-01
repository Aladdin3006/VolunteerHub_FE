import { ICategory } from "./campaign";
import {
  axiosInstance,
  IAxiosExtraConfigOptions,
  IDataResponseSuccess,
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

  async updateDonation(
    id: string,
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
    return axiosInstance.put(`/donate/${id}`, submitData, {
      extraOptions: {
        ...options,
      },
    });
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
