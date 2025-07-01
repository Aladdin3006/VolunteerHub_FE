export const getAccessToken = (): string | null => {
  return localStorage.getItem("token");
};

export const handleResponse = async <Data, Result>(
  response: Response,
  success?: (data: Data) => Result
): Promise<Result> => {
  const data = await response.json();

  if (!response.ok) {
    if (Array.isArray(data.errors)) {
      const messages = data.errors.map((err: any) => err.msg).join("\n");
      throw new Error(messages);
    }
    throw new Error(data.message);
  }
  return success ? success(data) : data;
};
