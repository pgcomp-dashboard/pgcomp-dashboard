import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionFormDialog } from "@/features/internationalization/components/ActionFormDialog";
import { ActionsTable } from "@/features/internationalization/components/ActionsTable";
import { CategoriesTable } from "@/features/internationalization/components/CategoriesTable";
import { CategoryFormDialog } from "@/features/internationalization/components/CategoryFormDialog";
import { InternationalizationDashboard } from "@/features/internationalization/components/InternationalizationDashboard";
import { useInternationalization } from "@/features/internationalization/hooks/useInternationalization";
import {
  InternationalizationAction,
  InternationalizationCategory,
} from "@/features/internationalization/types";
import { internationalizationService } from "@/services/modules/internationalization.service";
import { Plus } from "lucide-react";
import { useState } from "react";

/** Coordenação: dashboard, todas as ações cadastradas e CRUD de categorias. */
export default function InternationalizationAdminPage() {
  const { actions, categories, isLoading, actionMutations, categoryMutations } =
    useInternationalization();

  const [tab, setTab] = useState("dashboard");
  const [actionForm, setActionForm] = useState<{ open: boolean; editing: InternationalizationAction | null }>({ open: false, editing: null });
  const [categoryForm, setCategoryForm] = useState<{ open: boolean; editing: InternationalizationCategory | null }>({ open: false, editing: null });
  const [actionToDelete, setActionToDelete] = useState<InternationalizationAction | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<InternationalizationCategory | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestão de Internacionalização</h1>
          <p className="text-muted-foreground">
            Acompanhe as ações cadastradas por docentes e discentes e gerencie as categorias.
          </p>
        </div>
        {tab === "categories" && (
          <Button className="flex gap-2" onClick={() => setCategoryForm({ open: true, editing: null })}>
            <Plus className="h-4 w-4" />
            Adicionar Categoria
          </Button>
        )}
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="actions">Todas as ações</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="pt-4">
          <InternationalizationDashboard />
        </TabsContent>
        <TabsContent value="actions" className="pt-4">
          <ActionsTable
            actions={actions}
            categories={categories}
            isLoading={isLoading}
            showSubmitter
            emptyMessage="Nenhuma ação cadastrada ainda."
            onEdit={(action) => setActionForm({ open: true, editing: action })}
            onDelete={setActionToDelete}
            onDownload={internationalizationService.downloadFile}
          />
        </TabsContent>
        <TabsContent value="categories" className="pt-4">
          <CategoriesTable
            categories={categories}
            isLoading={isLoading}
            onEdit={(category) => setCategoryForm({ open: true, editing: category })}
            onDelete={setCategoryToDelete}
          />
        </TabsContent>
      </Tabs>

      <ActionFormDialog
        open={actionForm.open}
        onOpenChange={(open) => setActionForm((s) => ({ ...s, open }))}
        editing={actionForm.editing}
        categories={categories}
        onSave={async (input) => {
          if (actionForm.editing) {
            await actionMutations.update.mutateAsync({ id: actionForm.editing.id, ...input });
          }
        }}
      />
      <CategoryFormDialog
        open={categoryForm.open}
        onOpenChange={(open) => setCategoryForm((s) => ({ ...s, open }))}
        editing={categoryForm.editing}
        onSave={async (name) => {
          if (categoryForm.editing) {
            await categoryMutations.update.mutateAsync({ id: categoryForm.editing.id, name });
          } else {
            await categoryMutations.add.mutateAsync({ name });
          }
        }}
      />
      <DeleteConfirmDialog
        open={!!actionToDelete}
        onOpenChange={(open) => !open && setActionToDelete(null)}
        title="Excluir Ação"
        itemLabel={actionToDelete ? `${actionToDelete.full_name} (${actionToDelete.category_name ?? "ação"})` : undefined}
        isDeleting={actionMutations.remove.isPending}
        onConfirm={async () => {
          if (actionToDelete) {
            await actionMutations.remove.mutateAsync(actionToDelete.id).catch(() => undefined);
          }
          setActionToDelete(null);
        }}
      />
      <DeleteConfirmDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Excluir Categoria"
        itemLabel={categoryToDelete?.name}
        isDeleting={categoryMutations.remove.isPending}
        onConfirm={async () => {
          if (categoryToDelete) {
            await categoryMutations.remove.mutateAsync(categoryToDelete.id).catch(() => undefined);
          }
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
