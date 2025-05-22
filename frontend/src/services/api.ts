// TODO: what is the format of error responses from the API?
export interface ApiError {
  code: number;
  errors: {
    description: string;
  }[];
}

interface Advisor {
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
  email: string;
  area_id: number;
  course_id: number;
  lattes_url: string;
  defended_at: string;
}

export interface Course {
  id: number;
  name: string;
}


export type RequestBodyType = BodyInit | null | undefined;

export class ApiService {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(newToken?: string) {
    this.authToken = newToken;
  }

  private async request(
    endpoint: string,
    method: string,
    body: RequestBodyType,
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    const url = `${this.baseUrl}${endpoint}`;

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    };

    let response;
    try {
      response = await fetch(url, options);
    } catch (e) {
      console.error(`Failed to fetch ${endpoint}:`, e);
      throw {
        code: 408,
        errors: [{ description: String(e) }],
      } as ApiError;
    }

    if (!response.ok) {
      const error: ApiError = {
        code: response.status,
        errors: [{ description: 'Request failed' }],
      };
      try {
        const json = await response.json();
        error.errors = json.errors;
      } catch (e) {
        console.error('API returned invalid JSON data:', e);
      }
      throw error;
    }

    return await response.json();
  }

  async get(endpoint: string, headers: Record<string, string> = {}): Promise<unknown> {
    return this.request(endpoint, 'GET', undefined, headers);
  }

  async post(endpoint: string, body: RequestBodyType, headers: Record<string, string> = {}): Promise<unknown> {
    return this.request(endpoint, 'POST', body, headers);
  }

  async put(endpoint: string, body: RequestBodyType, headers: Record<string, string> = {}): Promise<unknown> {
    return this.request(endpoint, 'PUT', body, headers);
  }

  async delete(endpoint: string, headers: Record<string, string> = {}): Promise<unknown> {
    return this.request(endpoint, 'DELETE', undefined, headers);
  }

  // --------------------------
  //        CRUD - Students
  // --------------------------

  async fetchStudents(): Promise<Student[]> {
    const response = await this.get('/api/portal/admin/students') as { data: Student[] };
    return response.data;
  }

  async fetchCourses(): Promise<Course[]> {
    const response = await this.get('/api/portal/admin/courses') as { data: Course[] };
    return response.data;
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
      students: 0, // Precisa mexer no AreaController para receber a quantidade de estudantes por área.
    }));
  }

  async createArea(area: { name: string; students: number }): Promise<Area> {
    const response = await this.post('/api/portal/admin/areas', JSON.stringify({
      area: area.name,
    })) as {
      status: string,
      message: string,
      data: {
        id: number,
        area: string,
        created_at: string,
        updated_at: string,
      }
    };
    return {
      id: response.data.id,
      name: response.data.area,
      students: 0,
    };
  }

  async updateArea(area: { id: number; name: string; students: number }): Promise<Area> {
    const response = await this.put(`/api/portal/admin/areas/${area.id}`, JSON.stringify({
      area: area.name,
    })) as {
      status: string,
      message: string,
      data: {
        id: number,
        area: string,
        created_at: string,
        updated_at: string,
      }
    };
    return {
      id: response.data.id,
      name: response.data.area,
      students: 0,
    };
  }

  async deleteArea(id: number): Promise<{ message: string }> {
    return await this.delete(`/api/portal/admin/areas/${id}`) as { message: string };
  }

  // --------------------------
  //        Dashboard
  // --------------------------

  async totalStudentsPerAdvisor(filter?: 'mestrando' | 'doutorando' | 'completed'): Promise<{ [key: string]: Advisor }> {
    return await this.get(filter ? `/api/dashboard/total_students_per_advisor?user_type=${filter}` : '/api/dashboard/total_students_per_advisor') as { [key: string]: Advisor };
  }

  async totalProductionsPerYear(filter?: 'journal' | 'conference'): Promise<{ [key: string]: number }> {
    return await this.get(filter ? `/api/dashboard/all_production?publisher_type=${filter}` : '/api/dashboard/all_production') as { [key: string]: number };
  }

  async studentsPerField(filter?: 'mestrando' | 'doutorando' | 'completed'): Promise<{ [key: string]: number }> {
    return await this.get(filter ? `/api/dashboard/fields?selectedFilter=${filter}` : '/api/dashboard/fields') as { [key: string]: number };
  }

  async studentsPerSubfield(filter?: 'mestrando' | 'doutorando' | 'completed'): Promise<{ [key: string]: number }> {
    return await this.get(filter ? `/api/dashboard/subfields?selectedFilter=${filter}` : '/api/dashboard/subfields') as { [key: string]: number };
  }

  async productionPerQualis(): Promise<{ [key: string]: number }> {
    return await this.get('/api/dashboard/production_per_qualis') as { [key: string]: number };
  }

  async defensesPerYear(filter?: 'mestrado' | 'doutorado'): Promise<{ [key: string]: number }> {
    return await this.get(filter ? `/api/dashboard/defenses_per_year?filter=${filter}` : '/api/dashboard/defenses_per_year') as { [key: string]: number };
  }

  async enrollmentsPerYear(filter?: 'mestrado' | 'doutorado'): Promise<{ [key: string]: number }> {
    return await this.get(filter ? `/api/dashboard/enrollments_per_year?filter=${filter}` : '/api/dashboard/enrollments_per_year') as { [key: string]: number };
  }

  async professors() {
    const res = await this.get('/api/dashboard/professors') as {
      status: string;
      data: { id: number, name: string }[],
    };
    return res.data;
  }

  async professorProductionPerYear(professorId: number, startYear?: number, endYear?: number) {
    const currentYear = new Date().getFullYear();

    if (!startYear) startYear = currentYear - 2;
    if (!endYear) endYear = currentYear;

    const res = await this.get(
      `/api/dashboard/professor/${professorId}/productions?anoInicial=${startYear}&anoFinal=${endYear}`,
    ) as {
      professor: string;
      productions: { [key: string]: number },
    };

    return res.productions;
  }

  // --------------------------
  //           Auth
  // --------------------------

  async login(email: string, password: string): Promise<{ token: string }> {
    return await this.post('/api/login', JSON.stringify({ email, password })) as {
      token: string
    };
  }

  async getAllQualis(): Promise<Array<{ id: number; code: string; score: number; created_at: string; updated_at: string }>> {
    const response = await this.get('/api/portal/admin/qualis') as { data: Array<{ id: number; code: string; score: number; created_at: string; updated_at: string }> };
    return response.data;
  }

  async updateQualis(id: number, body: RequestBodyType, headers: Record<string, string> = {}): Promise<unknown> {
    const endpoint = `/api/portal/admin/qualis/${id}`;
    const response = await this.put(endpoint, body, headers);
    return response;
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
