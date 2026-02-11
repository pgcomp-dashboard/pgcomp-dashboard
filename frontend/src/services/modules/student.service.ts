import { PaginatedResponse } from '@/types/common';
import { Student } from '@/types/user';
import { apiClient } from '../http-client';

export const studentService = {
  async fetchStudents(
    page: number = 1,
    perPage: number = 5,
    filters?: Record<string, any>,
    orderBy: string = 'name',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const params = {
      page,
      per_page: perPage,
      order_by: orderBy,
      dir: direction,
      ...filters,
    };

    return await apiClient.get<PaginatedResponse<Student>>('/api/admin/students', params);
  },

  async createStudent(student: Omit<Student, 'id'>) {
    const response = await apiClient.post<{ status: string; data: Student }>('/api/admin/students', student);
    return response.data;
  },

  async updateStudent(id: number, student: Omit<Student, 'id'>) {
    const response = await apiClient.put<Student>(`/api/admin/students/${id}`, student);
    return response;
  },

  async deleteStudent(id: number) {
    return apiClient.delete<{ status: string; message: string }>(`/api/admin/students/${id}`);
  },
};
