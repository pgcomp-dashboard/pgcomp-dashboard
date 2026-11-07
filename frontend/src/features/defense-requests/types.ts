/** Tipos da solicitação de banca. O schema vem da API (DefenseRequestForms no backend). */
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
  /** Versão do formulário com que as respostas foram gravadas. */
  schema_version: number;
  /** Arquivada (soft delete): fora da lista e da regra de duplicata; pode ser restaurada. */
  archived_at: string | null;
  archived_by?: PersonRef | null;
  can_review: boolean;
  can_archive: boolean;
  can_restore: boolean;
  /** Apagar de vez (sem volta). */
  can_delete: boolean;
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

/*
 * Status espelha App\Enums\DefenseRequestStatus. Os mapas abaixo são Record<DefenseStatus, …>:
 * um status novo no tipo faz o TypeScript cobrar rótulo, cor e mensagem (nada cai num "else").
 */
export const STATUS_LABEL: Record<DefenseStatus, string> = {
  awaiting_advisor: "Aguardando orientador",
  submitted: "Enviada à coordenação",
};

export const STATUS_TONE: Record<DefenseStatus, string> = {
  awaiting_advisor: "border-amber-500/50 text-amber-700 dark:text-amber-400",
  submitted: "border-emerald-500/50 text-emerald-700 dark:text-emerald-400",
};

/** Mensagem depois de abrir a solicitação, conforme o estado em que ela nasceu. */
export const STATUS_CREATED_MESSAGE: Record<DefenseStatus, (request: DefenseRequest) => string> = {
  awaiting_advisor: (r) => `Solicitação enviada para ${r.advisor?.name ?? "seu orientador"} revisar.`,
  submitted: () => "Solicitação de banca enviada à coordenação!",
};

/** Papel no fluxo de banca (espelha DefenseRequestPolicy::create). A coordenação só acompanha pelo /admin. */
export type DefenseRole = "student" | "advisor" | "coordination";

export const defenseRole = (userType: string | undefined): DefenseRole =>
  userType === "student" ? "student" : userType === "manager" ? "coordination" : "advisor";

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
