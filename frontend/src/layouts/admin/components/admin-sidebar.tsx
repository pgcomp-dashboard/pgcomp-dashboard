import {
    BookOpen,
  File,
    GraduationCap,
    Trophy,
  Users
} from "lucide-react";
import { Link, useLocation } from "react-router";

import AppLogo from "@/components/AppLogo";
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

  return (
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
                    <Users className="h-4 w-4" />
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
  );
}
