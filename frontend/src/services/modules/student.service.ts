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
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      order_by: orderBy,
      dir: direction,
    });

    if (filters) {
      for (const [ key, value ] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
    }

    const url = `/api/admin/students?${params.toString()}`;
    const response = await apiClient.get<PaginatedResponse<Student>>(url);
    return response;
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
