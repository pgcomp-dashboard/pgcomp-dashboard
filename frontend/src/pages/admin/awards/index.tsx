import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AwardFormDialog } from "@/features/awards/components/AwardFormDialog";
import { AwardsDashboard } from "@/features/awards/components/AwardsDashboard";
import { AwardsTable } from "@/features/awards/components/AwardsTable";
import { CategoriesTable } from "@/features/awards/components/CategoriesTable";
import { CategoryFormDialog } from "@/features/awards/components/CategoryFormDialog";
import { DeleteConfirmDialog } from "@/features/awards/components/DeleteConfirmDialog";
import { useAwards } from "@/features/awards/hooks/useAwards";
import { Award, AwardCategory, winnerNames } from "@/features/awards/types";
import { awardService } from "@/services/modules/award.service";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AwardsPage() {
  const { awards, categories, isLoading, awardActions, categoryActions } =
    useAwards();

  const [tab, setTab] = useState("dashboard");
  const [awardForm, setAwardForm] = useState<{ open: boolean; editing: Award | null }>({ open: false, editing: null });
  const [categoryForm, setCategoryForm] = useState<{ open: boolean; editing: AwardCategory | null }>({ open: false, editing: null });
  const [awardToDelete, setAwardToDelete] = useState<Award | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AwardCategory | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestão de Prêmios</h1>
          <p className="text-muted-foreground">
            Acompanhe os prêmios cadastrados por docentes e discentes e gerencie as categorias.
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
          <TabsTrigger value="awards">Todos os prêmios</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="pt-4">
          <AwardsDashboard />
        </TabsContent>
        <TabsContent value="awards" className="pt-4">
          <AwardsTable
            awards={awards}
            categories={categories}
            isLoading={isLoading}
            showSubmitter
            emptyMessage="Nenhum prêmio cadastrado ainda."
            onEdit={(award) => setAwardForm({ open: true, editing: award })}
            onDelete={setAwardToDelete}
            onDownload={awardService.downloadAttachment}
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

      <AwardFormDialog
        open={awardForm.open}
        onOpenChange={(open) => setAwardForm((s) => ({ ...s, open }))}
        editing={awardForm.editing}
        categories={categories}
        onSave={async (input) => {
          if (awardForm.editing) {
            await awardActions.update.mutateAsync({ id: awardForm.editing.id, ...input });
          }
        }}
      />
      <CategoryFormDialog
        open={categoryForm.open}
        onOpenChange={(open) => setCategoryForm((s) => ({ ...s, open }))}
        editing={categoryForm.editing}
        onSave={async (name) => {
          if (categoryForm.editing) {
            await categoryActions.update.mutateAsync({ id: categoryForm.editing.id, name });
          } else {
            await categoryActions.add.mutateAsync({ name });
          }
        }}
      />
      <DeleteConfirmDialog
        open={!!awardToDelete}
        onOpenChange={(open) => !open && setAwardToDelete(null)}
        title="Excluir Prêmio"
        itemLabel={awardToDelete ? winnerNames(awardToDelete) : undefined}
        isDeleting={awardActions.remove.isPending}
        onConfirm={async () => {
          if (awardToDelete) {
            await awardActions.remove.mutateAsync(awardToDelete.id).catch(() => undefined);
          }
          setAwardToDelete(null);
        }}
      />
      <DeleteConfirmDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Excluir Categoria"
        itemLabel={categoryToDelete?.name}
        isDeleting={categoryActions.remove.isPending}
        onConfirm={async () => {
          if (categoryToDelete) {
            await categoryActions.remove.mutateAsync(categoryToDelete.id).catch(() => undefined);
          }
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
