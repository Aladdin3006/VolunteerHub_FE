import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface DonationExpense {
  _id: string;
  donationCampaignId: string;
  amount: number;
  description: string;
  evidences: string[];
  createdBy: {
    _id: string;
    fullName: string;
  };
  approvedBy?: string | null;
  approvalStatus: "pending" | "approved" | "rejected";
  note?: string;
  remainingBalance?: number | null;
  createdAt: string;
}

// Tạo expense mới (POST /expense)
export const createExpenseApi = async (
  token: string,
  data: {
    donationCampaignId: string;
    amount: number;
    description: string;
    images: File[]; // Danh sách ảnh
  }
) => {
  const formData = new FormData();
  formData.append("donationCampaignId", data.donationCampaignId);
  formData.append("amount", String(data.amount));
  formData.append("description", data.description);
  data.images.forEach((image) => {
    formData.append("images", image);
  });
  //    console.log("📦 FormData gửi đi:");
  //   for (let [key, value] of formData.entries()) {
  //     console.log(`${key}:`, value);
  //   }

  const response = await axios.post(`${BASE_URL}/expense`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// lay danh sach expense
export const fetchExpensesByCampaignId = async (
  campaignId: string,
  token: string
) => {
  const response = await axios.get(
    `${BASE_URL}/expense/campaign/${campaignId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const fetchExpensesByCampaignId1 = async (
  campaignId: string
): Promise<DonationExpense[]> => {
  const response = await axios.get(
    `${BASE_URL}/expense/campaign/${campaignId}`
  );
  console.log("API response:", response.data);
  return response.data.data; // ✅ lấy đúng mảng
};

//edit expens
export const editExpense = async (
  id: string,
  token: string,
  formData: FormData
) => {
  const response = await axios.patch(`${BASE_URL}/expense/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

//accept expense
export const acceptExpense = async (expenseId: string, token: string) => {
  const response = await axios.patch(
    `${BASE_URL}/expense/${expenseId}/approve`,
    {
      note: "Chi phí được chấp nhận", // hoặc truyền note từ phía frontend nếu cần
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

//denyExpense
export const denyExpense = async (expenseId: string, token: string) => {
  const response = await axios.patch(
    `${BASE_URL}/expense/${expenseId}/reject`,
    {
      note: "Chi phí bị từ chối", // hoặc truyền từ frontend nếu muốn
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

//deletedExpense
export const deleteExpense = async (id: string, token: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/expense/${id}`, {
      // Nếu cần gửi token:
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Xoá chi phí thất bại");
  }
};
