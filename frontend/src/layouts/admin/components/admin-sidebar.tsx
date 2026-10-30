import {
  Award,
  BarChart2,
  BookOpen,
  ChevronDown,
  ClipboardList,
  File,
  GraduationCap,
  Globe,
  Heart,
  Medal,
  Plane,
  ShieldPlus,
  Settings2,
  Trophy,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { Badge } from "@/components/ui/badge";
import AppLogo from "@/components/AppLogo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/auth";
import { usePendingSummary } from "@/hooks/usePendingSummary";

export function AdminSidebar() {
  const auth = useAuth();
  const { summary } = usePendingSummary();
  const { pathname } = useLocation();
  const isStudentArea =
    pathname === "/portal/student/productions" ||
    pathname === "/admin/student/requests" ||
    pathname === "/admin/student/ranking" ||
    pathname === "/admin/student/rules";
  const isProfessorArea =
    pathname.startsWith("/admin/professors") ||
    pathname === "/admin/orientacoes";
  const isAwardsArea =
    pathname === "/portal/awards" || pathname === "/admin/awards";
  const [studentsOpen, setStudentsOpen] = useState(isStudentArea);
  const [professorsOpen, setProfessorsOpen] = useState(isProfessorArea);
  const [awardsOpen, setAwardsOpen] = useState(isAwardsArea);

  useEffect(() => {
    if (isStudentArea) setStudentsOpen(true);
    if (isProfessorArea) setProfessorsOpen(true);
    if (isAwardsArea) setAwardsOpen(true);
  }, [isStudentArea, isProfessorArea, isAwardsArea]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b h-18">
        <div className="flex items-center justify-center gap-2 px-2">
          <Link to="/">
            <AppLogo className="w-9" />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="admin-sidebar-scroll">
        <SidebarMenu className="gap-1.5 px-3 py-3 [&_[data-slot=sidebar-menu-button]]:h-10 [&_[data-slot=sidebar-menu-button]]:rounded-lg [&_[data-slot=sidebar-menu-button]]:px-3 [&_[data-slot=sidebar-menu-button]]:text-[13px]">
          {/* Início */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"}>
              <Link to="/">
                <Users className="h-4 w-4" />
                <span>Início</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {auth?.isAdmin && (
            <SidebarMenuItem>
              <Collapsible
                open={professorsOpen}
                onOpenChange={setProfessorsOpen}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={isProfessorArea}>
                    <Users className="h-4 w-4" />
                    <span>Docentes</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform ${professorsOpen ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4 mt-1 gap-1 border-l pl-2">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin/professors"}
                        className="h-9 text-[12px]"
                      >
                        <Link to="/admin/professors">
                          <Users className="h-4 w-4" />
                          <span>Docentes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin/professors/requests"}
                        className="h-9 text-[12px]"
                      >
                        <Link to="/admin/professors/requests">
                          <UserPlus className="h-4 w-4" />
                          <span>Solicitações</span>
                          {summary.registrations > 0 && (
                            <Badge variant="notification" className="ml-auto">
                              {summary.registrations}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin/orientacoes"}
                        className="h-9 text-[12px]"
                      >
                        <Link to="/admin/orientacoes">
                          <UserCog className="h-4 w-4" />
                          <span>Orientações</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          )}
          {(auth?.user?.type !== "student" || auth?.isAdmin) && (
            <SidebarMenuItem>
              <Collapsible open={awardsOpen} onOpenChange={setAwardsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={isAwardsArea}>
                    <Award className="h-4 w-4" />
                    <span>Prêmios</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform ${awardsOpen ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4 mt-1 gap-1 border-l pl-2">
                    {auth?.user?.type !== "student" && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/portal/awards"}
                          className="h-9 text-[12px]"
                        >
                          <Link to="/portal/awards">
                            <Award className="h-4 w-4" />
                            <span>Meus Prêmios</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {auth?.isAdmin && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/admin/awards"}
                          className="h-9 text-[12px]"
                        >
                          <Link to="/admin/awards">
                            <ClipboardList className="h-4 w-4" />
                            <span>Gestão de Prêmios</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          )}
          {auth?.isAdmin && (
            <SidebarMenuItem>
              <Collapsible open={studentsOpen} onOpenChange={setStudentsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={isStudentArea}>
                    <GraduationCap className="h-4 w-4" />
                    <span>Discentes</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform ${studentsOpen ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4 mt-1 gap-1 border-l pl-2">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin/student/requests"}
                        className="h-9 text-[12px]"
                      >
                        <Link to="/admin/student/requests">
                          <UserPlus className="h-4 w-4" />
                          <span>Solicitações</span>
                          {summary.student_registrations > 0 && (
                            <Badge variant="notification" className="ml-auto">
                              {summary.student_registrations}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin/student/ranking"}
                        className="h-9 text-[12px]"
                      >
                        <Link to="/admin/student/ranking">
                          <Medal className="h-4 w-4" />
                          <span>Ranking</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/portal/student/productions"}
                        className="h-9 text-[12px]"
                      >
                        <Link to="/portal/student/productions">
                          <File className="h-4 w-4" />
                          <span>Produções</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin/student/rules"}
                        className="h-9 text-[12px]"
                      >
                        <Link to="/admin/student/rules">
                          <Settings2 className="h-4 w-4" />
                          <span>Regras</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          )}
          {auth?.isAdmin && (
            <>
              {/* Projetos PGCOMP */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/projects-dashboard"}
                >
                  <Link to="/admin/projects-dashboard">
                    <BarChart2 className="h-4 w-4" />
                    <span>Projetos PGCOMP</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Qualis */}
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
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/students"}
                >
                  <Link to="/admin/students" data-cy="link-discentes">
                    <GraduationCap className="h-4 w-4" />
                    <span>Discentes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* Veículos */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/publishers"}
                >
                  <Link to="/admin/publishers">
                    <BookOpen className="h-4 w-4" />
                    <span>Veículos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/users"}
                >
                  <Link to="/admin/users">
                    <Users className="h-4 w-4" />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/admin-requests"}
                >
                  <Link to="/admin/admin-requests">
                    <ShieldPlus className="h-4 w-4" />
                    <span>Acesso Admin</span>
                    {summary.admin_requests > 0 && (
                      <Badge variant="notification" className="ml-auto">
                        {summary.admin_requests}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/featured-productions"}
                >
                  <Link to="/admin/featured-productions">
                    <Heart className="h-4 w-4" />
                    <span>Favoritos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Regras */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/rules"}
                >
                  <Link to="/admin/rules">
                    <Settings2 className="h-4 w-4" />
                    <span>Regras</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/dashboard"}
                >
                  <Link to="/admin/dashboard">
                    <BarChart2 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

          {auth?.isManager && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/admin/lattes-uploads"}
              >
                <Link to="/admin/lattes-uploads">
                  <File className="h-4 w-4" />
                  <span>XML Lattes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Produções */}
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
          {auth?.user?.type !== "student" && (
            <>
              {/* Ações de internacionalização do próprio usuário */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/portal/internationalization"}
                >
                  <Link to="/portal/internationalization">
                    <Globe className="h-4 w-4" />
                    <span>Internacionalização</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          {auth?.isAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/credenciamento"}
                >
                  <Link to="/admin/credenciamento">
                    <Trophy className="h-4 w-4" />
                    <span>Credenciamento</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/internationalization"}
                >
                  <Link to="/admin/internationalization">
                    <Plane className="h-4 w-4" />
                    <span>Gestão de Internacionalização</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
