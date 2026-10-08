import {
  BarChart2,
  BookOpen,
  ChevronDown,
  File,
  GraduationCap,
  Heart,
  Medal,
  Settings2,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

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

export function AdminSidebar() {
  const auth = useAuth();
  const { pathname } = useLocation();
  const isStudentArea =
    pathname === "/portal/student/productions" ||
    pathname.startsWith("/admin/student/");
  const [studentsOpen, setStudentsOpen] = useState(isStudentArea);

  return (
    <Sidebar>
      <SidebarHeader className="border-b h-18">
        <div className="flex items-center justify-center gap-2 px-2">
          <Link to="/">
            <AppLogo className="w-9" />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Início */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"}>
              <Link to="/">
                <Users className="h-4 w-4" />
                <span>Início</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/areas"}
                >
                  <Link to="/admin/areas" data-cy="link-areas">
                    <Users className="h-4 w-4" />
                    <span>Áreas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
          {/* Projetos Individuais */}
          {auth?.user?.type !== "student" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/portal/projects"}
              >
                <Link to="/portal/projects">
                  <File className="h-4 w-4" />
                  <span>Projetos Individuais</span>
                </Link>
              </SidebarMenuButton>
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
              {/* Docentes */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/professors"}
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
                <Collapsible open={studentsOpen} onOpenChange={setStudentsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isStudentArea}>
                      <GraduationCap className="h-4 w-4" />
                      <span>Estudantes</span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform ${studentsOpen ? "rotate-180" : ""}`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="ml-4 border-l pl-2">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/admin/student/ranking"}
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
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
