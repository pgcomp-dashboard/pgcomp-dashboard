import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormErrorToast } from "@/hooks/useFormErrorToast";
import { parseApiError } from "@/services/http-client";
import { authService } from "@/services/modules/auth.service";
import { ApiError } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  UserRound,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import zxcvbn from "zxcvbn";

type RegistrationStep =
  | "choose"
  | "professor"
  | "student-lookup"
  | "student-new";
type StudentDegree = "mestrado" | "doutorado";

interface RegistrationValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  registration: string;
  advisor_id: string;
}

interface StudentOptions {
  advisors: { id: number; name: string }[];
}

const initialValues: RegistrationValues = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  registration: "",
  advisor_id: "",
};

const strengthMap = [
  { label: "Fraca", color: "bg-red-500" },
  { label: "Razoável", color: "bg-yellow-400" },
  { label: "Boa", color: "bg-lime-500" },
  { label: "Forte", color: "bg-green-600" },
];

const professorFormSchema = z
  .object({
    name: z.string(),
    email: z.string().email("Email inválido!"),
    password: z.string(),
    password_confirmation: z.string(),
  })
  .superRefine((data, context) => {
    if (!data.name.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nome é obrigatório!",
        path: ["name"],
      });
    }
    if (data.password.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A senha deve ter pelo menos 8 caracteres!",
        path: ["password"],
      });
    }
    if (data.password !== data.password_confirmation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem",
        path: ["password_confirmation"],
      });
    }
  });

type ProfessorFormValues = z.infer<typeof professorFormSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegistrationStep>("choose");
  const [studentDegree, setStudentDegree] = useState<StudentDegree>("mestrado");
  const [values, setValues] = useState<RegistrationValues>(initialValues);
  const [studentOptions, setStudentOptions] = useState<StudentOptions>({
    advisors: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordScore = values.password ? zxcvbn(values.password).score : -1;
  const strengthStage = passwordScore <= 1 ? 0 : passwordScore - 1;
  function updateValue(field: keyof RegistrationValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function startStudentFlow(degree: StudentDegree) {
    setStudentDegree(degree);
    setStep("student-lookup");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!values.email.trim() || !/^\S+@\S+\.\S+$/.test(values.email)) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    if (step === "student-lookup") {
      if (!values.registration.trim()) {
        toast.error("Informe sua matrícula.");
        return;
      }

      setIsSubmitting(true);
      try {
        await authService.requestStudentRegistration({
          registration: values.registration,
          email: values.email,
        });
        toast.success("E-mail de confirmação enviado", {
          description: "Acesse o link recebido para concluir seu cadastro.",
        });
        navigate("/login");
      } catch (error) {
        if ((error as ApiError).code !== 404) {
          toast.error(parseApiError(error));
          return;
        }

        try {
          const options = await authService.getStudentRegistrationOptions();
          setStudentOptions(options);
          setStep("student-new");
          toast.info("Matrícula não encontrada", {
            description:
              "Complete os dados para enviar seu cadastro à aprovação.",
          });
        } catch (optionsError) {
          toast.error(parseApiError(optionsError));
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === "professor" || step === "student-new") {
      if (!values.name.trim()) {
        toast.error("Informe seu nome completo.");
        return;
      }
      if (values.password.length < 8) {
        toast.error("A senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (values.password !== values.password_confirmation) {
        toast.error("As senhas não coincidem.");
        return;
      }
    }

    if (step === "student-new" && !values.advisor_id) {
      toast.error("Selecione seu orientador.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (step === "student-new") {
        await authService.registerStudent({
          name: values.name,
          registration: values.registration,
          email: values.email,
          password: values.password,
          password_confirmation: values.password_confirmation,
          degree: studentDegree,
          advisor_id: Number(values.advisor_id),
        });
        toast.success("Solicitação enviada", {
          description:
            "Seu acesso ficará disponível após aprovação do administrador.",
        });
      }
      navigate("/login");
    } catch (error) {
      toast.error(parseApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-4">
          <Link to="/" aria-label="Página inicial">
            <AppLogo className="w-30" />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-medium sm:text-xl">Criar sua conta</h1>
            {step === "choose" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha seu perfil
              </p>
            )}
          </div>
        </div>

        {step === "choose" ? (
          <div className="grid gap-3 rounded-md border p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("professor")}
            >
              <UserRound className="mr-2 h-4 w-4" /> Docente
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startStudentFlow("mestrado")}
            >
              <GraduationCap className="mr-2 h-4 w-4" /> Discente de mestrado
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startStudentFlow("doutorado")}
            >
              <GraduationCap className="mr-2 h-4 w-4" /> Discente de doutorado
            </Button>
          </div>
        ) : step === "professor" ? (
          <div className="rounded-md border p-12">
            <ProfessorRegistrationForm
              onBack={() => setStep("choose")}
              onSuccess={() => navigate("/login")}
            />
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 rounded-md border p-6">
            <Button
              type="button"
              variant="ghost"
              className="w-fit px-0"
              onClick={() => setStep("choose")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>

            {step === "student-lookup" || step === "student-new" ? (
              <label className="grid gap-2 text-sm font-medium">
                Matrícula
                <Input
                  required
                  inputMode="numeric"
                  placeholder="Sua matrícula"
                  value={values.registration}
                  onChange={(event) =>
                    updateValue("registration", event.target.value)
                  }
                />
              </label>
            ) : null}

            {step === "student-new" && (
              <label className="grid gap-2 text-sm font-medium">
                Nome completo
                <Input
                  required
                  autoComplete="name"
                  placeholder="Seu nome"
                  value={values.name}
                  onChange={(event) => updateValue("name", event.target.value)}
                />
              </label>
            )}

            <label className="grid gap-2 text-sm font-medium">
              E-mail
              <Input
                required
                type="email"
                autoComplete="email"
                placeholder="example@example.com"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
              />
            </label>

            {step === "student-new" && (
              <>
                <label className="grid gap-2 text-sm font-medium">
                  Orientador atual
                  <select
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={values.advisor_id}
                    onChange={(event) =>
                      updateValue("advisor_id", event.target.value)
                    }
                  >
                    <option value="">Selecione seu orientador</option>
                    {studentOptions.advisors.map((advisor) => (
                      <option key={advisor.id} value={advisor.id}>
                        {advisor.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {step === "student-new" && (
              <>
                <label className="grid gap-2 text-sm font-medium">
                  Senha
                  <div className="relative">
                    <Input
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pr-10"
                      value={values.password}
                      onChange={(event) =>
                        updateValue("password", event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {values.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {strengthMap.map((strength, index) => (
                          <div
                            key={strength.label}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${index <= strengthStage ? strength.color : "bg-muted"}`}
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
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Confirmar senha
                  <div className="relative">
                    <Input
                      required
                      minLength={8}
                      type={showPasswordConfirmation ? "text" : "password"}
                      autoComplete="new-password"
                      className="pr-10"
                      value={values.password_confirmation}
                      onChange={(event) =>
                        updateValue("password_confirmation", event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() =>
                        setShowPasswordConfirmation(!showPasswordConfirmation)
                      }
                      aria-label={
                        showPasswordConfirmation
                          ? "Ocultar confirmação"
                          : "Mostrar confirmação"
                      }
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </label>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {step === "student-lookup" ? "Continuar" : "Cadastrar"}
            </Button>
          </form>
        )}

        <div className="mt-5 text-center text-sm">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfessorRegistrationForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });
  const passwordValue = useWatch({
    control: form.control,
    name: "password",
  });
  const strengthScore = passwordValue ? zxcvbn(passwordValue).score : -1;
  const strengthStage = strengthScore <= 1 ? 0 : strengthScore - 1;

  useFormErrorToast(form.formState.errors);

  async function onSubmit(values: ProfessorFormValues) {
    try {
      await authService.register({ ...values, type: "professor" });
      toast.success("Cadastro realizado com sucesso!", {
        description:
          "Verifique seu e-mail e aguarde a aprovação do administrador.",
        duration: 6000,
      });
      onSuccess();
    } catch (error) {
      toast.error(parseApiError(error));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Button
            type="button"
            variant="ghost"
            className="w-fit px-0"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="example@example.com" {...field} />
                </FormControl>
                <FormDescription>Seu e-mail de acesso.</FormDescription>
              </FormItem>
            )}
          />
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
                      {strengthMap.map((strength, index) => (
                        <div
                          key={index}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${index <= strengthStage ? strength.color : "bg-muted"}`}
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
                <FormDescription>A senha do seu usuário.</FormDescription>
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
                      type={showPasswordConfirmation ? "text" : "password"}
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
                        setShowPasswordConfirmation(!showPasswordConfirmation)
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Cadastrar
          </Button>
        </div>
      </form>
    </Form>
  );
}
