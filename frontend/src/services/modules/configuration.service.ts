import { apiClient } from '@/services/http-client';

export interface Configuration {
  id: number;
  group: string;
  key: string;
  value: string | null;
  casted_value: any;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'json';
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export const configurationService = {
  async getAll(): Promise<Configuration[]> {
    return apiClient.get('/api/admin/configurations');
  },

  async create(data: Omit<Configuration, 'id' | 'casted_value' | 'created_at' | 'updated_at'>): Promise<Configuration> {
    return apiClient.post('/api/admin/configurations', data);
  },

  async update(id: number, data: Partial<Omit<Configuration, 'id' | 'casted_value'>>): Promise<Configuration> {
    return apiClient.put(`/api/admin/configurations/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/api/admin/configurations/${id}`);
  },
};
