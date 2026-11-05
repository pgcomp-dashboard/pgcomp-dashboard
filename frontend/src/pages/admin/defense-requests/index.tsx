import { DefenseRequestDetailsDialog } from "@/features/defense-requests/components/DefenseRequestDetailsDialog";
import { DefenseRequestsTable } from "@/features/defense-requests/components/DefenseRequestsTable";
import { useAllDefenseRequests, useDefenseRequestForms } from "@/features/defense-requests/hooks/useDefenseRequests";
import { DefenseRequest } from "@/features/defense-requests/types";
import { useState } from "react";

/** POC: a coordenação vê todas as solicitações de banca (somente leitura). */
export default function DefenseRequestsAdminPage() {
  const forms = useDefenseRequestForms();
  const { requests, isLoading } = useAllDefenseRequests();
  const [viewing, setViewing] = useState<DefenseRequest | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Solicitações de Banca</h1>
        <p className="text-muted-foreground">Todas as solicitações: as enviadas pelos orientadores e as que ainda aguardam o orientador.</p>
      </header>
      <DefenseRequestsTable
        requests={requests}
        isLoading={isLoading}
        onView={setViewing}
        showSubmitter
        emptyMessage="Nenhuma solicitação enviada ainda."
      />
      <DefenseRequestDetailsDialog request={viewing} forms={forms.data ?? []} onOpenChange={(open) => !open && setViewing(null)} />
    </div>
  );
}
