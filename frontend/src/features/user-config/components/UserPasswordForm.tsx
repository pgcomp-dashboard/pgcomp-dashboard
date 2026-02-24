import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormErrorToast } from '@/hooks/useFormErrorToast';
import { UseFormReturn } from 'react-hook-form';
import { UpdatePasswordFormValues } from '../types';

interface UserPasswordFormProps {
  form: UseFormReturn<UpdatePasswordFormValues>;
  onSubmit: (values: UpdatePasswordFormValues) => Promise<void>;
}

export function UserPasswordForm({ form, onSubmit }: UserPasswordFormProps) {
  useFormErrorToast(form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>Nova senha do seu usuário.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                Confirme a nova senha para seu usuário.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Atualizando...' : 'Atualizar senha'}
        </Button>
      </form>
    </Form>
  );
}
