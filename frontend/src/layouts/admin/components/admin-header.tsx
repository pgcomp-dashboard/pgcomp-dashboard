import {
  Bell,
  BookOpenText,
  ChevronRight,
  LogOut,
  ShieldPlus,
  User,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useAuth from "@/hooks/auth";
import { usePendingSummary } from "@/hooks/usePendingSummary";

export function AdminHeader() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { summary } = usePendingSummary();

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
        {summary.total > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 flex h-3 w-4 min-w-3 items-center justify-center rounded-full px-1 text-[10px] font-bold text-destructive-foreground border-transparent bg-red-500 text-white hover:bg-red-600">
                  {summary.total}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex flex-col">
                {summary.registrations > 0 && (
                  <Link
                    to="/admin/professors?tab=requests"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">
                        Novos Cadastros
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {summary.registrations} docentes aguardando aprovação.
                      </p>
                    </div>
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      {summary.registrations}
                    </Badge>
                  </Link>
                )}
                {summary.admin_requests > 0 && (
                  <Link
                    to="/admin/professors?tab=requests"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-t"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <ShieldPlus className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">
                        Acesso Admin
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {summary.admin_requests} solicitações de privilégios.
                      </p>
                    </div>
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      {summary.admin_requests}
                    </Badge>
                  </Link>
                )}
                {summary.publishers > 0 && (
                  <Link
                    to="/admin/publishers?tab=pending"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-t"
                  >
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <BookOpenText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">
                        Veículos Sugeridos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {summary.publishers} novos periódicos/conferências.
                      </p>
                    </div>
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      {summary.publishers}
                    </Badge>
                  </Link>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
              <div className="flex items-center gap-1.5 hidden md:flex">
                <span className="text-xs sm:text-sm font-medium truncate max-w-30 lg:max-w-none">
                  {auth?.user?.name}
                </span>
              </div>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link
                to="/portal/profile"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            {/* {auth?.isAdmin && (
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
            )} */}
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
