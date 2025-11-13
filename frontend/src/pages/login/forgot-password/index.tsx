import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import api, { RequestBodyType } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Email inválido!'),
});

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(JSON.stringify(values))
    const payload: RequestBodyType = {
      email: values.email
    }
    try {
      const response = await api.forgotPassword(JSON.stringify(payload))
      console.log(response.status);
    } catch (err) {
      console.error('Erro ao solicitar troca de senha', err);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen space-y-6">
      <div>
        <div className="flex-col justify-center text-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Esqueceu sua senha?</h1>
          </div>
          <p className="text-muted-foreground">Solicite a recuperação de senha de sua conta.</p>
        </div>

        <div className="rounded-md border p-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormDescription>
                  Digite o e-mail da conta que deseja recuperar
                </FormDescription>
                <FormMessage />
            </FormItem>
          )}
            />
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>Solicitar troca de senha</Button>
          </form>
        </Form>
        </div>
      </div>
    </div>
  );
}
