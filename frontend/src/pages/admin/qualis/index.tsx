'use client';

import { Input } from "@/components/ui/input";
import { QualisAccordion } from "@/features/qualis/components/QualisAccordion";
import { QualisDeleteDialog } from "@/features/qualis/components/QualisDeleteDialog";
import { QualisDialog } from "@/features/qualis/components/QualisDialogs";
import { QualisHeader } from "@/features/qualis/components/QualisHeader";
import { QualisFormData, useQualis } from "@/features/qualis/hooks/useQualis";
import { StratumQualis } from "@/types/academic";
import { Search } from "lucide-react";
import { useState } from "react";

export default function QualisPage() {
  const {
    qualis,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useQualis();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StratumQualis | null>(null);
  const [deletingItem, setDeletingItem] = useState<StratumQualis | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: StratumQualis) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: QualisFormData) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditingItem(null);
  };

  const handleDelete = (item: StratumQualis) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingItem) {
      await deleteMutation.mutateAsync(deletingItem.id);
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar os dados do Qualis!</div>;

  return (
    <div className="flex flex-col gap-4">
      <QualisHeader onAddClick={handleAdd} />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar qualis..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <QualisAccordion
        qualis={qualis}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <QualisDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={handleSubmit}
      />

      <QualisDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        item={deletingItem}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
