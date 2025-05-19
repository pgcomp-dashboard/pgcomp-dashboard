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
        errors: [ { description: String(e) } ],
      } as ApiError;
    }

    if (!response.ok) {
      const error: ApiError = {
        code: response.status,
        errors: [ { description: 'Request failed' } ],
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
  //        CRUD - Áreas
  // --------------------------

  async fetchAreas(): Promise<Area[]> {
    const response = await this.get('/api/areas') as { data: any[] };
    return response.data.map((item) => ({
      id: item.id,
      name: item.area,
      students: 0, // Precisa mexer no AreaController para receber a quantidade de estudantes por área.
    }));
  }

  async createArea(area: { name: string; students: number }): Promise<Area> {
    const response = await this.post('/api/areas', JSON.stringify({
      area: area.name,
    })) as any;
    return {
      id: response.id,
      name: response.area,
      students: 0,
    };
  }

  async updateArea(area: { id: number; name: string; students: number }): Promise<Area> {
    const response = await this.put(`/api/areas/${area.id}`, JSON.stringify({
      area: area.name,
    })) as any;
    return {
      id: response.id,
      name: response.area,
      students: 0,
    };
  }

  async deleteArea(id: number): Promise<{ message: string }> {
    return await this.delete(`/api/areas/${id}`) as { message: string };
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







}

const API_SINGLETON = new ApiService(import.meta.env.VITE_API_ENDPOINT ?? 'http://localhost:80');

export default API_SINGLETON;
