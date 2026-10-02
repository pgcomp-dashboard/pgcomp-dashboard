import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { ActionFormDialog } from "@/features/internationalization/components/ActionFormDialog";
import { ActionsTable } from "@/features/internationalization/components/ActionsTable";
import { useMyInternationalization } from "@/features/internationalization/hooks/useInternationalization";
import { InternationalizationAction } from "@/features/internationalization/types";
import { myInternationalizationService } from "@/services/modules/internationalization.service";
import { Plus } from "lucide-react";
import { useState } from "react";

/** Área do usuário: cadastro e acompanhamento das próprias ações de internacionalização. */
export default function MyInternationalizationPage() {
  const { actions, categories, isLoading, mutations } = useMyInternationalization();

  const [form, setForm] = useState<{ open: boolean; editing: InternationalizationAction | null }>({ open: false, editing: null });
  const [toDelete, setToDelete] = useState<InternationalizationAction | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Internacionalização</h1>
          <p className="text-muted-foreground">
            Registre as suas ações de internacionalização (intercâmbios, doutorado sanduíche, palestras no exterior e outras).
            Elas são usadas nos relatórios do programa.
          </p>
        </div>
        <Button className="flex gap-2" onClick={() => setForm({ open: true, editing: null })}>
          <Plus className="h-4 w-4" />
          Cadastrar Ação
        </Button>
      </header>

      <ActionsTable
        actions={actions}
        categories={categories}
        isLoading={isLoading}
        emptyMessage="Você ainda não cadastrou nenhuma ação."
        onEdit={(action) => setForm({ open: true, editing: action })}
        onDelete={setToDelete}
        onDownload={myInternationalizationService.downloadFile}
      />

      <ActionFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((s) => ({ ...s, open }))}
        editing={form.editing}
        categories={categories}
        onSave={async (input) => {
          if (form.editing) {
            await mutations.update.mutateAsync({ id: form.editing.id, ...input });
          } else {
            await mutations.add.mutateAsync(input);
          }
        }}
      />
      <DeleteConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir Ação"
        itemLabel={toDelete ? `${toDelete.full_name} (${toDelete.category_name ?? "ação"})` : undefined}
        isDeleting={mutations.remove.isPending}
        onConfirm={async () => {
          if (toDelete) {
            await mutations.remove.mutateAsync(toDelete.id).catch(() => undefined);
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}
