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
    const response = await apiClient.get<{ data: Configuration[] }>('/api/admin/configurations');
    return response.data;
  },

  async getRulesEndAndStartYears(){
    const config = await this.getAll();
    const digest_data = JSON.parse(config[0].value!);
    const startYearConfig = digest_data.initial_year;
    const endYearConfig = digest_data.final_year;

    return {
      startYear: startYearConfig, 
      endYear: endYearConfig 
    };
  },

  async getResolutionLink(): Promise<string> {
    const response = await apiClient.get<{ url: string }>('/api/admin/accreditation/resolution-link');
    return response.url;
  },

  async create(data: Omit<Configuration, 'id' | 'casted_value' | 'created_at' | 'updated_at'>): Promise<Configuration> {
    const response = await apiClient.post<{ data: Configuration }>('/api/admin/configurations', data);
    return response.data;
  },

  async update(id: number, data: Partial<Omit<Configuration, 'id' | 'casted_value'>>): Promise<Configuration> {
    const response = await apiClient.put<{ data: Configuration }>(`/api/admin/configurations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/api/admin/configurations/${id}`);
  },
};

