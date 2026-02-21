'use client';

import { AreaDeleteDialog, AreaFormDialog } from "@/features/areas/components/AreaDialogs";
import { AreaHeader } from "@/features/areas/components/AreaHeader";
import { AreaTable } from "@/features/areas/components/AreaTable";
import { useAreas } from "@/features/areas/hooks/useAreas";
import { Area } from "@/types/academic";
import { useState } from "react";

export default function AreasPage() {
  const {
    areas,
    isLoading,
    actions,
  } = useAreas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  // Função para adicionar área
  const handleAdd = () => {
    setEditingArea(null);
    setIsFormOpen(true);
  };

  // Função para editar área
  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setIsFormOpen(true);
  };

  // Função para deletar área
  const handleDelete = (area: Area) => {
    setAreaToDelete(area);
    setIsDeleteOpen(true);
  };

  // Função para salvar área
  const handleSave = async (name: string) => {
    if (editingArea) {
      await actions.update.mutateAsync({ id: editingArea.id, name });
    } else {
      await actions.add.mutateAsync({ name });
    }
  };

  // Função para confirmar exclusão de área
  const handleConfirmDelete = async () => {
    if (areaToDelete) {
      await actions.remove.mutateAsync(areaToDelete.id);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar área */}
      <AreaHeader onAddClick={handleAdd} />

      {/* Tabela de áreas */}
      <AreaTable
        areas={areas}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Dialog para adicionar e editar áreas */}
      <AreaFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingArea={editingArea}
        onSave={handleSave}
      />

      {/* Dialog para deletar áreas */}
      <AreaDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        areaToDelete={areaToDelete}
        isDeleting={actions.remove.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
