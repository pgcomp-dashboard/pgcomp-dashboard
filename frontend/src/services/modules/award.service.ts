import {
  Award,
  AwardCategory,
  AwardInput,
  AwardsDashboardSummary,
} from "@/features/awards/types";
import { apiClient } from "../http-client";

function toFormData(input: AwardInput): FormData {
  const form = new FormData();
  input.winners.forEach((winner, index) => {
    form.append(`winners[${index}][name]`, winner.name);
    form.append(`winners[${index}][recipient_type]`, winner.recipient_type);
  });
  form.append("year", String(input.year));
  form.append("scope", input.scope);
  form.append("award_category_id", String(input.category_id));
  form.append("description", input.description);
  // Vazio vira null no backend, o que permite limpar a URL ao editar.
  form.append("url", input.url ?? "");
  if (input.attachment) form.append("attachment", input.attachment);
  if (input.remove_attachment) form.append("remove_attachment", "1");
  return form;
}

/** Operações de prêmio iguais no portal (do usuário) e no admin (de todos). */
function awardOperations(base: string) {
  return {
    async listAwards() {
      const response = await apiClient.get<{ data: Award[] }>(`${base}/awards`);
      return response.data;
    },

    // A API atualiza via POST porque o PHP não lê multipart em PUT.
    async updateAward({ id, ...input }: AwardInput & { id: number }) {
      const response = await apiClient.post<{ data: Award }>(
        `${base}/awards/${id}`,
        toFormData(input),
      );
      return response.data;
    },

    async deleteAward(id: number) {
      return apiClient.delete<{ message: string }>(`${base}/awards/${id}`);
    },

    async downloadAttachment(award: Pick<Award, "id" | "attachment_name">) {
      return apiClient.download(
        `${base}/awards/${award.id}/attachment`,
        award.attachment_name ?? `premio-${award.id}`,
      );
    },
  };
}

/** Área do usuário: cadastra e gerencia os próprios prêmios. */
export const myAwardService = {
  ...awardOperations("/api/portal"),

  async createAward(input: AwardInput) {
    const response = await apiClient.post<{ data: Award }>(
      "/api/portal/awards",
      toFormData(input),
    );
    return response.data;
  },

  async listCategories() {
    const response = await apiClient.get<{ data: AwardCategory[] }>(
      "/api/portal/award-categories",
    );
    return response.data;
  },
};

/** Área da coordenação: todos os prêmios, categorias e dashboard. */
export const awardService = {
  ...awardOperations("/api/admin"),

  async listCategories() {
    const response = await apiClient.get<{ data: AwardCategory[] }>(
      "/api/admin/award-categories",
    );
    return response.data;
  },

  async createCategory(input: { name: string }) {
    const response = await apiClient.post<{ data: AwardCategory }>(
      "/api/admin/award-categories",
      input,
    );
    return response.data;
  },

  async updateCategory({ id, name }: { id: number; name: string }) {
    const response = await apiClient.put<{ data: AwardCategory }>(
      `/api/admin/award-categories/${id}`,
      { name },
    );
    return response.data;
  },

  async deleteCategory(id: number) {
    return apiClient.delete<{ message: string }>(
      `/api/admin/award-categories/${id}`,
    );
  },

  async getDashboard(year?: number) {
    return apiClient.get<AwardsDashboardSummary>(
      "/api/admin/awards-dashboard",
      { year },
    );
  },
};
