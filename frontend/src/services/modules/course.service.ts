import { apiClient } from '@/services/http-client';
import { Course } from '@/types/academic';

export const courseService = {
  async fetchCourses(params: Record<string, any> = {}) {
    const response = await apiClient.get<{ data: Course[] }>('/api/admin/courses', params);
    return response.data;
  },
};
