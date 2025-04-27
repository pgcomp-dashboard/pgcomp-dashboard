import { NavLink } from 'react-router';
import { ChevronDown, ExternalLink, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import PublicationsChart from '@/components/charts/Publications.tsx';
import StudentsPerAdvisorChart from '@/components/charts/StudentsPerAdvisor.tsx';
import StudentsPerFieldChart from '@/components/charts/StudentsPerFieldChart.tsx';
import StudentsPerSubfieldChart from '@/components/charts/StudentsPerSubfieldChart.tsx';
import ProductionPerQualisChart from '@/components/charts/ProductionPerQualis';
// import QualityMetricsChart from '@/components/quality-metrics-chart';
// import StudentsByFacultyChart from '@/components/students-by-faculty-chart';
// import StudentsByAreaChart from '@/components/students-by-area-chart';
// import StudentsBySubareaChart from '@/components/students-by-subarea-chart';

import logoImage from '@/assets/logo.png';

const ADMIN_REDIRECT_URL = 'https://todo.com';

export default function Dashboard() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex min-h-screen flex-col items-center">
      <header className="sticky top-0 z-50 w-full border-b bg-background p-4 flex items-center justify-center">
        <div className="container flex h-16 items-center justify-around">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Mostrar menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="min-h-screen flex flex-col gap-4 space-y-2 p-4">
                  <div className="flex flex-col gap-8">
                    <NavLink
                      to="#publications"
                      onClick={() => scrollToSection('publications')}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Produções científicas
                    </NavLink>
                    <NavLink
                      to="#quality"
                      onClick={() => scrollToSection('quality')}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Produções por qualis
                    </NavLink>
                    <NavLink
                      to="#faculty"
                      onClick={() => scrollToSection('faculty')}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Alunos por docente
                    </NavLink>
                    <NavLink
                      to="#area"
                      onClick={() => scrollToSection('area')}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Alunos por área
                    </NavLink>
                    <NavLink
                      to="#subarea"
                      onClick={() => scrollToSection('subarea')}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Alunos por sub-área
                    </NavLink>
                  </div>
                  <Button asChild className="sm:flex">
                    <NavLink to={ADMIN_REDIRECT_URL} target="_blank" rel="noopener noreferrer">
                      Login <ExternalLink className="ml-2 h-4 w-4" />
                    </NavLink>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <NavLink to="/" className="flex items-center gap-2">
              <img className="w-42" src={logoImage} alt="Dashboard PGComp" />
            </NavLink>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="#publications"
              onClick={() => scrollToSection('publications')}
              className={'text-sm font-medium transition-colors hover:text-primary'}
            >
              Produções científicas
            </NavLink>
            <NavLink
              to="#quality"
              onClick={() => scrollToSection('quality')}
              className={'text-sm font-medium transition-colors hover:text-primary'}
            >
              Produções por qualis
            </NavLink>
            <NavLink
              to="#faculty"
              onClick={() => scrollToSection('faculty')}
              className={'text-sm font-medium transition-colors hover:text-primary'}
            >
              Alunos por docente
            </NavLink>
            <NavLink
              to="#area"
              onClick={() => scrollToSection('area')}
              className={'text-sm font-medium transition-colors hover:text-primary'}
            >
              Alunos por área
            </NavLink>
            <NavLink
              to="#subarea"
              onClick={() => scrollToSection('subarea')}
              className={'text-sm font-medium transition-colors hover:text-primary'}
            >
              Alunos por sub-área
            </NavLink>
          </nav>
          <Button asChild className="hidden sm:flex">
            <NavLink to={ADMIN_REDIRECT_URL} target="_blank" rel="noopener noreferrer">
              Login <ExternalLink className="ml-2 h-4 w-4" />
            </NavLink>
          </Button>
        </div>
      </header>
      <main className="flex-1 container py-6 space-y-8 w-full lg:px-16">
        <section id="publications" className="space-y-4">
          <Card>
            <Tabs defaultValue="all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produções científicas</CardTitle>

                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="journals">Em periódicos</TabsTrigger>
                  <TabsTrigger value="conferences">Em conferências</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value={'all'}><PublicationsChart/></TabsContent>
                <TabsContent value={'journals'}><PublicationsChart filter="journal"/></TabsContent>
                <TabsContent value={'conferences'}><PublicationsChart filter="conference"/></TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </section>

        <section id="quality" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produções por qualis</CardTitle>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="journals">Em periódicos</TabsTrigger>
                  <TabsTrigger value="conferences">Em conferências</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {<ProductionPerQualisChart />}
            </CardContent>
          </Card>
        </section>

        <section id="faculty" className="space-y-4">
          <Card>
            <Tabs defaultValue="all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quantidade de Alunos por Orientador</CardTitle>

                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value={'all'}><StudentsPerAdvisorChart/></TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </section>

        <section id="area" className="space-y-4">
          <Card>
            <Tabs defaultValue="all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Alunos por área</CardTitle>
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="mestrando">Mestrandos</TabsTrigger>
                  <TabsTrigger value="doutorando">Doutorandos</TabsTrigger>
                  <TabsTrigger value="completed">Concluídos</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value='all'><StudentsPerFieldChart /></TabsContent>
                <TabsContent value='mestrando'><StudentsPerFieldChart filter='mestrando' /></TabsContent>
                <TabsContent value='doutorando'><StudentsPerFieldChart filter='doutorando' /></TabsContent>
                <TabsContent value='completed'><StudentsPerFieldChart filter='completed' /></TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </section>

        <section id="subarea" className="space-y-4">
          <Card>
            <Tabs defaultValue="all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Alunos por sub-área</CardTitle>
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="mestrando">Mestrandos</TabsTrigger>
                  <TabsTrigger value="doutorando">Doutorandos</TabsTrigger>
                  <TabsTrigger value="completed">Concluídos</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value='all'><StudentsPerSubfieldChart /></TabsContent>
                <TabsContent value='mestrando'><StudentsPerSubfieldChart filter='mestrando' /></TabsContent>
                <TabsContent value='doutorando'><StudentsPerSubfieldChart filter='doutorando' /></TabsContent>
                <TabsContent value='completed'><StudentsPerSubfieldChart filter='completed' /></TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </section>
      </main>
      <footer className="w-full border-t py-6 bg-neutral-900 text-white p-4">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-lg font-bold">Dashboard PGComp</h2>
            <p className="text-sm">Desenvolvido pela equipe 3 na matéria de IC0045. Mais informações <a
              href="https://github.com/pgcomp-dashboard/pgcomp-dashboard" target="_blank" className="underline">aqui</a>.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/pgcomp-dashboard/pgcomp-dashboard" target="_blank">
              <svg className="fill-white w-8" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title>
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span className="sr-only">Github</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
