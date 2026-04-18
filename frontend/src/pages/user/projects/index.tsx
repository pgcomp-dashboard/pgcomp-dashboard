import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { ProjectCreateForm } from '@/features/projects/components/ProjectCreateForm';
import { ProjectDialogs } from '@/features/projects/components/ProjectDialogs';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';
import { ProjectTable } from '@/features/projects/components/ProjectTable';
import UploadProjectXMLForm from '@/features/projects/components/UploadXMLForm';
import { useProjectCrud } from '@/features/projects/hooks/useProjectCrud';
import { useProjectData } from '@/features/projects/hooks/useProjectData';
import { FormType } from '@/features/projects/types';

export default function ProjectsPage() {
  const [chosenForm, setChosenForm] = useState<FormType>('none');

  const {
    auth,
    isLoading,
    isPending,
    projects,
    professorsList,
    selectedProfessorId,
    handleProfessorChange,
  } = useProjectData();

  const crud = useProjectCrud(selectedProfessorId);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-8">
      <ProjectHeader
        isAdmin={auth?.isAdmin}
        isLoading={isLoading}
        isPending={isPending}
        selectedProfessorId={selectedProfessorId}
        onProfessorChange={handleProfessorChange}
        professorsList={professorsList}
      />

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-6">
          {chosenForm !== 'none' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChosenForm('none')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-xl font-semibold">
            {chosenForm === 'xml'
              ? 'Importar XML'
              : chosenForm === 'manual'
                ? 'Adicionar Manualmente'
                : null}
          </h2>
        </div>

        {chosenForm === 'none' ? (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              {auth?.isAdmin && selectedProfessorId !== 'own' && (
                <Button variant="outline" onClick={() => setChosenForm('xml')}>
                  Importar XML
                </Button>
              )}
              <Button onClick={() => setChosenForm('manual')}>
                + Adicionar
              </Button>
            </div>
            <ProjectTable
              isLoading={isLoading}
              projects={projects}
              sortConfig={{ key: 'start_year', direction: 'desc' }}
              onSort={() => { }}
              onEdit={crud.openEdit}
              onDelete={crud.setSelectedProject}
              confirmDelete={crud.deleteProject}
              selectedProject={crud.selectedProject}
              setProjectToDelete={crud.setSelectedProject}
            />
          </div>
        ) : chosenForm === 'xml' ? (
          <UploadProjectXMLForm
            professorId={selectedProfessorId === 'own' ? undefined : selectedProfessorId}
            portalMode={selectedProfessorId === 'own'}
            onSuccess={() => setChosenForm('none')}
          />
        ) : (
          <ProjectCreateForm
            professorId={selectedProfessorId === 'own' ? undefined : selectedProfessorId}
            onSuccess={() => setChosenForm('none')}
          />
        )}
      </div>

      <ProjectDialogs
        isEditOpen={crud.isEditOpen}
        setIsEditOpen={crud.setIsEditOpen}
        onEditSubmit={crud.onEditSubmit}
        editForm={crud.editForm}
        onClearAll={crud.fullDelete}
      />
    </div>
  );
}