import axios from 'axios';

const baseURL = import.meta.env.VITE_API_ENDPOINT ?? 'http://localhost';

export const api = axios.create({ baseURL: baseURL });
