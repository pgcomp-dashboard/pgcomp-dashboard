'use client';

import { Button } from "@/components/ui/button";
import { PublisherDeleteDialog } from "@/features/publishers/components/PublisherDeleteDialog";
import { PublisherDialogs } from "@/features/publishers/components/PublisherDialogs";
import { PublisherFilters } from "@/features/publishers/components/PublisherFilters";
import { PublisherImport } from "@/features/publishers/components/PublisherImport";
import { PublisherTable } from "@/features/publishers/components/PublisherTable";
import { usePublishers } from "@/features/publishers/hooks/usePublishers";
import { Publisher } from "@/types/academic";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";

export default function PublishersPage() {
  const {
    publishers,
    pagination,
    isLoading,
    isFetching,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    qualisFilter,
    setQualisFilter,
    sorting,
    setSorting,
    qualisOptions,
    createMutation,
    updateMutation,
    deleteMutation,
    importMutation,
  } = usePublishers();

  const [isPublisherDialogOpen, setIsPublisherDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null);

  const handleAdd = () => {
    setEditingPublisher(null);
    setIsPublisherDialogOpen(true);
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setIsPublisherDialogOpen(true);
  };

  const handleDelete = (publisher: Publisher) => {
    setPublisherToDelete(publisher);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (values: any) => {
    if (editingPublisher) {
      await updateMutation.mutateAsync({ id: editingPublisher.id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleConfirmDelete = async () => {
    if (publisherToDelete) {
      await deleteMutation.mutateAsync(publisherToDelete.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleImport = async (formData: FormData, type: 'journal' | 'conference') => {
    await importMutation.mutateAsync({ formData, type });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Periódicos e Conferências</h1>
          <p className="text-muted-foreground">Gerencie os veículos de publicação cadastrados.</p>
        </div>

        <div className="flex gap-2">
          <Button className="flex gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Adicionar Veículo
          </Button>
          <Button className="flex gap-2" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Importar
          </Button>
        </div>
      </header>

      <div className="rounded-md border">
        <PublisherFilters
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          qualisFilter={qualisFilter}
          setQualisFilter={setQualisFilter}
          perPage={perPage}
          setPerPage={setPerPage}
          qualisOptions={qualisOptions}
        />

        <PublisherTable
          publishers={publishers}
          pagination={pagination}
          isLoading={isLoading}
          isFetching={isFetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={setPage}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </div>

      <PublisherDialogs
        isOpen={isPublisherDialogOpen}
        onOpenChange={setIsPublisherDialogOpen}
        editingPublisher={editingPublisher}
        qualisOptions={qualisOptions}
        onSave={handleSave}
      />

      <PublisherImport
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImport}
      />

      <PublisherDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        publisher={publisherToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
