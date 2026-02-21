import { ChevronRight, LogOut, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useAuth from "@/hooks/auth";

export function AdminHeader() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    if (!auth?.isLoading) {
      navigate("/");
      setTimeout(() => auth?.logout(), 100);
    }
  }

  return (
    <header className="h-14 sm:h-16 lg:h-18 border-b flex items-center px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4">
      <SidebarTrigger />
      <div className="text-sm sm:text-base font-medium truncate">
        Menu Lateral
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
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
  );
}
