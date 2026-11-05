import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnswersSummary } from "@/features/defense-requests/components/AnswersSummary";
import { DefenseForm, DefenseRequest, STATUS_LABEL } from "@/features/defense-requests/types";

interface DefenseRequestDetailsDialogProps {
  request: DefenseRequest | null;
  forms: DefenseForm[];
  onOpenChange: (open: boolean) => void;
}

/** Mostra as respostas de uma solicitação com os rótulos do formulário do tipo. */
export function DefenseRequestDetailsDialog({ request, forms, onOpenChange }: DefenseRequestDetailsDialogProps) {
  const schema = request ? forms.find((f) => f.type === request.type) : undefined;

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {request?.type_label}
            {request && <Badge variant="outline">{STATUS_LABEL[request.status]}</Badge>}
          </DialogTitle>
          <DialogDescription>
            {schema?.title}
            {request?.submitted_by ? ` · aberta por ${request.submitted_by.name}` : ""}
          </DialogDescription>
        </DialogHeader>
        {schema && request && <AnswersSummary form={schema} answers={request.answers} hideEmptyOptional />}
      </DialogContent>
    </Dialog>
  );
}
