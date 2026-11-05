import { z } from 'zod';

export const userConfigFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  secondary_email: z.string().optional().nullable(),
  registration: z.string().optional().nullable(),
  siape: z.coerce.number().optional().nullable(),
  lattes_url: z.string().optional().nullable(),
  pq: z.boolean().optional(),
  orcid: z.string().optional().nullable(),
});

export const studentUserConfigFormSchema = userConfigFormSchema.extend({
  email: z
    .string()
    .email('Email principal inválido')
    .regex(/^[^\s@]+@ufba\.br$/i, 'Use seu email institucional @ufba.br'),
  secondary_email: z.string().email('Informe um email alternativo válido'),
}).refine(
  ({ email, secondary_email }) =>
    email.trim().toLowerCase() !== secondary_email.trim().toLowerCase(),
  {
    path: [ 'secondary_email' ],
    message: 'O email alternativo deve ser diferente do principal',
  },
);

export const updatePasswordFormSchema = z
  .object({
    password: z.string().min(1, 'Senha muito curta!'),
    confirmPassword: z.string().min(1, 'Senha muito curta!'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: [ 'confirmPassword' ],
    message: 'As senhas não são iguais!',
  });

export type UserConfigFormValues = z.infer<typeof userConfigFormSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;
