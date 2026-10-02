export type AwardRecipientType = "professor" | "student" | "staff";
export type AwardScope = "national" | "international";

export interface AwardCategory {
  id: number;
  name: string;
  awards_count?: number;
}

export interface AwardSubmitter {
  id: number;
  name: string;
  email: string;
}

export interface AwardWinner {
  name: string;
  recipient_type: AwardRecipientType;
}

export interface Award {
  id: number;
  winners: AwardWinner[];
  year: number;
  scope: AwardScope;
  category_id: number;
  category_name?: string;
  description: string;
  url: string | null;
  attachment_name: string | null;
  submitted_by?: AwardSubmitter | null;
}

export interface AwardInput {
  winners: AwardWinner[];
  year: number;
  scope: AwardScope;
  category_id: number;
  description: string;
  url: string | null;
  attachment: File | null;
  remove_attachment?: boolean;
}

export interface AwardsDashboardSummary {
  years: number[];
  total: number;
  by_recipient_type: Record<AwardRecipientType, number>;
  by_scope: Record<AwardScope, number>;
  per_category: { name: string; total: number }[];
  per_year: { year: number; total: number }[];
}

export const RECIPIENT_TYPE_LABEL: Record<AwardRecipientType, string> = {
  professor: "Docente",
  student: "Discente",
  staff: "Técnico Administrativo",
};

export const SCOPE_LABEL: Record<AwardScope, string> = {
  national: "Nacional",
  international: "Internacional",
};

/** Nomes dos vencedores separados por vírgula, para textos e diálogos. */
export const winnerNames = (award: Pick<Award, "winners">) =>
  award.winners.map((w) => w.name).join(", ");

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
