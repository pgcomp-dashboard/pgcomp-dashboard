import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnswersSummary } from "@/features/defense-requests/components/AnswersSummary";
import { useDefenseRequestActions } from "@/features/defense-requests/hooks/useDefenseRequests";
import { DefenseRequestPdf } from "@/features/defense-requests/pdf/DefenseRequestPdf";
import { downloadPdf, pdfFilename } from "@/features/defense-requests/pdf/render";
import { DefenseForm, DefenseRequest, formatDate, STATUS_LABEL } from "@/features/defense-requests/types";
import { DefenseScope } from "@/services/modules/defense-request.service";
import { Archive, ArchiveRestore, FileDown, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DefenseRequestDetailsDialogProps {
  request: DefenseRequest | null;
  forms: DefenseForm[];
  onOpenChange: (open: boolean) => void;
  /** Rotas usadas pelas ações (portal ou admin). */
  scope?: DefenseScope;
}

/** Respostas de uma solicitação, com PDF e as ações que a pessoa pode fazer (can_* da API). */
export function DefenseRequestDetailsDialog({ request, forms, onOpenChange, scope = "portal" }: DefenseRequestDetailsDialogProps) {
  const schema = request ? forms.find((f) => f.type === request.type) : undefined;
  const { archive, restore, destroy } = useDefenseRequestActions(scope);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);
  const busy = archive.isPending || restore.isPending || destroy.isPending;
  const close = () => onOpenChange(false);

  const exportPdf = async () => {
    if (!request || !schema) return;
    setExporting(true);
    try {
      await downloadPdf(<DefenseRequestPdf request={request} form={schema} />, pdfFilename(request.type_label, String(request.answers.student_name ?? "")));
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível gerar o PDF.", { description: "Tente de novo. Se continuar, avise a secretaria do PGCOMP." });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Dialog open={!!request} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {request?.type_label}
              {request && <Badge variant="outline">{STATUS_LABEL[request.status]}</Badge>}
              {request?.archived_at && (
                <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                  Arquivada
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {schema?.title}
              {request?.submitted_by ? ` · aberta por ${request.submitted_by.name}` : ""}
              {request?.archived_at
                ? ` · arquivada em ${formatDate(request.archived_at.slice(0, 10))}${request.archived_by ? ` por ${request.archived_by.name}` : ""}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {schema && request && <AnswersSummary form={schema} answers={request.answers} hideEmptyOptional />}
          {request && (
            <DialogFooter className="flex-wrap gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={exportPdf} disabled={exporting || !schema}>
                <FileDown className="h-4 w-4" /> {exporting ? "Gerando PDF…" : "Baixar PDF"}
              </Button>
              <div className="flex flex-wrap gap-2">
                {request.can_delete && (
                  <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)} disabled={busy}>
                    <Trash2 className="h-4 w-4" /> Apagar de vez
                  </Button>
                )}
                {request.can_restore && (
                  <Button type="button" variant="outline" disabled={busy} onClick={() => restore.mutate(request.id, { onSuccess: close })}>
                    <ArchiveRestore className="h-4 w-4" /> Restaurar
                  </Button>
                )}
                {request.can_archive && (
                  <Button type="button" variant="outline" disabled={busy} onClick={() => archive.mutate(request.id, { onSuccess: close })}>
                    <Archive className="h-4 w-4" /> Arquivar
                  </Button>
                )}
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar esta solicitação de vez?</AlertDialogTitle>
            <AlertDialogDescription>
              Não dá para desfazer. Se quiser só tirar da lista, use Arquivar: a solicitação fica em Arquivadas e pode ser restaurada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => request && destroy.mutate(request.id, { onSuccess: close })}
            >
              Apagar de vez
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
