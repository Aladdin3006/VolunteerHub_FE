import { IAxiosExtraConfigOptions } from "./src/apis/utils";

declare module "axios" {
  export interface AxiosRequestConfig {
    extraOptions?: IAxiosExtraConfigOptions;
  }
}

export {};
