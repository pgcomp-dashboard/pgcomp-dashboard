import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormErrorToast } from '@/hooks/useFormErrorToast';
import { UseFormReturn } from 'react-hook-form';
import { UserConfigFormValues } from '../types';

interface UserGeneralFormProps {
  form: UseFormReturn<UserConfigFormValues>;
  onSubmit: (values: UserConfigFormValues) => Promise<void>;
}

export function UserGeneralForm({ form, onSubmit }: UserGeneralFormProps) {
  useFormErrorToast(form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className={
                    !form.formState.dirtyFields.name
                      ? 'text-muted-foreground/60'
                      : 'text-foreground font-medium'
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className={
                    !form.formState.dirtyFields.email
                      ? 'text-muted-foreground/60'
                      : 'text-foreground font-medium'
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula (Estudante):</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    className={
                      !form.formState.dirtyFields.registration
                        ? 'text-muted-foreground/60'
                        : 'text-foreground font-medium'
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="siape"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIAPE (Professor):</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    className={
                      !form.formState.dirtyFields.siape
                        ? 'text-muted-foreground/60'
                        : 'text-foreground font-medium'
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="lattes_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Lattes:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  className={
                    !form.formState.dirtyFields.lattes_url
                      ? 'text-muted-foreground/60'
                      : 'text-foreground font-medium'
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pq"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Bolsista PQ</FormLabel>
                <div className='text-[0.8rem] text-muted-foreground'>
                  Indique se você possui bolsa de produtividade em pesquisa.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </form>
    </Form>
  );
}
