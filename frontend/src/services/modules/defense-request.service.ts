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

/** Portal (discente/orientador) ou admin (coordenação): mesmas ações, rotas diferentes. */
export type DefenseScope = "portal" | "admin";
const base = (scope: DefenseScope) => `/api/${scope}/defense-requests`;

export const defenseRequestService = {
  async listForms() {
    const response = await apiClient.get<{ data: DefenseForm[] }>("/api/portal/defense-request-forms");
    return response.data;
  },

  async listMine(archived = false) {
    const response = await apiClient.get<{ data: DefenseRequest[] }>(base("portal"), archived ? { archived: 1 } : {});
    return response.data;
  },

  /** Arquivar (soft delete): sai da lista e da regra de duplicata; pode ser restaurada. */
  async archive(scope: DefenseScope, id: number) {
    const response = await apiClient.delete<{ data: DefenseRequest }>(`${base(scope)}/${id}`);
    return response.data;
  },

  async restore(scope: DefenseScope, id: number) {
    const response = await apiClient.post<{ data: DefenseRequest }>(`${base(scope)}/${id}/restore`, {});
    return response.data;
  },

  /** Apagar de vez (sem volta). */
  async destroy(scope: DefenseScope, id: number) {
    await apiClient.delete(`${base(scope)}/${id}/permanent`);
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
  async listAll(archived = false) {
    const response = await apiClient.get<{ data: DefenseRequest[] }>(base("admin"), archived ? { archived: 1 } : {});
    return response.data;
  },
};
