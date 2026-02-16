'use client';

import { Button } from "@/components/ui/button";
import { AreaDialogs } from "@/features/areas/components/AreaDialogs";
import { AreaTable } from "@/features/areas/components/AreaTable";
import { useAreas } from "@/features/areas/hooks/useAreas";
import { Area } from "@/types/academic";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AreasPage() {
  const {
    areas,
    isLoading,
    searchTerm,
    setSearchTerm,
    addAreaMutation,
    updateAreaMutation,
    deleteAreaMutation,
  } = useAreas();

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  const handleAdd = () => {
    setEditingArea(null);
    setIsAddEditOpen(true);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setIsAddEditOpen(true);
  };

  const handleDelete = (area: Area) => {
    setAreaToDelete(area);
    setIsDeleteOpen(true);
  };

  const handleSave = async (name: string) => {
    if (editingArea) {
      await updateAreaMutation.mutateAsync({ id: editingArea.id, name });
    } else {
      await addAreaMutation.mutateAsync({ name });
    }
  };

  const handleConfirmDelete = async () => {
    if (areaToDelete) {
      await deleteAreaMutation.mutateAsync(areaToDelete.id);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Áreas de Pesquisa</h1>
          <p className="text-muted-foreground">Gerencie as áreas acadêmicas do programa.</p>
        </div>

        <Button className="flex gap-2" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Adicionar Área
        </Button>
      </header>

      <AreaTable
        areas={areas}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AreaDialogs
        isAddEditOpen={isAddEditOpen}
        onAddEditOpenChange={setIsAddEditOpen}
        isDeleteOpen={isDeleteOpen}
        onDeleteOpenChange={setIsDeleteOpen}
        editingArea={editingArea}
        areaToDelete={areaToDelete}
        isDeleting={deleteAreaMutation.isPending}
        onSave={handleSave}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
