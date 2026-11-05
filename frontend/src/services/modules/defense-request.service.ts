import {
  DefenseAnswers,
  DefenseForm,
  DefenseRequest,
  DefenseRequestType,
  MemberOption,
  StudentOption,
} from "@/features/defense-requests/types";
import { apiClient } from "../http-client";

export interface DefenseRequestInput {
  type: DefenseRequestType;
  data: DefenseAnswers;
  student_user_id?: number | null;
}

export const defenseRequestService = {
  async listForms() {
    const response = await apiClient.get<{ data: DefenseForm[] }>("/api/portal/defense-request-forms");
    return response.data;
  },

  async listMine() {
    const response = await apiClient.get<{ data: DefenseRequest[] }>("/api/portal/defense-requests");
    return response.data;
  },

  async create(input: DefenseRequestInput) {
    const response = await apiClient.post<{ data: DefenseRequest }>("/api/portal/defense-requests", input);
    return response.data;
  },

  /** Orientador revisa o que o orientando abriu, confirma e envia. */
  async review({ id, ...input }: DefenseRequestInput & { id: number }) {
    const response = await apiClient.put<{ data: DefenseRequest }>(`/api/portal/defense-requests/${id}`, input);
    return response.data;
  },

  async lookupStudents(q: string) {
    const response = await apiClient.get<{ data: StudentOption[] }>(
      `/api/portal/defense-requests/lookup/students?q=${encodeURIComponent(q)}`,
    );
    return response.data;
  },

  async lookupMembers(q: string) {
    const response = await apiClient.get<{ data: MemberOption[] }>(
      `/api/portal/defense-requests/lookup/members?q=${encodeURIComponent(q)}`,
    );
    return response.data;
  },

  /** Coordenação: todas as solicitações. */
  async listAll() {
    const response = await apiClient.get<{ data: DefenseRequest[] }>("/api/admin/defense-requests");
    return response.data;
  },
};
