import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, NavLink } from "react-router";

const NAV_LINKS = [
  { to: "/premios", label: "Prêmios" },
  { to: "/internacionalizacao", label: "Internacionalização" },
];

/** Moldura das páginas abertas ao público: sem menu lateral e sem exigir login. */
export default function PublicLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/premios" aria-label="PGCOMP">
            <AppLogo className="w-12" />
          </Link>
          <nav className="flex flex-1 items-center gap-1" aria-label="Páginas públicas">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                    isActive && "bg-muted text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {children}
      </main>

      <footer className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          Informações cadastradas por docentes e discentes do PGCOMP/UFBA.
        </p>
      </footer>
    </div>
  );
}
