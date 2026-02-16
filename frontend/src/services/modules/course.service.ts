import { apiClient } from '@/services/http-client';
import { Course } from '@/types/academic';

export const courseService = {
  async fetchCourses() {
    const response = await apiClient.get<{ data: Course[] }>('/api/admin/courses');
    return response.data;
  },
};
