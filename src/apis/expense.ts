import axios from "axios";

const BASE_URL = "http://localhost:4000";

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
export const fetchExpensesByCampaignId = async (campaignId: string, token: string) => {
  const response = await axios.get(`${BASE_URL}/expense/campaign/${campaignId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


//edit expens 
export const editExpense = async (id: string, token: string, formData: FormData) => {
  const response = await axios.patch(`http://localhost:4000/expense/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

