export type InternationalizationLevel = "professor" | "student";
export type InternationalizationCourse = "masters" | "doctorate" | "professor";
export type LattesStatus = "registered" | "pending";
export type FileSlot = "document" | "photo_1" | "photo_2" | "photo_3";

export const FILE_SLOTS: FileSlot[] = ["document", "photo_1", "photo_2", "photo_3"];

export interface InternationalizationCategory {
  id: number;
  name: string;
  actions_count?: number;
}

export interface ActionSubmitter {
  id: number;
  name: string;
  email: string;
}

export interface InternationalizationAction {
  id: number;
  category_id: number;
  category_name?: string;
  full_name: string;
  registration_number: string;
  level: InternationalizationLevel;
  course: InternationalizationCourse;
  lattes_status: LattesStatus;
  advisor_name: string | null;
  country: string | null;
  institution: string | null;
  foreign_research_group: string | null;
  foreign_researcher: string | null;
  description: string;
  start_date: string;
  end_date: string;
  call_notice: string | null;
  url: string | null;
  /** Nome do arquivo em cada slot (ou null). */
  files: Record<FileSlot, string | null>;
  submitted_by?: ActionSubmitter | null;
}

export interface ActionInput {
  category_id: number;
  full_name: string;
  registration_number: string;
  level: InternationalizationLevel;
  course: InternationalizationCourse;
  lattes_status: LattesStatus;
  advisor_name: string;
  country: string;
  institution: string;
  foreign_research_group: string;
  foreign_researcher: string;
  description: string;
  start_date: string;
  end_date: string;
  call_notice: string;
  url: string;
  files: Partial<Record<FileSlot, File>>;
  remove_files: FileSlot[];
}

export interface InternationalizationDashboardSummary {
  years: number[];
  total: number;
  countries_count: number;
  by_level: Record<InternationalizationLevel, number>;
  by_lattes_status: Record<LattesStatus, number>;
  per_category: { name: string; total: number }[];
  per_country: { name: string; total: number }[];
  per_year: { year: number; total: number }[];
}

export const LEVEL_LABEL: Record<InternationalizationLevel, string> = {
  professor: "Docente",
  student: "Discente",
};

export const COURSE_LABEL: Record<InternationalizationCourse, string> = {
  masters: "Mestrado",
  doctorate: "Doutorado",
  professor: "Docente",
};

export const LATTES_LABEL: Record<LattesStatus, string> = {
  registered: "Sim",
  pending: "Não, mas irei",
};

export const FILE_SLOT_LABEL: Record<FileSlot, string> = {
  document: "Documentos e comprovantes",
  photo_1: "Foto 1 da atividade ou ação",
  photo_2: "Foto 2 da atividade ou ação",
  photo_3: "Foto 3 da atividade ou ação",
};

export const DOCUMENT_MAX_BYTES = 1024 * 1024;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

/** 2025-03-01 -> 01/03/2025 (sem passar por Date, para não deslocar o dia por fuso). */
export const formatDate = (iso: string) => iso.split("-").reverse().join("/");

export const formatPeriod = (action: Pick<InternationalizationAction, "start_date" | "end_date">) =>
  action.start_date === action.end_date
    ? formatDate(action.start_date)
    : `${formatDate(action.start_date)} a ${formatDate(action.end_date)}`;
