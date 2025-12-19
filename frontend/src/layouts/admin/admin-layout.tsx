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
} from 'lucide-react';
import type React from 'react';

import AppLogo from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import useAuth from '@/hooks/auth';
import { Link, useNavigate } from 'react-router';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = '/admin' as string; // TODO: get from react-router
  const roles = auth?.user?.roles || ["basic"]

  function handleLogout() {
    if (!auth?.isLoading) {
      navigate('/');
      setTimeout(() => auth?.logout(), 100);
    }
  }

  function swichProfile(profile: string) {
    auth?.changeProfile(profile)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b h-18">
            <div className="flex items-center justify-center gap-2 px-2">
              <AppLogo className='w-32' />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/welcome'}>
                    <Link to="/welcome" data-cy="link-areas">
                      <Users className="h-4 w-4" />
                      <span>Pagina Inicial</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              {auth?.profile === "admin" &&
                <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/admin/areas'}>
                    <Link to="/admin/areas" data-cy="link-areas">
                      <Users className="h-4 w-4" />
                      <span>Áreas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/qualis'}>
                  <Link to="/admin/qualis">
                    <BookOpen className="h-4 w-4" />
                    <span>Qualis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/professors'}>
                  <Link to="/admin/professors">
                    <Folders className="h-4 w-4" />
                    <span>Docentes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/students'}>
                  <Link to="/admin/students" data-cy="link-discentes">
                    <GraduationCap className="h-4 w-4" />
                    <span>Discentes</span>
                  </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                </>
              }
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/portal/ranking'}>
                  <Link to="/portal/ranking">
                    <Trophy className="h-4 w-4" />
                    <span>Ranking</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/portal/ranking-four'}>
                  <Link to="/portal/ranking-four">
                    <Trophy className="h-4 w-4" />
                    <span>Ranking 4 Anos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {auth?.profile !== "admin" &&
                <div>
                <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/professors'}>
                  <Link to="/admin/professors">
                    <Folders className="h-4 w-4" />
                    <span>Docentes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/portal/productions'}>
                    <Link to="/portal/productions">
                      <File className="h-4 w-4" />
                      <span>Minhas Produções</span>
                    </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              }
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <LogOut className="h-4 w-4" />
                    <span>Voltar para dashboard</span> {/* TODO */}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="h-18 border-b flex items-center px-6">
            <SidebarTrigger />
            <div className="ml-4 font-medium">Painel de administração</div>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/">Ver dashboard pública</Link>
              </Button> {/* TODO */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      { auth?.user?.name[0] }
                    </div>
                    <span className="text-sm font-medium hidden md:inline">{ auth?.user?.name }</span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    {roles?.length > 1 &&
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <span>Selecionar Perfil</span>
                          </Button>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {
                            roles?.map((role) => (
                              <DropdownMenuItem asChild>
                                <Link onClick={() => swichProfile(role)} to="/admin/" rel="noopener noreferrer" className="flex items-center gap-2">
                                  <span>{role}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))
                          }
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    }
                    </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/user-config" rel="noopener noreferrer" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Configurações da conta</span>
                    </Link>
                  </DropdownMenuItem>
                  {auth?.profile === "admin" &&
                    <DropdownMenuItem asChild>
                      <Link to="/admin/system-config" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Configurações do sistema</span>
                      </Link>
                    </DropdownMenuItem>
                  }
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Button asChild variant='ghost' onClick={handleLogout}>
                      <div className='p-0 flex items-center gap-2 text-red-600'>
                        <LogOut className="h-4 w-4" />
                        <span>Sair da conta</span>
                      </div>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
