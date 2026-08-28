import { apiClient } from '@/services/http-client';
import { RequestBodyType } from '@/types/common';

export const scrapingService = {
  async executeScraping() {
    return apiClient.post('/api/admin/execute_scraping', {});
  },

  async executeScrapingForAProfessor(body: RequestBodyType) {
    return apiClient.post('/api/admin/execute_professor_scraping', body);
  },

  async getScrapingExecutions() {
    const response = await apiClient.get('/api/admin/scraping_execution') as {
      status: string,
      message: string,
      data: {
        id: number,
        command: string,
        executed_at: string,
      }[],
    };

    return response.data;
  },

  async getScrapingInterval() {
    const response = await apiClient.get('/api/admin/scraping_execution_interval');
    return response as {
      intervalDays: number,
    };
  },

  async setScrapingInterval(intervalDays: number) {
    return apiClient.post('/api/admin/scraping_execution_interval', { days: intervalDays });
  },
};
