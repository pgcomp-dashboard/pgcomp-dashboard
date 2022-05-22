import axios, { AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({baseURL: "https://mate85-api.litiano.dev.br/api/portal/admin", withCredentials: true});