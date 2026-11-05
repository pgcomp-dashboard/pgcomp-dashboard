import type React from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import useAuth from "@/hooks/auth";
import { Link } from "react-router";
import { AdminHeader } from "./components/admin-header";
import { AdminSidebar } from "./components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  }) {

  const isDesktop = window.innerWidth >= 768;
  const auth = useAuth();
  const needsStudentEmails =
    auth?.user?.type === "student" &&
    (!auth.user.email?.toLowerCase().endsWith("@ufba.br") ||
      !auth.user.secondary_email);

  return (
    <SidebarProvider defaultOpen={isDesktop}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          {needsStudentEmails && (
            <div
              className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
              role="alert"
            >
              Cadastre seu email principal @ufba.br e um email alternativo no{" "}
              <Link
                to="/portal/profile"
                className="font-semibold underline underline-offset-2"
              >
                perfil
              </Link>
              .
            </div>
          )}
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
