import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RankingProduction } from "@/types/academic";
import { Loader2 } from "lucide-react";

interface AccreditationDialogsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  productions: RankingProduction[] | null;
}

export function AccreditationDialogs({
  isOpen,
  onOpenChange,
  isLoading,
  productions,
}: AccreditationDialogsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Produções Consideradas</DialogTitle>
          <DialogDescription>
            Visualizar produções consideradas na pontuação. Caso queira mais
            detalhes sobre suas produções vá a aba Minhas Produções.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="animate-spin mr-2" /> Carregando detalhes...
            </div>
          ) : productions && productions.length > 0 ? (
            productions.map((production, index) => (
              <div
                key={index}
                className="rounded border bg-muted/30 p-4 text-sm flex flex-col gap-1 hover:bg-muted/50 transition-colors"
              >
                <p>
                  <strong>Título:</strong> {production.title}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <p>
                    <strong>Ano:</strong> {production.year}
                  </p>
                  <p>
                    <strong>Qualis:</strong>{" "}
                    {production.code || "N/A"}
                  </p>
                  <p>
                    <strong>Pontos:</strong>{" "}
                    {production.score || 0}
                  </p>
                  <p className="capitalize">
                    <strong>Tipo:</strong>{" "}
                    {production.publisher_type || "N/A"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-10 text-muted-foreground italic">
              Nenhuma produção encontrada para este período.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
