import { z } from 'zod';

export const userConfigFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  registration: z.string().optional().nullable(),
  siape: z.coerce.number().optional().nullable(),
  lattes_url: z.string().optional().nullable(),
});

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
