import {
  BookOpen,
  ChevronRight,
  File,
  Folders,
  GraduationCap,
  LogOut,
  Settings,
  Trophy,
  User,
  Users,
} from "lucide-react";
import type React from "react";

import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/auth";
import { Link, useNavigate } from "react-router";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = "/admin" as string; // TODO: get from react-router

  function handleLogout() {
    if (!auth?.isLoading) {
      navigate("/");
      setTimeout(() => auth?.logout(), 100);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b h-18">
            <div className="flex items-center justify-center gap-2 px-2">
              <AppLogo className="w-32" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link to="/" data-cy="link-areas">
                    <Users className="h-4 w-4" />
                    <span>Início</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {auth?.isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/admin/dashboard"}
                    >
                      <Link to="/admin/dashboard" data-cy="link-areas">
                        <Users className="h-4 w-4" />
                        <span>DashBoard PGCOMP</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/admin/team"}
                    >
                      <Link to="/admin/team" data-cy="link-areas">
                        <Users className="h-4 w-4" />
                        <span>Usuários</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/admin/areas"}
                    >
                      <Link to="/admin/areas" data-cy="link-areas">
                        <Users className="h-4 w-4" />
                        <span>Áreas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/admin/qualis"}
                    >
                      <Link to="/admin/qualis">
                        <BookOpen className="h-4 w-4" />
                        <span>Qualis</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/admin/publishers"}
                    >
                      <Link to="/admin/publishers">
                        <BookOpen className="h-4 w-4" />
                        <span>Revistas/Conferencias</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/admin/professors"}
                    >
                      <Link to="/admin/professors">
                        <Folders className="h-4 w-4" />
                        <span>Docentes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/admin/students"}
                    >
                      <Link to="/admin/students" data-cy="link-discentes">
                        <GraduationCap className="h-4 w-4" />
                        <span>Discentes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/portal/ranking"}
                    >
                      <Link to="/portal/credenciamento">
                        <Trophy className="h-4 w-4" />
                        <span>Credenciamento</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/portal/productions"}
                >
                  <Link to="/portal/productions">
                    <File className="h-4 w-4" />
                    <span>Produções</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 sm:h-16 lg:h-18 border-b flex items-center px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4">
            <SidebarTrigger />
            <div className="text-sm sm:text-base font-medium truncate">
              Menu Lateral
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              {/* Botão Voltar para Dashboard - Mobile e Tablet */}
              {/* Botão completo - Desktop */}
              {auth?.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden lg:flex"
                >
                  <Link to="/admin/dashboard">Dashboard PGCOMP</Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 min-w-0"
                  >
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 text-xs sm:text-sm">
                      {auth?.user?.name[0]}
                    </div>
                    <span className="text-xs sm:text-sm font-medium hidden md:inline truncate max-w-30 lg:max-w-none">
                      {auth?.user?.name}
                    </span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/portal/user-config"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm"
                    >
                      <User className="h-4 w-4" />
                      <span>Configurações da conta</span>
                    </Link>
                  </DropdownMenuItem>
                  {auth?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/system-config"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configurações do sistema</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Button
                      asChild
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start"
                    >
                      <div className="p-0 flex items-center gap-2 text-red-600 text-sm">
                        <LogOut className="h-4 w-4" />
                        <span>Sair da conta</span>
                      </div>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
