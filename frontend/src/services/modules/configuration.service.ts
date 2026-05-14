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

  async getRulesEndAndStartYears(): Promise<{ startYear: number; endYear: number }> {
    const currentYear = new Date().getFullYear();
    const defaults = { startYear: currentYear - 4, endYear: currentYear };

    const config = await this.getAll();
    const rulesConfig = config.find((c) => c.group === 'accreditation' && c.key === 'rules');

    if (!rulesConfig || !rulesConfig.value) return defaults;

    try {
      const digest_data = JSON.parse(rulesConfig.value);
      return {
        startYear: digest_data.initial_year ?? defaults.startYear,
        endYear: digest_data.final_year ?? defaults.endYear,
      };
    } catch {
      return defaults;
    }
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

