import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { authService } from "@/services/modules/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import zxcvbn from "zxcvbn";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_student: boolean;
  registration: string;
};

const formSchema: z.ZodType<RegisterFormValues> = z
  .object({
    name: z.string(),
    email: z.string().email("Email inválido!"),
    password: z.string(),
    password_confirmation: z.string(),
    is_student: z.boolean(),
    registration: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_student) {
      if (!data.name.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nome é obrigatório!",
          path: ["name"],
        });
      }

      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A senha deve ter pelo menos 8 caracteres!",
          path: ["password"],
        });
      }

      if (data.password !== data.password_confirmation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "As senhas não coincidem",
          path: ["password_confirmation"],
        });
      }
    }

    if (data.is_student && !data.registration.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A matrícula é obrigatória!",
        path: ["registration"],
      });
    }
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState<boolean>(false);

  const strengthMap = [
    { label: "Fraca", color: "bg-red-500" },
    { label: "Razoável", color: "bg-yellow-400" },
    { label: "Boa", color: "bg-lime-500" },
    { label: "Forte", color: "bg-green-600" },
  ];

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      registration: "",
      is_student: false,
    },
  });
  form.watch("is_student");

  const isStudent = form.getValues()?.is_student;
  const type = isStudent ? "student" : "professor";

  const passwordValue = useWatch({ control: form.control, name: "password" });
  const strengthScore = passwordValue ? zxcvbn(passwordValue).score : -1;
  const strengthStage = strengthScore <= 1 ? 0 : strengthScore - 1;

  useFormErrorToast(form.formState.errors);

  async function onSubmit(values: RegisterFormValues) {
    try {
      if (values.is_student) {
        await authService.requestStudentRegistration({
          registration: values.registration,
          email: values.email,
        });

        toast.success("Solicitação de cadastro enviada!", {
          description:
            "Enviamos um e-mail de confirmação para o seu endereço @ufba.br. Acesse o link para definir sua senha e concluir o cadastro.",
          duration: 8000,
        });
        navigate("/login");
        return;
      }

      await authService.register({ ...values, type });
      toast.success("Cadastro realizado com sucesso!", {
        description:
          "Verifique seu e-mail e aguarde a aprovação do administrador para acessar o sistema.",
        duration: 6000,
      });
      navigate("/login");
    } catch (e) {
      const erro = e as unknown as {
        errors: { description: string }[];
        code: number;
      };
      if (erro.code === 422) {
        erro.errors?.map((e) => {
          toast.error(e.description);
        });
        return;
      }
    }
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="mb-4 sm:mb-8 flex items-center justify-center">
                <AppLogo className="w-30" />
              </div>
            </Link>

            <div className="space-y-1 sm:space-y-2 text-center">
              <h1 className="text-lg sm:text-xl font-medium">
                Criar sua conta
              </h1>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="is_student"
                  render={({ field }) => (
                    <FormItem className="flex gap-2">
                      <FormLabel>Sou estudande do mestrado/doutorado</FormLabel>
                      <FormControl>
                        <Switch
                          className="cursor-pointer min-w-[32px]! min-h-[18px]!"
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.getValues()?.is_student && (
                  <FormField
                    control={form.control}
                    name="registration"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Matrícula</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua matrícula" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                {!form.getValues()?.is_student && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="example@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!form.getValues()?.is_student && (
                  <>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pr-10"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          {passwordValue && (
                            <div className="mt-2 space-y-1">
                              <div className="flex gap-1">
                                {strengthMap.map((s, i) => (
                                  <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strengthStage ? s.color : "bg-muted"}`}
                                  />
                                ))}
                              </div>
                              <p
                                className={`text-xs ${strengthMap[strengthStage].color.replace("bg-", "text-")}`}
                              >
                                {strengthMap[strengthStage].label}
                              </p>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password_confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={
                                  showPasswordConfirmation ? "text" : "password"
                                }
                                placeholder="••••••••"
                                className="pr-10"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowPasswordConfirmation(
                                    !showPasswordConfirmation,
                                  )
                                }
                              >
                                {showPasswordConfirmation ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cadastrar
                </Button>

                <div className="text-center text-sm">
                  Já tem uma conta?{" "}
                  <Link
                    to="/login"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Entrar
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
