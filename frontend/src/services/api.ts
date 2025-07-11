/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiError {
  code: number;
  errors: { description: string }[];
}

export function parseApiError(error: unknown): string {
  if (typeof error === 'object' && error && 'errors' in error) {
    return (error as ApiError).errors.map(e => e.description).join('\n');
  }
  return 'Erro desconhecido.';
}

export interface Advisor {
  id: number;
  name: string;
  advisedes_count: number;
}

export interface Area {
  id: number;
  name: string;
  students: number;
}

type Professor = {
  id: number;
  name: string;
  siape: number;
  email: string;
  lattes_url: string;
};

export interface StratumQualis {
  id: number;
  code: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Publisher {
  id: number;
  initials: string | null;
  name: string;
  publisher_type: string;
  issn: string | null;
  percentile: string | null;
  update_date: string | null;
  tentative_date: string | null;
  logs: string | null;
  stratum_qualis_id: number | null;
  created_at: string;
  updated_at: string;
  stratum_qualis: StratumQualis | null;
}

export interface Production {
  id: number;
  title: string;
  year: number;
  created_at: string;
  updated_at: string;
  publisher_type: string | null;
  publisher_id: number | null;
  last_qualis: string | null;
  stratum_qualis_id: number | null;
  sequence_number: number | null;
  doi: string | null;
  publisher: Publisher | null;
}


export interface Student {
  id: number;
  name: string;
  email: string | null;
  registration: number | null;
  type: 'student';
  is_admin: boolean;
  area_id: number | null;
  course_id: number;
  lattes_url: string | null;
  defended_at: string | null;
  is_protected: boolean;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Course {
  id: number;
  name: string;
}

export type RequestBodyType = BodyInit | object | null | undefined;

export class ApiService {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token?: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body: RequestBodyType = undefined,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.authToken) {
      finalHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    let requestBody: BodyInit | undefined = undefined;
    if (body && typeof body === 'object' && finalHeaders['Content-Type'] === 'application/json') {
      requestBody = JSON.stringify(body);
    } else {
      requestBody = body as BodyInit;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: requestBody,
      });

      if (!response.ok) {
        const error: ApiError = {
          code: response.status,
          errors: [ { description: 'Erro ao se comunicar com a API.' } ],
        };

        try {
          const json = await response.json();
          error.errors = json.errors ?? [ { description: json.message ?? 'Erro desconhecido.' } ];
        } catch (jsonError) {
          console.error('Erro ao interpretar JSON de erro da API:', jsonError);
        }

        throw error;
      }

      return await response.json() as T;
    } catch (e: unknown) {
      if (Object.prototype.hasOwnProperty.call(e, 'code') && Object.prototype.hasOwnProperty.call(e, 'errors')) {
        throw e;
      } else {
        console.error(`Erro na requisição para ${endpoint}:`, e);
        throw {
          code: 408,
          errors: [ { description: 'Falha de conexão com o servidor.' } ],
        } as ApiError;
      }
    }
  }

  async get<T>(endpoint: string, headers: Record<string, string> = {}) {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  async post<T>(endpoint: string, body: RequestBodyType, headers: Record<string, string> = {}) {
    return this.request<T>(endpoint, 'POST', body, headers);
  }

  async put<T>(endpoint: string, body: RequestBodyType, headers: Record<string, string> = {}) {
    return this.request<T>(endpoint, 'PUT', body, headers);
  }

  async delete<T>(endpoint: string, headers: Record<string, string> = {}) {
    return this.request<T>(endpoint, 'DELETE', undefined, headers);
  }

  // CRUD - Students
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

    const url = `/api/portal/admin/students?${params.toString()}`;
    const res = await this.get<PaginatedResponse<Student>>(url);
    return res;
  }

  async createStudent(student: Omit<Student, 'id'>) {
    const res = await this.post<{ status: string; data: Student }>('/api/portal/admin/students', student);
    return res.data;
  }

  async updateStudent(id: number, student: Omit<Student, 'id'>) {
    const res = await this.put<Student>(`/api/portal/admin/students/${id}`, student);
    return res;
  }

  async deleteStudent(id: number) {
    return this.delete<{ status: string; message: string }>(`/api/portal/admin/students/${id}`);
  }

  // Courses
  async fetchCourses() {
    const res = await this.get<{ data: Course[] }>('/api/portal/admin/courses');
    return res.data;
  }

  // --------------------------
  //        CRUD - Áreas
  // --------------------------

  async fetchAreas(): Promise<Area[]> {
    const response = await this.get('/api/portal/admin/areas') as {
      data: {
        id: number,
        area: string,
      }[]
    };
    return response.data.map((item) => ({
      id: item.id,
      name: item.area,
      students: 0,
    }));
  }

  async createArea(area: { name: string }) {
    const res = await this.post<{ data: { id: number; area: string } }>(
      '/api/portal/admin/areas',
      { area: area.name },
    );
    return { id: res.data.id, name: res.data.area, students: 0 };
  }

  async updateArea(area: { id: number; name: string }) {
    const res = await this.put<{ data: { id: number; area: string } }>(
      `/api/portal/admin/areas/${area.id}`,
      { area: area.name },
    );
    return { id: res.data.id, name: res.data.area, students: 0 };
  }

  async deleteArea(id: number) {
    return this.delete<{ message: string }>(`/api/portal/admin/areas/${id}`);
  }

  // Dashboard
  async totalStudentsPerAdvisor(filter?: 'mestrando' | 'doutorando' | 'completed') {
    const query = filter ? `?user_type=${filter}` : '';
    return this.get<{ [key: string]: Advisor }>(`/api/dashboard/total_students_per_advisor${query}`);
  }

  async totalProductionsPerYear(filter?: 'journal' | 'conference') {
    const query = filter ? `?publisher_type=${filter}` : '';
    return this.get<{ [key: string]: number }>(`/api/dashboard/all_production${query}`);
  }

  async studentsPerField(filter?: 'mestrando' | 'doutorando' | 'completed') {
    const query = filter ? `?selectedFilter=${filter}` : '';
    return this.get<{ [key: string]: number }>(`/api/dashboard/fields${query}`);
  }

  async studentsPerSubfield(filter?: 'mestrando' | 'doutorando' | 'completed') {
    const query = filter ? `?selectedFilter=${filter}` : '';
    return this.get<{ [key: string]: number }>(`/api/dashboard/subfields${query}`);
  }

  async productionPerQualis() {
    return this.get<{ [key: string]: number }>('/api/dashboard/production_per_qualis');
  }

  async defensesPerYear(filter?: 'mestrado' | 'doutorado') {
    const query = filter ? `?filter=${filter}` : '';
    return this.get<{ [key: string]: number }>(`/api/dashboard/defenses_per_year${query}`);
  }

  async enrollmentsPerYear(filter?: 'mestrado' | 'doutorado') {
    const query = filter ? `?filter=${filter}` : '';
    return this.get<{ [key: string]: number }>(`/api/dashboard/enrollments_per_year${query}`);
  }

  async professors() {
    const res = await this.get<{ data: { id: number; name: string }[] }>('/api/dashboard/professors');
    return res.data;
  }

  async professorProductionPerYear(professorId: number, startYear?: number, endYear?: number) {
    const year = new Date().getFullYear();
    const from = startYear ?? year - 2;
    const to = endYear ?? year;
    const res = await this.get<{ productions: { [key: string]: number } }>(
      `/api/dashboard/professor/${professorId}/productions?anoInicial=${from}&anoFinal=${to}`,
    );
    return res.productions;
  }

  // Auth
  async login(email: string, password: string) {
    return this.post<{ token: string }>('/api/login', { email, password });
  }

  // Qualis
  async getAllQualis() {
    const res = await this.get<{ data: Array<{ id: number; code: string; score: number; created_at: string; updated_at: string }> }>(
      '/api/portal/admin/qualis',
    );
    return res.data;
  }

  async updateQualis(id: number, body: RequestBodyType) {
    return this.put(`/api/portal/admin/qualis/${id}`, body);
  }

  async fetchProfessors(
    page: number = 1,
    perPage: number = 15,
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

    const url = `/api/portal/admin/professors?${params.toString()}`;
    const res = await this.get<PaginatedResponse<Professor>>(url);
    return res;
  }

  async getAllProfessors(searchTerm = ''): Promise<Professor[]> {
    const allProfessors: Professor[] = [];
    let currentPage = 1;
    let lastPage: number;

    do {
      const { data, last_page } = await this.get(
        `/api/portal/admin/professors?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`,
      ) as any;

      allProfessors.push(...data);
      lastPage = last_page;
      currentPage++;
    } while (currentPage <= lastPage);

    return allProfessors.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProductionsByProfessor(professorId: number) {
    const response = await this.get<{ data: Production[] }>(`/api/portal/admin/professors/${professorId}/productions`);
    return response.data;
  }


  async numberOfStudents(): Promise<{ category: string; amount: number }[]> {
    const res = (await this.get('/api/dashboard/students')) as Record<
      string,
      {
        in_progress: number,
        completed: number,
      }
    >;

    return Object.entries(res).map(([ course, students ]) => [
      { category: `${course} - Alunos atuais`, amount: students.in_progress },
      { category: `${course} - Alunos concluídos`, amount: students.completed },
    ]).flat();
  }

  async createQualis(body: RequestBodyType, headers: Record<string, string> = {}): Promise<unknown> {
    const endpoint = '/api/portal/admin/qualis';
    const response = await this.post(endpoint, body, headers);
    return response;
  }

  async deleteQualis(id: number, headers: Record<string, string> = {}): Promise<unknown> {
    const endpoint = `/api/portal/admin/qualis/${id}`;
    const response = await this.delete(endpoint, headers);
    return response;
  }

  async executeScraping() {
    return this.post('/api/portal/admin/execute_scraping', {});
  }

  async getScrapingExecutions() {
    const response = await this.get('/api/scraping_execution') as {
      status: string,
      message: string,
      data: {
        id: number,
        command: string,
        executed_at: string,
      }[],
    };

    return response.data;
  }

  async getScrapingInterval() {
    const res = await this.get('/api/portal/admin/scraping_execution_interval');
    return res as {
      intervalDays: number,
    };
  }

  async setScrapingInterval(intervalDays: number) {
    return this.post('/api/portal/admin/scraping_execution_interval', { days: intervalDays });
  }

}

const API_SINGLETON = new ApiService(import.meta.env.VITE_API_ENDPOINT ?? 'http://localhost:80');
export default API_SINGLETON;
