import { getAccessToken, handleResponse, toBase64 } from "./utils";

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
    categories: string[];
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
        return handleResponse<unknown, unknown>(response);
    },
} as const;
