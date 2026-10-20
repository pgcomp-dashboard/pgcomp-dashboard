import { AwardRecipientType, AwardScope } from "@/features/awards/types";
import {
  InternationalizationCourse,
  InternationalizationLevel,
} from "@/features/internationalization/types";
import { apiClient } from "../http-client";

export interface PublicAward {
  id: number;
  year: number;
  category_name: string;
  scope: AwardScope;
  description: string;
  url: string | null;
  winners: { name: string; recipient_type: AwardRecipientType }[];
}

export interface PublicInternationalizationAction {
  id: number;
  category_name: string;
  full_name: string;
  level: InternationalizationLevel;
  course: InternationalizationCourse;
  country: string | null;
  institution: string | null;
  start_date: string;
  end_date: string;
  description: string;
  url: string | null;
}

/** Listagens abertas: não precisam de login e não trazem dados privados. */
export const publicService = {
  async listAwards() {
    const response = await apiClient.get<{ data: PublicAward[] }>("/api/public/awards");
    return response.data;
  },

  async listInternationalization() {
    const response = await apiClient.get<{ data: PublicInternationalizationAction[] }>(
      "/api/public/internationalization-actions",
    );
    return response.data;
  },
};
