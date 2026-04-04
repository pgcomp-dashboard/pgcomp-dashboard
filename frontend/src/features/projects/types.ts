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

export type ProjectFormValues = z.infer<typeof projectFormSchema>;