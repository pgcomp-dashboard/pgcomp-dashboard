import { ApiError, RequestBodyType } from "@/types/common";

function flattenErrorMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (item && typeof item === "object") {
        const entry = item as { description?: unknown; message?: unknown };
        if (typeof entry.description === "string") return [entry.description];
        if (typeof entry.message === "string") return [entry.message];
      }
      return [];
    });
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenErrorMessages);
  }
  return [];
}

function isRateLimitError(message: string): boolean {
  return /too many attempts|too many requests|rate limit|throttl/i.test(
    message,
  );
}

export function parseApiError(error: unknown): string {
  if (error && typeof error === "object") {
    const apiError = error as Partial<ApiError>;
    const details = flattenErrorMessages(apiError.errors);
    const messages = [
      ...details,
      ...(typeof apiError.message === "string" ? [apiError.message] : []),
    ];
    const rateLimitMessage = messages.find(isRateLimitError);

    if (apiError.code === 429 || rateLimitMessage) {
      return apiError.retryAfter
        ? `Muitas tentativas. Aguarde ${apiError.retryAfter} segundos e tente novamente.`
        : "Muitas tentativas. Aguarde um pouco e tente novamente.";
    }

    if (typeof apiError.code === "number" && apiError.code >= 500) {
      return "Erro interno do servidor. Tente novamente mais tarde.";
    }

    if (details.length > 0) return details.join("\n");
    if (typeof apiError.message === "string") return apiError.message;

    if (apiError.code === 408) return "Falha de conexão com o servidor.";
  }
  return "Erro desconhecido.";
}

export class HttpClient {
  protected baseUrl: string;
  protected authToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token?: string) {
    this.authToken = token;
  }

  getAuthToken() {
    return this.authToken;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  protected async request<T>(
    endpoint: string,
    method: string,
    body: RequestBodyType = undefined,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<T> {
    const queryParams = new URLSearchParams();

    const appendParam = (key: string, value: any) => {
      if (value === undefined || value === null) return;

      if (typeof value === "object" && !Array.isArray(value)) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          appendParam(`${key}[${subKey}]`, subValue);
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          appendParam(`${key}[${index}]`, item);
        });
      } else {
        queryParams.append(key, value.toString());
      }
    };

    Object.entries(params).forEach(([key, value]) => {
      appendParam(key, value);
    });

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ""}`;

    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    };

    //Form Data is only used to send files, remove content-type so the type can be set automatically to multiform-data
    if (body instanceof FormData) {
      delete finalHeaders["Content-Type"];
    }

    if (this.authToken) {
      finalHeaders["Authorization"] = `Bearer ${this.authToken}`;
    }

    let requestBody: BodyInit | undefined = undefined;
    if (
      body &&
      typeof body === "object" &&
      finalHeaders["Content-Type"] === "application/json"
    ) {
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
        let responseBody: Record<string, unknown> = {};
        try {
          responseBody = await response.json();
        } catch {
          responseBody = {};
        }

        const details = flattenErrorMessages(responseBody.errors);
        const responseMessage =
          typeof responseBody.message === "string" ? responseBody.message : "";
        const hasRateLimitMessage = [responseMessage, ...details].some(
          isRateLimitError,
        );
        const retryAfterValue = response.headers.get("Retry-After");
        const retryAfterHeader = retryAfterValue
          ? Number(retryAfterValue)
          : NaN;
        const retryAfter = Number.isFinite(retryAfterHeader)
          ? retryAfterHeader
          : undefined;
        let message = responseMessage;

        if (response.status === 429 || hasRateLimitMessage) {
          message = "Muitas tentativas. Aguarde um pouco e tente novamente.";
        } else if (response.status >= 500) {
          message = "Erro interno do servidor. Tente novamente mais tarde.";
        } else if (!message && details.length === 0) {
          message =
            response.status === 408
              ? "Falha de conexão com o servidor."
              : "Erro ao se comunicar com a API.";
        }

        const error: ApiError = {
          code: response.status,
          message,
          retryAfter,
          errors:
            details.length > 0
              ? details.map((description) => ({ description }))
              : [{ description: message }],
        };

        throw error;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (e: unknown) {
      if (
        Object.prototype.hasOwnProperty.call(e, "code") &&
        Object.prototype.hasOwnProperty.call(e, "errors")
      ) {
        throw e;
      } else {
        console.error(`Erro na requisição para ${endpoint}:`, e);
        throw {
          code: 408,
          errors: [{ description: "Falha de conexão com o servidor." }],
        } as ApiError;
      }
    }
  }

  async get<T>(
    endpoint: string,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ) {
    return this.request<T>(endpoint, "GET", undefined, params, headers);
  }

  async post<T>(
    endpoint: string,
    body: RequestBodyType,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ) {
    return this.request<T>(endpoint, "POST", body, params, headers);
  }

  async put<T>(
    endpoint: string,
    body: RequestBodyType,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ) {
    return this.request<T>(endpoint, "PUT", body, params, headers);
  }

  async delete<T>(
    endpoint: string,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ) {
    return this.request<T>(endpoint, "DELETE", undefined, params, headers);
  }

  async patch<T>(
    endpoint: string,
    body: RequestBodyType,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ) {
    return this.request<T>(endpoint, "PATCH", body, params, headers);
  }

  async download(
    endpoint: string,
    filename: string,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ""}`;

    const finalHeaders: Record<string, string> = {
      Accept: "application/xml, application/octet-stream, */*",
      ...headers,
    };

    if (this.authToken) {
      finalHeaders["Authorization"] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: finalHeaders,
      });

      if (!response.ok) {
        throw new Error("Erro ao baixar o arquivo.");
      }

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let finalFilename = filename;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?($|;)/);
        if (match && match[1]) {
          finalFilename = match[1];
        }
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", finalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error("Erro no download:", e);
      throw e;
    }
  }
}

const savedToken =
  typeof window !== "undefined"
    ? localStorage.getItem("auth-token")
    : undefined;

export const apiClient = new HttpClient(
  import.meta.env.VITE_API_ENDPOINT ?? "http://localhost:80",
);

if (savedToken) {
  apiClient.setAuthToken(savedToken);
}
