import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Trash } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Area {
  id: number;
  name: string;
  students: number;
}

// Sample area data
export default function AreasPage() {
  const queryClient = useQueryClient();

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: () => api.fetchAreas(),
  });

  const addAreaMutation = useMutation({
    mutationFn: (area: { name: string; students: number }) => api.createArea(area),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas'] }),
  });

  const editAreaMutation = useMutation({
    mutationFn: (area: { id: number; name: string; students: number }) => api.updateArea(area),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas'] }),
  });

  const deleteAreaMutation = useMutation({
    mutationFn: (id: number) => api.deleteArea(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas'] }),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [isEditAreaOpen, setIsEditAreaOpen] = useState(false);
  const [isDeleteAreaOpen, setIsDeleteAreaOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [newArea, setNewArea] = useState({
    name: '',
    description: '',
    students: 0,
    subareas: 0,
  });

  // Filter areas based on search term
  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Add new area
  const handleAddArea = () => {
    addAreaMutation.mutate({
      name: newArea.name,
      students: newArea.students,
    });
    setNewArea({
      name: '',
      description: '',
      students: 0,
      subareas: 0,
    });
    setIsAddAreaOpen(false);
  };

  // Edit area
  const handleEditArea = () => {
    if (!currentArea) return;
    editAreaMutation.mutate({
      id: currentArea.id,
      name: currentArea.name,
      students: currentArea.students,
    });
    setIsEditAreaOpen(false);
  };

  // Delete area
  const handleDeleteArea = () => {
    if (!currentArea) return;
    deleteAreaMutation.mutate(currentArea.id);
    setIsDeleteAreaOpen(false);
  };

  if (isLoading) {
    return <div>Carregando áreas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Áreas acadêmicas</h1>
          <p className="text-muted-foreground">Gerencie as áreas cadastradas no sistema.</p>
        </div>
        <Dialog open={isAddAreaOpen} onOpenChange={setIsAddAreaOpen}>
          <DialogTrigger asChild>
            <Button data-cy="add-area-button">
              <Plus className="mr-2 h-4 w-4" /> Adicionar área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar nova área</DialogTitle>
              <DialogDescription>Cadastrar uma nova área no sistema</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newArea.name}
                  data-cy="add-area-form-input-name"
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                />
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="students">N. de estudantes</Label>
                  <Input
                    id="students"
                    type="number"
                    data-cy="add-area-form-input-student-number"
                    value={newArea.students}
                    onChange={(e) => setNewArea({ ...newArea, students: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div> */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAreaOpen(false)}>
                Cancelar
              </Button>
              <Button data-cy="add-area-form-submit" onClick={handleAddArea}>Adicionar nova área</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar áreas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              {/* <TableHead>N. de estudantes</TableHead> */}
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium">{area.name}</TableCell>
                {/* <TableCell>{area.students}</TableCell> */}
                <TableCell className="flex gap-2">
                  <Button
                    data-cy={`area-edit-button-${area.name}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    aria-label="Editar"
                    onClick={() => {
                      setCurrentArea(area);
                      setIsEditAreaOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    data-cy={`area-delete-button-${area.name}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 cursor-pointer"
                    aria-label="Apagar"
                    onClick={() => {
                      setCurrentArea(area);
                      setIsDeleteAreaOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Area Dialog */}
      <Dialog open={isEditAreaOpen} onOpenChange={setIsEditAreaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar área</DialogTitle>
            <DialogDescription>Alterar parâmetros da área acadêmica.</DialogDescription>
          </DialogHeader>
          {currentArea && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={currentArea.name}
                  onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
                />
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-students">N. de estudantes</Label>
                  <Input
                    id="edit-students"
                    type="number"
                    value={currentArea.students}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        students: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div> */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAreaOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditArea}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Area Dialog */}
      <Dialog open={isDeleteAreaOpen} onOpenChange={setIsDeleteAreaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Área Acadêmica</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja deletar essa área acadêmica? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {currentArea && (
            <div className="py-4">
              <p>
                Você irá apagar <strong>{currentArea.name}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Essa ação poderá afetar o registro de múltiplos estudantes.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAreaOpen(false)}>
              Cancelar
            </Button>
            <Button data-cy="area-list-dropdown-delete-modal-confirm-button" variant="destructive" onClick={handleDeleteArea}>
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
