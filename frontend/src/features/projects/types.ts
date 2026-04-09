import { z } from 'zod';

export type FormType = 'none' | 'xml' | 'manual';

export const projectFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  home_page: z.string().optional(),
  start_year: z.coerce.number().min(1900, 'Ano inválido'),
  end_year: z.coerce.number().min(1900, 'Ano inválido').optional(),
  status: z.string().optional(),
  nature: z.string().optional(),
  workload: z.coerce.number().optional(),
  value: z.coerce.number().optional(),
  funding_source: z.string().optional(),
  role: z.string().optional(),
}); 
// Dashboard de Projetos
export interface ProjectDashboardSummary {
  total: number;
  total_nacional: number;
  total_internacional: number;
  total_abertos: number;
  total_concluidos: number;
  total_valor: number;
}

export interface ProjectDashboardRow {
  id: number;
  name: string;
  nature: string | null;
  status: string | null;
  start_year: number | null;
  end_year: number | null;
  value: number | null;
  funding_source: string | null;
  participants: { id: number; name: string }[];
}

export interface ProjectDashboardProfessor {
  id: number;
  name: string;
}

export interface ProjectDashboardFilters {
  professorId: number | null;
  year: number | null;
  status: string | null;
}

export type ProjectFormValues = z.infer<typeof projectFormSchema>;