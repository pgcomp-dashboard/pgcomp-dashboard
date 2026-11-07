import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DefenseRequestDetailsDialog } from "@/features/defense-requests/components/DefenseRequestDetailsDialog";
import { DefenseRequestsTable } from "@/features/defense-requests/components/DefenseRequestsTable";
import {
  useAllDefenseRequests,
  useArchivedDefenseRequests,
  useDefenseRequestForms,
} from "@/features/defense-requests/hooks/useDefenseRequests";
import { AgendaPdf } from "@/features/defense-requests/pdf/AgendaPdf";
import { downloadPdf, pdfFilename } from "@/features/defense-requests/pdf/render";
import { DefenseRequest } from "@/features/defense-requests/types";
import { FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** A coordenação acompanha todas as solicitações de banca: arquiva, restaura, apaga e exporta a pauta. */
export default function DefenseRequestsAdminPage() {
  const forms = useDefenseRequestForms();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const active = useAllDefenseRequests();
  const archived = useArchivedDefenseRequests("admin", tab === "archived");
  const [viewing, setViewing] = useState<DefenseRequest | null>(null);
  const [exporting, setExporting] = useState(false);
  const list = tab === "active" ? active : archived;

  // Pauta do colegiado: as enviadas à coordenação que não estão arquivadas.
  const agenda = active.requests.filter((r) => r.status === "submitted");
  const exportAgenda = async () => {
    setExporting(true);
    try {
      await downloadPdf(<AgendaPdf requests={agenda} />, pdfFilename("Pauta - solicitações de banca", new Date().toISOString().slice(0, 10)));
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível gerar o PDF da pauta.", { description: "Tente de novo em instantes." });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Solicitações de Banca</h1>
          <p className="text-muted-foreground">Todas as solicitações: as enviadas pelos orientadores e as que ainda aguardam o orientador.</p>
        </div>
        <Button variant="outline" onClick={exportAgenda} disabled={exporting || agenda.length === 0}>
          <FileDown className="h-4 w-4" /> {exporting ? "Gerando PDF…" : `Exportar pauta (${agenda.length})`}
        </Button>
      </header>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")}>
        <TabsList>
          <TabsTrigger value="active">Ativas</TabsTrigger>
          <TabsTrigger value="archived">Arquivadas</TabsTrigger>
        </TabsList>
      </Tabs>
      <DefenseRequestsTable
        requests={list.requests}
        isLoading={list.isLoading}
        onView={setViewing}
        showSubmitter
        emptyMessage={tab === "active" ? "Nenhuma solicitação enviada ainda." : "Nenhuma solicitação arquivada."}
        isError={list.isError}
        onRetry={() => list.refetch()}
      />
      <DefenseRequestDetailsDialog
        request={viewing}
        forms={forms.data ?? []}
        scope="admin"
        onOpenChange={(open) => !open && setViewing(null)}
      />
    </div>
  );
}
