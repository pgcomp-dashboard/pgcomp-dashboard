import { z } from 'zod';

export type FormType = 'none' | 'xml' | 'doi' | 'other';

export interface RequestBodyType {
  title: string;
  year: number;
  publisher_type: string | null;
  publisher_id: number | null;
  stratum_qualis_id: number | null;
  doi: string | null;
}

export interface CreateRequestBodyType {
  title: string;
  year: number;
  publisher_type: string | null;
  publisher_id: number | null;
  doi: string | null;
}

export const updateProductionFormSchema = z.object({
  title: z.string().min(1, 'Campo obrigatório'),
  year: z.coerce.number().min(1900, 'Ano inválido'),
  doi: z.string().optional(),
});

export const createProductionFormSchema = z.object({
  title: z.string().min(1, 'Campo obrigatório'),
  year: z.coerce.number().min(1900, 'Ano inválido'),
  doi: z.string().optional(),
});
