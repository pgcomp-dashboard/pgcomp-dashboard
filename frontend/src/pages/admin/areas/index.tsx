import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/api';
import type { Area } from '@/services/api';

export default function AreasPage() {
  const queryClient = useQueryClient();

  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [isEditAreaOpen, setIsEditAreaOpen] = useState(false);
  const [isDeleteAreaOpen, setIsDeleteAreaOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [newArea, setNewArea] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: () => api.fetchAreas(),
  });

  // Query for students per field
  const { data: studentsPerField = {} } = useQuery({
    queryKey: ['studentsPerField'],
    queryFn: () => api.studentsPerField(),
  });

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArea = async () => {
    if (!newArea.name.trim()) {
      alert('O nome da área é obrigatório.');
      return;
    }

    try {
      await api.createArea(newArea);
      alert('Área adicionada com sucesso.');
      setNewArea({ name: '' });
      setIsAddAreaOpen(false);
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['studentsPerField'] });
    } catch (error) {
      alert('Falha ao adicionar área.');
    }
  };

  const handleEditArea = async () => {
    if (!currentArea || !currentArea.name.trim()) {
      alert('O nome da área é obrigatório.');
      return;
    }

    try {
      await api.updateArea(currentArea);
      alert('Área atualizada com sucesso.');
      setIsEditAreaOpen(false);
      setCurrentArea(null);
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['studentsPerField'] });
    } catch (error) {
      alert('Falha ao atualizar área.');
    }
  };

  const handleDeleteArea = async () => {
    if (!currentArea) return;

    try {
      await api.deleteArea(currentArea.id);
      alert('Área removida com sucesso.');
      setIsDeleteAreaOpen(false);
      setCurrentArea(null);
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['studentsPerField'] });
    } catch (error) {
      alert('Falha ao remover área.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAreaOpen(false)}>
                Cancelar
              </Button>
              <Button data-cy="add-area-form-submit" onClick={handleAddArea}>
                Adicionar nova área
              </Button>
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
              <TableHead>N. de estudantes</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium">{area.name}</TableCell>
                <TableCell>{studentsPerField[area.name] || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentArea(area);
                        setIsEditAreaOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      data-cy={`area-list-delete-${area.name}`}
                      onClick={() => {
                        setCurrentArea(area);
                        setIsDeleteAreaOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAreaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditArea}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Area Dialog */}
      <Dialog open={isDeleteAreaOpen} onOpenChange={setIsDeleteAreaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a área "{currentArea?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAreaOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteArea}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
