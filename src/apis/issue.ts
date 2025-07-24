// apis/issue.ts
import axios from 'axios';

export const reportIssueApi = async (
  title: string,
  description: string,
  taskId: string,
  token: string
) => {
  const response = await axios.post(
    'http://localhost:4000/issue',
    {
      title,
      description,
      type: 'task_issue',
      relatedEntity: {
        type: 'Task',
        entityId: taskId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
