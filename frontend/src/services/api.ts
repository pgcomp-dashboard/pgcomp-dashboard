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
        let error: ApiError = {
          code: response.status,
          errors: [{ description: 'Erro ao se comunicar com a API.' }],
        };

        try {
          const json = await response.json();
          error.errors = json.errors ?? [{ description: json.message ?? 'Erro desconhecido.' }];
        } catch (jsonError) {
          console.error('Erro ao interpretar JSON de erro da API:', jsonError);
        }

        throw error;
      }

      return await response.json() as T;
    } catch (e) {
      console.error(`Erro na requisição para ${endpoint}:`, e);
      throw {
        code: 408,
        errors: [{ description: 'Falha de conexão com o servidor.' }],
      } as ApiError;
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
    perPage: number = 15,
    filters?: Record<string, any>
  ) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
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

  // Areas
  async fetchAreas() {
    const res = await this.get<{ data: { id: number; area: string }[] }>('/api/portal/admin/areas');
    return res.data.map(item => ({
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
      '/api/portal/admin/qualis'
    );
    return res.data;
  }

  async updateQualis(id: number, body: RequestBodyType) {
    return this.put(`/api/portal/admin/qualis/${id}`, body);
  }

  async getAllProfessors(): Promise<Professor[]> {
    let allProfessors: Professor[] = [];
    let currentPage = 1;
    let lastPage = 1;

    do {
      const response = await this.get(`/api/portal/admin/professors?page=${currentPage}`) as any;
      allProfessors = allProfessors.concat(response.data);
      lastPage = response.last_page;
      currentPage++;
    } while (currentPage <= lastPage);

    return allProfessors;
  }

  async numberOfStudents(): Promise<{ category: string; amount: number }[]> {
    // Dados mockados
  // MOCKED
    return [
      { category: 'Alunos Atuais - Mestrado', amount: 35 },
      { category: 'Alunos Atuais - Doutorado', amount: 80 },
      { category: 'Alunos Concluídos - Mestrado', amount: 200 },
      { category: 'Alunos Concluídos - Doutorado', amount: 250 },
    ];
  }
}

const API_SINGLETON = new ApiService(import.meta.env.VITE_API_ENDPOINT ?? 'http://localhost:80');
export default API_SINGLETON;