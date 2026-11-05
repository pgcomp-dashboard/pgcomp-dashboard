import { Button } from "@/components/ui/button";
import { DefenseRequestDetailsDialog } from "@/features/defense-requests/components/DefenseRequestDetailsDialog";
import { DefensePersona, DefenseRequestWizard } from "@/features/defense-requests/components/DefenseRequestWizard";
import { DefenseRequestsTable } from "@/features/defense-requests/components/DefenseRequestsTable";
import {
  useDefenseRequestForms,
  useMyDefenseRequests,
  useStudentLookup,
} from "@/features/defense-requests/hooks/useDefenseRequests";
import { DefenseRequest } from "@/features/defense-requests/types";
import useAuth from "@/hooks/auth";
import { ClipboardCheck, Plus } from "lucide-react";
import { useState } from "react";

/**
 * POC: solicitação de banca.
 * - Discente: abre para si; vai para o orientador revisar.
 * - Orientador: revisa o que os orientandos abriram, ou abre direto para um deles.
 */
export default function DefenseRequestsPage() {
  const auth = useAuth();
  const persona: DefensePersona = auth?.user?.type === "student" ? "student" : "advisor";
  const me = { id: auth?.user?.id ?? 0, name: auth?.user?.name ?? "" };

  const forms = useDefenseRequestForms();
  const { requests, isLoading, create, review } = useMyDefenseRequests();
  // O discente recebe só a si mesmo, com curso e orientador do cadastro.
  const self = useStudentLookup("", persona === "student");

  const [wizard, setWizard] = useState<{ reviewing: DefenseRequest | null } | null>(null);
  const [viewing, setViewing] = useState<DefenseRequest | null>(null);

  const pending = requests.filter((r) => r.can_review);
  const ready = !!forms.data && (persona === "advisor" || !!self.data);

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
                <Button size="sm" onClick={() => setWizard({ reviewing: r })}>
                  Revisar e enviar
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border p-4 sm:p-6">
        {wizard && forms.data ? (
          <DefenseRequestWizard
            key={wizard.reviewing?.id ?? "new"}
            forms={forms.data}
            persona={persona}
            me={me}
            self={self.data?.[0] ?? null}
            reviewing={wizard.reviewing}
            isSubmitting={create.isPending || review.isPending}
            onCancel={() => setWizard(null)}
            onSubmit={async (input) => {
              if (wizard.reviewing) await review.mutateAsync({ id: wizard.reviewing.id, ...input });
              else await create.mutateAsync(input);
              setWizard(null);
            }}
          />
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Nova solicitação</h2>
              <p className="text-sm text-muted-foreground">
                Cinco etapas curtas. Discente, orientação, nível e membros do PGCOMP já vêm do cadastro.
              </p>
            </div>
            <Button onClick={() => setWizard({ reviewing: null })} disabled={!ready}>
              <Plus className="h-4 w-4" /> Nova solicitação de banca
            </Button>
          </div>
        )}
        {forms.isError && <p className="mt-2 text-sm text-destructive">Não foi possível carregar os formulários.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{persona === "student" ? "Minhas solicitações" : "Solicitações minhas e dos meus orientandos"}</h2>
        <DefenseRequestsTable
          requests={requests}
          isLoading={isLoading}
          onView={setViewing}
          emptyMessage="Nenhuma solicitação ainda."
        />
      </section>

      <DefenseRequestDetailsDialog request={viewing} forms={forms.data ?? []} onOpenChange={(open) => !open && setViewing(null)} />
    </div>
  );
}
