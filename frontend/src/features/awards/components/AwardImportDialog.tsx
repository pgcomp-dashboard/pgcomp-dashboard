import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ImportAwardInput } from "@/features/awards/types";
import { parseApiError } from "@/services/http-client";
import { useEffect, useState } from "react";
import { z } from "zod";

const importSchema = z
  .array(
    z.object({
      year: z.number().int().min(1900).max(new Date().getFullYear()),
      scope: z.enum(["national", "international"]),
      award_category_name: z.string().min(1),
      description: z.string().min(10).max(5000),
      url: z.string().url().max(2048).nullable(),
      winners: z
        .array(
          z.object({
            name: z.string().min(2).max(255),
            recipient_type: z.enum(["professor", "student", "staff"]),
          }),
        )
        .min(1)
        .max(20),
    }),
  )
  .min(1)
  .max(500);

const exampleJson = `[
  {
    "year": 2014,
    "scope": "international",
    "award_category_name": "Best paper",
    "description": "Melhor artigo no ECRTS 2014",
    "url": null,
    "winners": [
      {
        "name": "George Marconi de Araújo Lima",
        "recipient_type": "professor"
      }
    ]
  }
]`;

interface AwardImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isImporting: boolean;
  onImport: (awards: ImportAwardInput[]) => Promise<unknown>;
}

export function AwardImportDialog({
  open,
  onOpenChange,
  isImporting,
  onImport,
}: AwardImportDialogProps) {
  const [json, setJson] = useState(exampleJson);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  const handleImport = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("O conteúdo não é um JSON válido.");
      return;
    }

    const result = importSchema.safeParse(parsed);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Confira os dados do JSON.");
      return;
    }

    setError(null);
    try {
      await onImport(result.data);
      onOpenChange(false);
    } catch (importError) {
      setError(parseApiError(importError));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar prêmios</DialogTitle>
          <DialogDescription>
            Cole um array JSON com até 500 prêmios. A categoria deve existir
            previamente e seu nome precisa ser exatamente igual ao cadastrado.
            Cada prêmio precisa ter pelo menos um vencedor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>
              Campos: <code>year</code>, <code>scope</code> (
              <code>national</code> ou <code>international</code>),{" "}
              <code>award_category_name</code>, <code>description</code>,{" "}
              <code>url</code> (ou <code>null</code>) e <code>winners</code>.
              Cada vencedor informa <code>name</code> e <code>recipient_type</code>{" "}
              (<code>professor</code>, <code>student</code> ou <code>staff</code>).
            </p>
            <p className="mt-2">
              A conta é associada pelo nome e pelo tipo. Nomes sem correspondência
              única são importados sem vínculo e serão listados no resultado.
            </p>
          </div>
          <Textarea
            value={json}
            onChange={(event) => setJson(event.target.value)}
            aria-label="JSON dos prêmios para importar"
            className="min-h-72 font-mono text-xs"
            disabled={isImporting}
            spellCheck={false}
          />
          {error && (
            <p className="whitespace-pre-wrap text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isImporting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isImporting}
            onClick={handleImport}
          >
            {isImporting ? "Importando..." : "Importar prêmios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
