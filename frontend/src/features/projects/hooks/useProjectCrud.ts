import { queryClient } from '@/lib/query-client';
import { projectService } from '@/services/modules/project.service';
import { Project } from '@/types/academic';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { projectFormSchema, ProjectFormValues } from '../types';

export function useProjectCrud(selectedProfessorId: string) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const editForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
  });

  const openEdit = (project: Project) => {
    setSelectedProject(project);
    editForm.reset({
      name: project.name,
      home_page: project.home_page || '',
      start_year: project.start_year,
      end_year: project.end_year || undefined,
      status: project.status || '',
      nature: project.nature || '',
      workload: project.workload || undefined,
      value: project.value || undefined,
      funding_source: project.funding_source || '',
      role: project.pivot?.role || '',
    });
    setIsEditOpen(true);
  };

  async function onEditSubmit(values: ProjectFormValues) {
    if (!selectedProject) return;

    try {
      await projectService.updateUserProject(
        Number(selectedProfessorId),
        selectedProject.id,
        values,
      );
      toast.success('Projeto atualizado com sucesso');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: [ 'projects', selectedProfessorId ] });
    } catch {
      toast.error('Erro ao editar projeto.');
    }
  }

  async function deleteProject(projectId: number) {
    try {
      await projectService.deleteUserProject(Number(selectedProfessorId), projectId);
      toast.success('Projeto deletado com sucesso.');
      queryClient.invalidateQueries({ queryKey: [ 'projects', selectedProfessorId ] });
    } catch {
      toast.error('Erro ao deletar projeto.');
    }
  }

  async function fullDelete() {
    try {
      await projectService.clearUserProjects(Number(selectedProfessorId));
      toast.success('Projetos deletados com sucesso.');
      queryClient.invalidateQueries({ queryKey: [ 'projects', selectedProfessorId ] });
    } catch {
      toast.error('Erro ao deletar projetos.');
    }
  }

  return {
    isEditOpen,
    setIsEditOpen,
    selectedProject,
    setSelectedProject,
    openEdit,
    onEditSubmit,
    deleteProject,
    fullDelete,
    editForm,
  };
}