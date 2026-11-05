/** POC: tipos de solicitação de banca. O schema vem da API (DefenseRequestForms no backend). */
export type DefenseRequestType =
  | "masters_qualification"
  | "masters_defense"
  | "doctoral_qualification"
  | "doctoral_defense";

export type DefenseLevel = "mestrado" | "doutorado";
export type DefenseStage = "qualification" | "defense";

export type DefenseFieldType = "text" | "textarea" | "date" | "time" | "confirm" | "member";

/** Vaga de banca: pede membro externo, interno (PGCOMP) ou qualquer um. */
export type MemberKind = "external" | "internal" | "any";

export interface DefenseFormField {
  key: string;
  label: string;
  type: DefenseFieldType;
  required: boolean;
  section: string;
  kind?: MemberKind;
  lattes_required?: boolean;
  substitute?: boolean;
}

export interface DefenseForm {
  type: DefenseRequestType;
  level: DefenseLevel;
  stage: DefenseStage;
  label: string;
  title: string;
  fields: DefenseFormField[];
}

export interface MemberValue {
  user_id: number | null;
  name: string;
  affiliation: string;
  lattes: string | null;
}

export type DefenseAnswerValue = string | boolean | MemberValue | null;
export type DefenseAnswers = Record<string, DefenseAnswerValue>;

export type DefenseStatus = "awaiting_advisor" | "submitted";

export interface PersonRef {
  id: number;
  name: string;
}

export interface DefenseRequest {
  id: number;
  type: DefenseRequestType;
  type_label: string;
  status: DefenseStatus;
  answers: DefenseAnswers;
  student_user_id: number | null;
  advisor_user_id: number | null;
  submitted_by?: { id: number; name: string; email: string } | null;
  advisor?: PersonRef | null;
  can_review: boolean;
  submitted_at: string | null;
  created_at: string;
}

/** Discente vindo do cadastro: nível pelo curso, orientador e coorientador vinculados. */
export interface StudentOption {
  id: number;
  name: string;
  registration: number | null;
  level: DefenseLevel | null;
  advisor: PersonRef | null;
  co_advisor: PersonRef | null;
  is_mine: boolean;
}

/** Sugestão de membro de banca: docente do PGCOMP ou externo de uma banca anterior. */
export interface MemberOption extends MemberValue {
  source: "pgcomp" | "previous";
}

export const STATUS_LABEL: Record<DefenseStatus, string> = {
  awaiting_advisor: "Aguardando orientador",
  submitted: "Enviada à coordenação",
};

export const LEVEL_LABEL: Record<DefenseLevel, string> = { mestrado: "Mestrado", doutorado: "Doutorado" };
export const STAGE_LABEL: Record<DefenseStage, string> = { qualification: "Qualificação", defense: "Defesa" };

export const KIND_LABEL: Record<MemberKind, string> = {
  external: "Externo",
  internal: "Interno (PGCOMP)",
  any: "Interno ou externo",
};

export const isMember = (value: DefenseAnswerValue | undefined): value is MemberValue =>
  !!value && typeof value === "object" && "name" in value;

/** Agrupa os campos por seção, na ordem em que aparecem no schema. */
export function groupBySection(fields: DefenseFormField[]): [string, DefenseFormField[]][] {
  const groups = new Map<string, DefenseFormField[]>();
  fields.forEach((field) => groups.set(field.section, [...(groups.get(field.section) ?? []), field]));
  return [...groups.entries()];
}

/** 2026-12-10 -> 10/12/2026 (sem passar por Date, para não deslocar o dia por fuso). */
export const formatDate = (iso: string | null | undefined) =>
  iso ? iso.split("-").reverse().join("/") : "—";
