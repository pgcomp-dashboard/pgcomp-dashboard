// TODO: what is the format of error responses from the API?
export interface ApiError {
  code: number,
  errors: {
    description: string
  }[]
}

export type RequestBodyType = BodyInit | null | undefined;

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(
    endpoint: string,
    method: string,
    body: RequestBodyType,
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    const url = `${this.baseUrl}${endpoint}`;
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
        console.error('Api returned invalid json data:', e);
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

  async totalStudentsPerAdvisor(filter?: 'journal' | 'conference'): Promise<{ [key: string]: number }> {
    return await this.get(filter ? '/api/dashboard/total_students_per_advisor?publisher_type=${filter}' : '/api/dashboard/total_students_per_advisor') as { [key: string]: number };
  }

  async totalProductionsPerYear(filter?: 'journal' | 'conference'): Promise<{ [key: string]: number }> {
    return await this.get(filter ? '/api/dashboard/all_production?publisher_type=${filter}' : '/api/dashboard/all_production') as { [key: string]: number };
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

}

const API_SINGLETON = new ApiService(import.meta.env.VITE_API_ENDPOINT ?? 'http://localhost:80');

(async () => {
  console.log(await API_SINGLETON.studentsPerField());
})();

export default API_SINGLETON;
