import { apiClient } from '@/services/http-client';

export interface SystemFunction {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const systemFunctionService = {
  async getAdminFunctions() {
    return apiClient.get<{ data: SystemFunction[] }>('/api/admin/system-functions');
  },

  async updateLattesXmlUpload(enabled: boolean) {
    return apiClient.put<{ data: SystemFunction }>(
      '/api/admin/system-functions/lattes-xml-upload',
      { enabled },
    );
  },

  async getLattesXmlUploadStatus() {
    return apiClient.get<{ enabled: boolean }>(
      '/api/portal/system-functions/lattes-xml-upload',
    );
  },
};
