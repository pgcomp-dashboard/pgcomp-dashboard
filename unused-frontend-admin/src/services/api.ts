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

  async login(email: string, password: string): Promise<{ token: string }> {
    return await this.post('/api/login', JSON.stringify({ email, password })) as {
      token: string
    };
  }
}

const API_SINGLETON = new ApiService(import.meta.env.VITE_API_ENDPOINT ?? 'http://localhost:80');

export default API_SINGLETON;
