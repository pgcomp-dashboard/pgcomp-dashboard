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
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  password: z.string().min(1, 'Senha muito curta!'),
  confirmPassword: z.string().min(1, 'Senha muito curta!'),
})
  .refine((data) => data.password === data.confirmPassword, {
    path: [ 'confirmPassword' ],
    message: 'As senhas não são iguais!',
  });;

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
  });

  const queryString: string = window.location.search
  const urlParams: URLSearchParams = new URLSearchParams(queryString)

  console.log(queryString)

  const token: string | null = urlParams.get('token');
  const email: string | null = urlParams.get('email');

  console.log(token, email)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: RequestBodyType = {
      token: token,
      email: email,
      password: values.password,
      password_confirmation: values.confirmPassword
    }
    try {
      await api.resetUserPassword(JSON.stringify(payload))
      toast.success('Senha alterada com sucesso!');
      navigate('/login')
    } catch (err) {
      console.error('Erro ao trocar senha:', err);
      toast.error('Erro ao alterar senha.');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen space-y-6">
      <div>
      <div className="flex-col justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Troca de senha</h1>
        </div>
        <p className="text-muted-foreground">Digite a nova senha da sua conta</p>
      </div>

      <div className="rounded-md border p-12">
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
                <FormDescription>
                  Nova senha do seu usuário.
                </FormDescription>
                <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
              />
              <Button className='w-full' type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? "Confirmando..." : "Confirmar troca de senha"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
