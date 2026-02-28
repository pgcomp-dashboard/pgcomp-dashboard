"use client";

import { UserAdminRequestForm } from "@/features/user-config/components/UserAdminRequestForm";
import { UserGeneralForm } from "@/features/user-config/components/UserGeneralForm";
import { UserPasswordForm } from "@/features/user-config/components/UserPasswordForm";
import { useUserConfig } from "@/features/user-config/hooks/useUserConfig";

export default function ProfilePage() {
  const {
    auth,
    generalForm,
    passwordForm,
    onGeneralSubmit,
    onPasswordSubmit,
    adminState,
  } = useUserConfig();

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Perfil
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de segurança.
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">
            Informações do usuário
          </h3>
          <div className="rounded-xl border bg-card shadow-sm p-6 sm:p-10">
            <UserGeneralForm
              form={generalForm}
              onSubmit={onGeneralSubmit}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">
            Configurações de segurança
          </h3>
          <div className="rounded-xl border bg-card shadow-sm p-6 sm:p-10">
            <UserPasswordForm
              form={passwordForm}
              onSubmit={onPasswordSubmit}
            />
          </div>
        </section>

        {!auth?.isAdmin && (
          <section className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">
              Solicitar Acesso Admin
            </h3>
            <div className="rounded-xl border bg-card shadow-sm p-6 sm:p-10">
              <UserAdminRequestForm
                status={adminState.status}
                isLoading={adminState.isLoading}
                error={adminState.error}
                onRequest={adminState.requestAdmin}
                isRequesting={adminState.isRequesting}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
