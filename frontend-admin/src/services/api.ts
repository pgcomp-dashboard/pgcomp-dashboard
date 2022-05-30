import axios, { AxiosInstance } from "axios";
import config from "../config/config";
console.log(config);
const baseURL = 'https://mate85-api.litiano.dev.br/api/portal/admin'
console.log(baseURL);
export const api: AxiosInstance = axios.create({ baseURL: baseURL });
