import { Button } from "@/components/ui/button";
import { ErrorNotice } from "@/features/defense-requests/components/ErrorNotice";
import { DefenseRequestDetailsDialog } from "@/features/defense-requests/components/DefenseRequestDetailsDialog";
import { DefensePersona, DefenseRequestWizard } from "@/features/defense-requests/components/DefenseRequestWizard";
import { DefenseRequestsTable } from "@/features/defense-requests/components/DefenseRequestsTable";
import {
  useDefenseRequestForms,
  useMyDefenseRequests,
  useStudentLookup,
} from "@/features/defense-requests/hooks/useDefenseRequests";
import { clearDraft, draftTime, loadDraft } from "@/features/defense-requests/draft";
import { DefenseRequest, defenseRole } from "@/features/defense-requests/types";
import useAuth from "@/hooks/auth";
import { ClipboardCheck, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

/**
 * POC: solicitação de banca.
 * - Discente: abre para si; vai para o orientador revisar.
 * - Orientador: revisa o que os orientandos abriram, ou abre direto para um deles.
 */
export default function DefenseRequestsPage() {
  const auth = useAuth();
  // A coordenação só acompanha (pelo /admin); quem abre é o discente ou o orientador.
  const role = defenseRole(auth?.user?.type);
  const isCoordination = role === "coordination";
  const persona: DefensePersona = role === "student" ? "student" : "advisor";
  const me = { id: auth?.user?.id ?? 0, name: auth?.user?.name ?? "" };

  const forms = useDefenseRequestForms();
  const { requests, isLoading, isError, refetch, create, review, refresh } = useMyDefenseRequests();
  // O discente recebe só a si mesmo, com curso e orientador do cadastro.
  const self = useStudentLookup("", persona === "student");

  // nonce: "Descartar e recomeçar" remonta o wizard limpo.
  const [wizard, setWizard] = useState<{ reviewing: DefenseRequest | null; nonce: number } | null>(null);
  const [viewing, setViewing] = useState<DefenseRequest | null>(null);
  const [, setDraftTick] = useState(0);
  const openWizard = (reviewing: DefenseRequest | null) => setWizard({ reviewing, nonce: 0 });

  const pending = requests.filter((r) => r.can_review);
  const selfMissing = persona === "student" && self.isSuccess && (self.data?.length ?? 0) === 0;
  const ready = !!forms.data && (persona === "advisor" || !!self.data?.length);
  // Abertura que ficou pela metade (ex.: a sessão expirou): oferece continuar.
  const newDraft = !wizard && !isCoordination && me.id ? loadDraft(me.id, null) : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Solicitação de Banca</h1>
        <p className="text-muted-foreground">
          {persona === "student"
            ? "Abra a solicitação da sua qualificação ou defesa. Seu orientador revisa, confirma e envia à coordenação."
            : "Revise as solicitações dos seus orientandos ou abra uma nova. Depois de enviada, a coordenação leva à reunião colegiada."}
        </p>
      </header>

      {persona === "advisor" && pending.length > 0 && !wizard && (
        <section className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4" aria-label="Aguardando sua revisão">
          <h2 className="flex items-center gap-2 font-semibold">
            <ClipboardCheck className="h-5 w-5 text-amber-600" /> Aguardando sua revisão ({pending.length})
          </h2>
          <ul className="divide-y">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <div className="text-sm">
                  <p className="font-medium">
                    {r.type_label} · {r.answers.student_name as string}
                  </p>
                  <p className="text-muted-foreground">{(r.answers.title as string) || "Sem título"}</p>
                </div>
                <Button size="sm" onClick={() => openWizard(r)}>
                  Revisar e enviar
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isCoordination ? (
        <section className="rounded-lg border p-4 text-sm sm:p-6">
          A coordenação acompanha todas as solicitações em{" "}
          <Link to="/admin/defense-requests" className="font-medium text-primary hover:underline">
            Solicitações de Banca
          </Link>
          . Quem abre é o discente ou o orientador.
        </section>
      ) : (
        <section className="rounded-lg border p-4 sm:p-6">
          {wizard && forms.data ? (
            <DefenseRequestWizard
              key={`${wizard.reviewing?.id ?? "new"}:${wizard.nonce}`}
              forms={forms.data}
              persona={persona}
              me={me}
              self={self.data?.[0] ?? null}
              reviewing={wizard.reviewing}
              isSubmitting={create.isPending || review.isPending}
              onCancel={() => setWizard(null)}
              existing={requests}
              onViewExisting={(r) => {
                setWizard(null);
                setViewing(r);
              }}
              onStale={(message) => {
                setWizard(null);
                refresh();
                toast.error(message, { description: "A lista foi atualizada com a situação atual." });
              }}
              onDiscardDraft={() => {
                clearDraft(me.id, wizard.reviewing?.id);
                setWizard({ ...wizard, nonce: wizard.nonce + 1 });
              }}
              onSubmit={async (input) => {
                if (wizard.reviewing) await review.mutateAsync({ id: wizard.reviewing.id, ...input });
                else await create.mutateAsync(input);
                setWizard(null);
              }}
            />
          ) : newDraft ? (
            <ErrorNotice
              tone="warning"
              title={`Você tem uma solicitação não enviada (salva às ${draftTime(newDraft)}).`}
              actions={
                <>
                  <Button size="sm" onClick={() => openWizard(null)} disabled={!ready}>
                    Continuar preenchendo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      clearDraft(me.id, null);
                      setDraftTick((t) => t + 1);
                    }}
                  >
                    Descartar
                  </Button>
                </>
              }
            />
          ) : (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Nova solicitação</h2>
                <p className="text-sm text-muted-foreground">
                  Cinco etapas curtas. Discente, orientação, nível e membros do PGCOMP já vêm do cadastro.
                </p>
              </div>
              <Button onClick={() => openWizard(null)} disabled={!ready}>
                <Plus className="h-4 w-4" /> Nova solicitação de banca
              </Button>
            </div>
          )}
          {(forms.isError || (persona === "student" && self.isError)) && (
            <ErrorNotice
              className="mt-4"
              title={forms.isError ? "Não foi possível carregar os formulários." : "Não foi possível carregar o seu cadastro."}
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (forms.isError) forms.refetch();
                    if (self.isError) self.refetch();
                  }}
                >
                  Tentar de novo
                </Button>
              }
            >
              <p className="text-muted-foreground">Sem isso não dá para abrir a solicitação. Verifique sua conexão.</p>
            </ErrorNotice>
          )}
          {selfMissing && (
            <ErrorNotice className="mt-4" title="Seu cadastro de discente não foi encontrado.">
              <p className="text-muted-foreground">Peça à secretaria do PGCOMP para conferir o seu cadastro (curso e orientador) antes de abrir a solicitação.</p>
            </ErrorNotice>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{persona === "student" ? "Minhas solicitações" : "Solicitações minhas e dos meus orientandos"}</h2>
        <DefenseRequestsTable
          requests={requests}
          isLoading={isLoading}
          onView={setViewing}
          emptyMessage="Nenhuma solicitação ainda."
          isError={isError}
          onRetry={() => refetch()}
        />
      </section>

      <DefenseRequestDetailsDialog request={viewing} forms={forms.data ?? []} onOpenChange={(open) => !open && setViewing(null)} />
    </div>
  );
}
