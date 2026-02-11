import { Course } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { Advisor } from '@/types/user';
import { apiClient } from '../http-client';

export const dashboardService = {
  // Courses
  async fetchCourses() {
    const response = await apiClient.get<{ data: Course[] }>('/api/admin/courses');
    return response.data;
  },

  // Scraping
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

  async totalStudentsPerAdvisor(filter?: 'mestrando' | 'doutorando' | 'completed') {
    return apiClient.get<{ [key: string]: Advisor }>('/api/admin/dashboard/total_students_per_advisor', { user_type: filter });
  },

  async totalProductionsPerYear(filter?: 'journal' | 'conference') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/all_production', { publisher_type: filter });
  },

  async studentsPerField(filter?: 'mestrando' | 'doutorando' | 'completed') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/fields', { selectedFilter: filter });
  },

  async studentsPerSubfield(filter?: 'mestrando' | 'doutorando' | 'completed') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/subfields', { selectedFilter: filter });
  },

  async productionPerQualis() {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/production_per_qualis');
  },

  async defensesPerYear(filter?: 'mestrado' | 'doutorado') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/defenses_per_year', { filter });
  },

  async enrollmentsPerYear(filter?: 'mestrado' | 'doutorado') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/enrollments_per_year', { filter });
  },

  async professors() {
    const response = await apiClient.get<{ data: { id: number; name: string }[] }>('/api/admin/dashboard/professors');
    return response.data;
  },

  async professorProductionPerYear(professorId: number, startYear?: number, endYear?: number) {
    const year = new Date().getFullYear();
    const from = startYear ?? year - 2;
    const to = endYear ?? year;
    const response = await apiClient.get<{ productions: { [key: string]: number } }>(
      `/api/admin/dashboard/professor/${professorId}/productions`,
      { anoInicial: from, anoFinal: to },
    );
    return response.productions;
  },

  async numberOfStudents(): Promise<{ category: string; amount: number }[]> {
    const response = (await apiClient.get('/api/admin/dashboard/students')) as Record<
      string,
      {
        in_progress: number,
        completed: number,
      }
    >;

    return Object.entries(response).map(([ course, students ]) => [
      { category: `${course} - Alunos atuais`, amount: students.in_progress },
      { category: `${course} - Alunos concluídos`, amount: students.completed },
    ]).flat();
  },
};
