// apis/task.ts
import axios from "axios";

export const fetchPhasesByCampaignId = async (
  campaignId: string,
  token: string
) => {
  const response = await axios.get(
    `http://localhost:4000/task/${campaignId}/campaign`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const submitTaskApi = async (
  taskId: string,
  content: string,
  images: File[],
  token: string
) => {
  const formData = new FormData();
  formData.append("content", content);
  images.forEach((file) => formData.append("images", file));

  const response = await axios.post(
    `http://localhost:4000/task/${taskId}/submit`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const reviewPeerTaskApi = async (
  taskId: string,
  revieweeId: string,
  score: number,
  comment: string,
  token: string
) => {
  const response = await axios.post(
    `http://localhost:4000/task/${taskId}/peer-review/${revieweeId}`,
    { score, comment },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
