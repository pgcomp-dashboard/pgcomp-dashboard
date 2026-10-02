import {
  ActionInput,
  FILE_SLOTS,
  InternationalizationAction,
  InternationalizationCategory,
  InternationalizationDashboardSummary,
  FileSlot,
} from "@/features/internationalization/types";
import { apiClient } from "../http-client";

function toFormData(input: ActionInput): FormData {
  const form = new FormData();
  const { files, remove_files, category_id, ...fields } = input;

  form.append("category_id", String(category_id));
  // Campos opcionais vazios vão como "" (viram null no backend), o que permite limpá-los ao editar.
  Object.entries(fields).forEach(([key, value]) => form.append(key, value as string));

  FILE_SLOTS.forEach((slot) => {
    const file = files[slot];
    if (file) form.append(`files[${slot}]`, file);
  });
  remove_files.forEach((slot, index) => form.append(`remove_files[${index}]`, slot));
  return form;
}

/** Operações de ação iguais no portal (do usuário) e no admin (de todos). */
function actionOperations(base: string) {
  return {
    async listActions() {
      const response = await apiClient.get<{ data: InternationalizationAction[] }>(
        `${base}/internationalization-actions`,
      );
      return response.data;
    },

    // A API atualiza via POST porque o PHP não lê multipart em PUT.
    async updateAction({ id, ...input }: ActionInput & { id: number }) {
      const response = await apiClient.post<{ data: InternationalizationAction }>(
        `${base}/internationalization-actions/${id}`,
        toFormData(input),
      );
      return response.data;
    },

    async deleteAction(id: number) {
      return apiClient.delete<{ message: string }>(
        `${base}/internationalization-actions/${id}`,
      );
    },

    async downloadFile(action: Pick<InternationalizationAction, "id" | "files">, slot: FileSlot) {
      return apiClient.download(
        `${base}/internationalization-actions/${action.id}/files/${slot}`,
        action.files[slot] ?? `internacionalizacao-${action.id}`,
      );
    },
  };
}

/** Área do usuário: cadastra e gerencia as próprias ações. */
export const myInternationalizationService = {
  ...actionOperations("/api/portal"),

  async createAction(input: ActionInput) {
    const response = await apiClient.post<{ data: InternationalizationAction }>(
      "/api/portal/internationalization-actions",
      toFormData(input),
    );
    return response.data;
  },

  async listCategories() {
    const response = await apiClient.get<{ data: InternationalizationCategory[] }>(
      "/api/portal/internationalization-categories",
    );
    return response.data;
  },
};

/** Área da coordenação: todas as ações, categorias e dashboard. */
export const internationalizationService = {
  ...actionOperations("/api/admin"),

  async listCategories() {
    const response = await apiClient.get<{ data: InternationalizationCategory[] }>(
      "/api/admin/internationalization-categories",
    );
    return response.data;
  },

  async createCategory(input: { name: string }) {
    const response = await apiClient.post<{ data: InternationalizationCategory }>(
      "/api/admin/internationalization-categories",
      input,
    );
    return response.data;
  },

  async updateCategory({ id, name }: { id: number; name: string }) {
    const response = await apiClient.put<{ data: InternationalizationCategory }>(
      `/api/admin/internationalization-categories/${id}`,
      { name },
    );
    return response.data;
  },

  async deleteCategory(id: number) {
    return apiClient.delete<{ message: string }>(
      `/api/admin/internationalization-categories/${id}`,
    );
  },

  async getDashboard(year?: number) {
    return apiClient.get<InternationalizationDashboardSummary>(
      "/api/admin/internationalization-dashboard",
      { year },
    );
  },
};
