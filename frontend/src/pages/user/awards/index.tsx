import { Button } from "@/components/ui/button";
import { AwardFormDialog } from "@/features/awards/components/AwardFormDialog";
import { AwardsTable } from "@/features/awards/components/AwardsTable";
import { DeleteConfirmDialog } from "@/features/awards/components/DeleteConfirmDialog";
import { useMyAwards } from "@/features/awards/hooks/useAwards";
import { Award, winnerNames } from "@/features/awards/types";
import { myAwardService } from "@/services/modules/award.service";
import { Plus } from "lucide-react";
import { useState } from "react";

/** Área do usuário: cadastro e acompanhamento dos próprios prêmios. */
export default function MyAwardsPage() {
  const { awards, categories, isLoading, actions } = useMyAwards();

  const [form, setForm] = useState<{ open: boolean; editing: Award | null }>({ open: false, editing: null });
  const [awardToDelete, setAwardToDelete] = useState<Award | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Meus Prêmios</h1>
          <p className="text-muted-foreground">
            Registre os prêmios e reconhecimentos que você recebeu. Eles são usados nos relatórios do programa.
          </p>
        </div>
        <Button className="flex gap-2" onClick={() => setForm({ open: true, editing: null })}>
          <Plus className="h-4 w-4" />
          Cadastrar Prêmio
        </Button>
      </header>

      <AwardsTable
        awards={awards}
        categories={categories}
        isLoading={isLoading}
        emptyMessage="Você ainda não cadastrou nenhum prêmio."
        onEdit={(award) => setForm({ open: true, editing: award })}
        onDelete={setAwardToDelete}
        onDownload={myAwardService.downloadAttachment}
      />

      <AwardFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((s) => ({ ...s, open }))}
        editing={form.editing}
        categories={categories}
        onSave={async (input) => {
          if (form.editing) {
            await actions.update.mutateAsync({ id: form.editing.id, ...input });
          } else {
            await actions.add.mutateAsync(input);
          }
        }}
      />
      <DeleteConfirmDialog
        open={!!awardToDelete}
        onOpenChange={(open) => !open && setAwardToDelete(null)}
        title="Excluir Prêmio"
        itemLabel={awardToDelete ? winnerNames(awardToDelete) : undefined}
        isDeleting={actions.remove.isPending}
        onConfirm={async () => {
          if (awardToDelete) {
            await actions.remove.mutateAsync(awardToDelete.id).catch(() => undefined);
          }
          setAwardToDelete(null);
        }}
      />
    </div>
  );
}
