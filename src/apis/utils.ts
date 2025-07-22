import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { IUserShort } from "./forum";

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

export const getLocalUser = (): IUserShort | null => {
  const userVal = localStorage.getItem("user");
  if (userVal) {
    try {
      const user: any = JSON.parse(userVal);
      return {
        ...user,
        _id: (user as any).id ?? user._id,
      };
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

export interface IDataResponse<Data, Error = unknown> {
  data?: Data;
  message: string;
  error?: Error;
}

export interface IDataResponseSuccess<Data = unknown> {
  data: Data;
  error?: unknown;
}

export interface IDataResponseError<Error = unknown> {
  error: Error;
  message: string;
  origin: any;
}

export interface IAxiosExtraConfigOptions {
  auth?: boolean;
}

const BASE_API_URL =
  import.meta.env.VITE_BASE_API_URL || "http://localhost:4000";
export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    /**
     * No need to add authorization header
     */
    if (config.extraOptions?.auth === false) return config;

    /**
     * Add access token
     */
    config.headers.Authorization = `Bearer ${getAccessToken()}`;
    return config;
  },
  (error): Promise<IDataResponseError<unknown>> => {
    return Promise.reject({
      message: "axios error",
      error: error,
      origin: error,
    });
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const contentType = response.headers["content-type"] ?? "";
    // Update auth context
    if (contentType.startsWith("application/json")) {
      const resData = response as any;
      const data = resData?.data;
      const error = resData?.error;
      if (data == null && error != null) {
        return Promise.reject({
          message: resData.message,
          error: error,
          origin: error,
        });
      }
      return data;
    }
    return response.data;
  },
  (error): Promise<IDataResponseError<unknown>> => {
    const resError = error.response?.data?.error;
    return Promise.reject({
      message: "axios error",
      error: resError,
      origin: error,
    });
  }
);
