import { DefenseAnswers, DefenseLevel, DefenseStage, StudentOption } from "@/features/defense-requests/types";

/**
 * Rascunho do wizard na sessão do navegador: se a sessão expirar (ou a página recarregar)
 * no meio do preenchimento, a pessoa entra de novo e continua de onde parou.
 * Um por usuário e por solicitação ("new" = abertura; id = revisão).
 */
export interface DefenseDraft {
  level: DefenseLevel | null;
  stage: DefenseStage | null;
  student: StudentOption | null;
  answers: DefenseAnswers;
  step: number;
  openOptional: string[];
  savedAt: string;
}

const key = (userId: number, reviewingId: number | null | undefined) => `defense-draft:${userId}:${reviewingId ?? "new"}`;

export function loadDraft(userId: number, reviewingId?: number | null): DefenseDraft | null {
  try {
    const raw = sessionStorage.getItem(key(userId, reviewingId));
    return raw ? (JSON.parse(raw) as DefenseDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(userId: number, reviewingId: number | null | undefined, draft: Omit<DefenseDraft, "savedAt">) {
  try {
    sessionStorage.setItem(key(userId, reviewingId), JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
  } catch {
    // Sem storage (aba privada, bloqueio): segue sem rascunho.
  }
}

export function clearDraft(userId: number, reviewingId?: number | null) {
  try {
    sessionStorage.removeItem(key(userId, reviewingId));
  } catch {
    // idem
  }
}

export const draftTime = (draft: DefenseDraft) =>
  new Date(draft.savedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
