import axios, { AxiosInstance } from "axios";
import config from "../config/config";
const baseURL = 'https://mate85-api.litiano.dev.br/api/portal/admin'
export const api: AxiosInstance = axios.create({ baseURL: baseURL });
