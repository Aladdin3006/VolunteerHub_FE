export const getAccessToken = (): string | null => {
  const userVal = localStorage.getItem("user");
  if (userVal) {
    try {
      const user: any = JSON.parse(userVal);
      return user.token;
    } catch (error) {
      return null;
    }
  }
  return null;
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

export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
};
