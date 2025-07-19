// apis/task.ts
import axios from 'axios';

export const fetchTasksByCampaignId = async (campaignId: string, token: string) => {
  const response = await axios.get(`http://localhost:4000/phase/${campaignId}/task/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export const submitTaskApi = async (taskId: string, content: string, images: File[], token: string) => {
  const formData = new FormData();
  formData.append('content', content);
  images.forEach((file) => formData.append('images', file)); // key 'images' phải giống backend xử lý

  const response = await axios.post(
    `http://localhost:4000/phase/tasks/${taskId}/submit`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};