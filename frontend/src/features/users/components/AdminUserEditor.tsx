import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Area, Course } from "@/types/academic";
import { AdminUser, AdminUserUpdate } from "@/types/user";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminUserEditorProps {
  user: AdminUser | null;
  areas: Area[];
  courses: Course[];
  isSaving: boolean;
  isApproving: boolean;
  emailServerError?: string;
  saveError?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AdminUserUpdate) => void;
  onApprove: (userId: number, isAdminRequest?: boolean) => void;
}

export function AdminUserEditor({
  user,
  areas,
  courses,
  isSaving,
  isApproving,
  emailServerError,
  saveError,
  onOpenChange,
  onSave,
  onApprove,
}: AdminUserEditorProps) {
  const [draft, setDraft] = useState<AdminUserUpdate>({});
  const [emailError, setEmailError] = useState<string>();

  useEffect(() => {
    if (!user) return;
    setDraft({
      name: user.name,
      type: user.type,
      email: user.email,
      category:
        user.type === "professor" ? (user.category ?? "permanente") : undefined,
      registration: user.registration,
      siape: user.siape,
      course_id: user.course_id,
      area_id: user.area_id,
      lattes_url: user.lattes_url,
      orcid: user.orcid,
      pq: user.pq,
      is_senior: user.is_senior,
      is_admin: user.is_admin,
      defended_at: user.defended_at?.slice(0, 10) ?? null,
      password: "",
    });
    setEmailError(undefined);
  }, [user]);

  const validateEmail = (email: string | null | undefined) => {
    if (!email?.trim()) return undefined;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? undefined
      : "Informe um e-mail válido.";
  };

  const handleSave = () => {
    const invalidEmail = validateEmail(draft.email);
    setEmailError(invalidEmail);
    if (invalidEmail) return;

    const data = { ...draft };
    if (!data.password) delete data.password;
    if (data.type !== "professor") delete data.category;
    onSave(data);
  };

  const visibleEmailError = emailError ?? emailServerError;

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {user && (
          <>
            <DialogHeader>
              <DialogTitle>Editar usuário</DialogTitle>
              <DialogDescription>Atualize os dados da conta.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-user-name">Nome</Label>
                <Input
                  id="admin-user-name"
                  value={draft.name ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-user-email">E-mail</Label>
                <Input
                  id="admin-user-email"
                  type="email"
                  value={draft.email ?? ""}
                  aria-invalid={!!visibleEmailError}
                  aria-describedby={
                    visibleEmailError ? "admin-user-email-error" : undefined
                  }
                  onChange={(event) => {
                    const email = event.target.value || null;
                    setDraft((current) => ({ ...current, email }));
                    setEmailError(validateEmail(email));
                  }}
                />
                {visibleEmailError && (
                  <p
                    id="admin-user-email-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {visibleEmailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tipo de usuário</Label>
                <Select
                  value={draft.type ?? user.type}
                  onValueChange={(value: AdminUser["type"]) =>
                    setDraft((current) => ({
                      ...current,
                      type: value,
                      ...(value === "manager" ? { is_admin: true } : {}),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Discente</SelectItem>
                    <SelectItem value="professor">Docente</SelectItem>
                    <SelectItem value="manager">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {draft.type === "professor" && (
                <div className="space-y-2">
                  <Label htmlFor="admin-user-category">Categoria</Label>
                  <Select
                    value={draft.category ?? "permanente"}
                    onValueChange={(
                      value: NonNullable<AdminUserUpdate["category"]>,
                    ) =>
                      setDraft((current) => ({ ...current, category: value }))
                    }
                  >
                    <SelectTrigger id="admin-user-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanente">Permanente</SelectItem>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                      <SelectItem value="visitante">Visitante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="admin-user-orcid">ORCID</Label>
                <Input
                  id="admin-user-orcid"
                  value={draft.orcid ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      orcid: event.target.value || null,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label htmlFor="admin-user-is-admin">Administrador</Label>
                <Switch
                  id="admin-user-is-admin"
                  checked={draft.is_admin ?? false}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({ ...current, is_admin: checked }))
                  }
                />
              </div>

              {draft.type === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="admin-user-registration">Matrícula</Label>
                    <Input
                      id="admin-user-registration"
                      type="number"
                      value={draft.registration ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          registration: event.target.value
                            ? Number(event.target.value)
                            : null,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-user-course">Curso</Label>
                    <Select
                      value={draft.course_id?.toString() ?? "none"}
                      onValueChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          course_id: value === "none" ? null : Number(value),
                        }))
                      }
                    >
                      <SelectTrigger id="admin-user-course">
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem curso</SelectItem>
                        {courses.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-user-area">Área</Label>
                    <Select
                      value={draft.area_id?.toString() ?? "none"}
                      onValueChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          area_id: value === "none" ? null : Number(value),
                        }))
                      }
                    >
                      <SelectTrigger id="admin-user-area">
                        <SelectValue placeholder="Selecione uma área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem área</SelectItem>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-user-defended-at">
                      Data de defesa
                    </Label>
                    <Input
                      id="admin-user-defended-at"
                      type="date"
                      value={draft.defended_at ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          defended_at: event.target.value || null,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              {draft.type === "professor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="admin-user-siape">SIAPE</Label>
                    <Input
                      id="admin-user-siape"
                      type="number"
                      value={draft.siape ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          siape: event.target.value
                            ? Number(event.target.value)
                            : null,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Label htmlFor="admin-user-pq">Pesquisador PQ</Label>
                    <Switch
                      id="admin-user-pq"
                      checked={draft.pq ?? false}
                      onCheckedChange={(checked) =>
                        setDraft((current) => ({ ...current, pq: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Label htmlFor="admin-user-senior">Sênior</Label>
                    <Switch
                      id="admin-user-senior"
                      checked={draft.is_senior ?? false}
                      onCheckedChange={(checked) =>
                        setDraft((current) => ({
                          ...current,
                          is_senior: checked,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="admin-user-lattes">
                  Link do Currículo Lattes
                </Label>
                <Input
                  id="admin-user-lattes"
                  value={draft.lattes_url ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      lattes_url: event.target.value || null,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="admin-user-password">Nova senha</Label>
                <Input
                  id="admin-user-password"
                  type="password"
                  autoComplete="new-password"
                  value={draft.password ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              {saveError && (
                <p className="text-sm text-destructive sm:mr-auto" role="alert">
                  {saveError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {!user.is_approved &&
                  ((user.type === "professor" && !user.is_approved) ||
                    (user.type === "student" &&
                      !!user.registration_requested_at)) && (
                    <Button
                      variant="outline"
                      onClick={() => onApprove(user.id)}
                      disabled={isApproving || isSaving}
                    >
                      {isApproving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Aprovar {user.type === "student" ? "discente" : "docente"}
                    </Button>
                  )}
                {user.admin_status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => onApprove(user.id, true)}
                    disabled={isApproving || isSaving}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Aprovar como admin
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving || isApproving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving || isApproving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar alterações
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
