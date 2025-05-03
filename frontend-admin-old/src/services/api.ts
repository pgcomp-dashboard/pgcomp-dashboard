import axios, { AxiosInstance } from "axios";
import config from "../config/config";
const baseURL = 'https://aufbaproduz-api.dovalle.app.br/api/portal/admin'
export const api: AxiosInstance = axios.create({ baseURL: baseURL });
