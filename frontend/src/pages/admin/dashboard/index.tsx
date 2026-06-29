import { GraduationCap, Menu, RotateCw, Users } from 'lucide-react';
import { NavLink } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import StudentsPerAdvisorChart from '@/features/dashboard/components/charts/StudentsPerAdvisor';
// import StudentsPerFieldChart from '@/components/charts/StudentsPerFieldChart.tsx';
import ProductionPerQualisChart from '@/features/dashboard/components/charts/ProductionPerQualis';
// import QualityMetricsChart from '@/components/quality-metrics-chart';
// import StudentsByFacultyChart from '@/components/students-by-faculty-chart';
// import StudentsByAreaChart from '@/components/students-by-area-chart';
// import StudentsBySubareaChart from '@/components/students-by-subarea-chart';

import logoImage from '@/assets/logo.png';
import DefensesPerYearChart from '@/features/dashboard/components/charts/DefensesPerYear';
import EnrollmentsPerYearChart from '@/features/dashboard/components/charts/EnrollmentsPerYear';
import ProductionsPerYearChart from '@/features/dashboard/components/charts/ProductionsPerYear';
import ProfessorProductionPerYear from '@/features/dashboard/components/charts/ProfessorProductionPerYear';
import StudentCountCard from '@/features/dashboard/components/StudentCountCard';
//import { scrapingService } from '@/services/modules/scraping.service';
//import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  //const [ lastExecution, setLastExecution ] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // 👇 Novos estados adicionados
  const [ productionType, setProductionType ] = useState<'journal' | 'conference' | undefined>(undefined);
  const [ isRefetchingProductions, setIsRefetchingProductions ] = useState(false);
  
  const [isRefetchingQualis, setIsRefetchingQualis] = useState(false);
  const [isRefetchingDefenses, setIsRefetchingDefenses] = useState(false);
  const [ isRefetchingEnrollments, setIsRefetchingEnrollments ] = useState(false);

  async function refetchQuery(key: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    await queryClient.invalidateQueries({ queryKey: [key] });
    setLoading(false);
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /*
  async function fetchLastExecution() {
    try {
      const response = await scrapingService.getScrapingExecutions();
      if (response.length > 0 && response[0].executed_at) {
        setLastExecution(response[0].executed_at);
      }
    } catch (error) {
      console.error('Erro ao buscar última execução', error);
    }
  }

  useEffect(() => {
    fetchLastExecution();
  }, []);*/

  return (
    <div className="w-full flex min-h-screen flex-col items-center">
      {/* Header - Mobile First */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex flex-row gap-6 justify-center container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Mobile Menu + Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden shrink-0">
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Mostrar menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-87.5">
                  <nav className="flex flex-col gap-6 py-6">
                    <div className="flex flex-col gap-4">
                      {/*
                      <NavLink
                        to="#publications"
                        onClick={() => scrollToSection('publications')}
                        className="text-sm font-medium transition-colors hover:text-primary"
                      >
                        Produções científicas
                      </NavLink>
                      */}

                      <NavLink
                        to="#quality"
                        onClick={() => scrollToSection('quality')}
                        className="text-sm sm:text-base font-medium transition-colors hover:text-primary py-2"
                      >
                        Produções por qualis
                      </NavLink>
                      <NavLink
                        to="#faculty"
                        onClick={() => scrollToSection('faculty')}
                        className="text-sm sm:text-base font-medium transition-colors hover:text-primary py-2"
                      >
                        Alunos por docente
                      </NavLink>
                      <NavLink
                        to="#area"
                        onClick={() => scrollToSection('area')}
                        className="text-sm sm:text-base font-medium transition-colors hover:text-primary py-2"
                      >
                        Alunos por área
                      </NavLink>
                      <NavLink
                        to="#defenses"
                        onClick={() => scrollToSection('defenses')}
                        className="text-sm sm:text-base font-medium transition-colors hover:text-primary py-2"
                      >
                        Defesas por ano
                      </NavLink>
                      <NavLink
                        to="#enrollments"
                        onClick={() => scrollToSection('enrollments')}
                        className="text-sm sm:text-base font-medium transition-colors hover:text-primary py-2"
                      >
                        Matrículas por ano
                      </NavLink>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <NavLink to={'/'} rel="noopener noreferrer">
                        <p>Credenciamento</p>
                      </NavLink>
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
              <NavLink to="/" className="flex items-center" onClick={() => scrollToSection('student_count')}>
                <img className="h-8 w-auto sm:h-10 md:h-12" src={logoImage} alt="Dashboard PGComp" />
              </NavLink>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-6 pb-3 pt-2">
            <NavLink
              to="#publications"
              onClick={() => scrollToSection('publications')}
              className="text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
            >
              Produções científicas
            </NavLink>
            <NavLink
              to="#quality"
              onClick={() => scrollToSection('quality')}
              className="text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
            >
              Produções por qualis
            </NavLink>
            <NavLink
              to="#faculty"
              onClick={() => scrollToSection('faculty')}
              className="text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
            >
              Alunos por docente
            </NavLink>
            <NavLink
              to="#area"
              onClick={() => scrollToSection('area')}
              className="text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
            >
              Alunos por área
            </NavLink>
            <NavLink
              to="#defenses"
              onClick={() => scrollToSection('defenses')}
              className="text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
            >
              Defesas por ano
            </NavLink>
            <NavLink
              to="#enrollments"
              onClick={() => scrollToSection('enrollments')}
              className="text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
            >
              Matrículas por ano
            </NavLink>
            <Button asChild size="sm" className="ml-2">
              <NavLink to={'/'} rel="noopener noreferrer">
                <p>Credenciamento</p>
              </NavLink>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 lg:space-y-12 max-w-7xl mx-auto">

        <section id="student_count" className="space-y-2">

          {/* Última execução do script */}
          {/*<div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium px-1">
            Última execução do script: {lastExecution ? new Date(lastExecution).toLocaleString('pt-BR') : 'Carregando...'}
          </div> */}

          {/* Container dos grupos - Mobile First: Stack verticalmente, Desktop: lado a lado */}
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Grupo Mestrado */}
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <span className="text-green-800 dark:text-green-300 font-bold text-lg">Alunos do Mestrado</span>
              </div>
              <div className="border-t border-green-200 dark:border-green-700" />
              <div className="flex gap-4">
                <div className="flex-1 text-center space-y-1">
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400">Atuais</div>
                  <StudentCountCard studentFilter="Mestrado - Alunos atuais" className="text-green-600" />
                </div>
                <div className="w-px bg-green-200 dark:bg-green-700" />
                <div className="flex-1 text-center space-y-1">
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400">Concluídos</div>
                  <StudentCountCard studentFilter="Mestrado - Alunos concluídos" className="text-green-600" />
                </div>
              </div>
            </div>

            {/* Grupo Doutorado */}
            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="text-blue-800 dark:text-blue-300 font-bold text-lg">Alunos do Doutorado</span>
              </div>
              <div className="border-t border-blue-200 dark:border-blue-700" />
              <div className="flex gap-4">
                <div className="flex-1 text-center space-y-1">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">Atuais</div>
                  <StudentCountCard studentFilter="Doutorado - Alunos atuais" className="text-blue-600" />
                </div>
                <div className="w-px bg-blue-200 dark:bg-blue-700" />
                <div className="flex-1 text-center space-y-1">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">Concluídos</div>
                  <StudentCountCard studentFilter="Doutorado - Alunos concluídos" className="text-blue-600" />
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="publications" className="space-y-4 sm:space-y-6 min-h-100 sm:min-h-125">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Produções científicas por ano</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={productionType ?? ''}
                  onChange={e => setProductionType(e.target.value === '' ? undefined : e.target.value as 'journal' | 'conference')}
                  className="border rounded px-2 py-1 text-sm bg-background h-8"
                >
                  <option value="">Todos</option>
                  <option value="journal">Periódicos</option>
                  <option value="conference">Conferências</option>
                </select>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => refetchQuery('totalProductionsPerYear', setIsRefetchingProductions)} disabled={isRefetchingProductions} title="Atualizar">
                  <RotateCw className={cn('h-4 w-4', isRefetchingProductions && 'animate-spin')} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <ProductionsPerYearChart publisherType={productionType} />
            </CardContent>
          </Card>
        </section>

        <section id="quality" className="space-y-4 sm:space-y-6 min-h-100 sm:min-h-125">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base sm:text-lg lg:text-xl">Produções por qualis</CardTitle>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => refetchQuery('productionPerQualis', setIsRefetchingQualis)} disabled={isRefetchingQualis} title="Atualizar">
                  <RotateCw className={cn('h-4 w-4', isRefetchingQualis && 'animate-spin')} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <ProductionPerQualisChart />
            </CardContent>
          </Card>
        </section>

        <section id="professorProduction" className="space-y-4 sm:space-y-6 min-h-100 sm:min-h-125">
          <ProfessorProductionPerYear />
        </section>

        <section id="faculty" className="space-y-4 sm:space-y-6 min-h-100 sm:min-h-125">
          <StudentsPerAdvisorChart />
        </section>

        {/* <section id="area" className="space-y-10 min-h-[500px]">
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
        </section> */}

        <section id="defenses" className="space-y-4 sm:space-y-6 min-h-100 sm:min-h-125">
          <Card>
            <Tabs defaultValue="all">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <CardTitle className="text-base sm:text-lg lg:text-xl">Defesas por ano</CardTitle>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => refetchQuery('defenses_per_year', setIsRefetchingDefenses)} disabled={isRefetchingDefenses} title="Atualizar">
                    <RotateCw className={cn('h-4 w-4', isRefetchingDefenses && 'animate-spin')} />
                  </Button>

                  <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">Todas</TabsTrigger>
                    <TabsTrigger value="mestrado" className="text-xs sm:text-sm">Mestrado</TabsTrigger>
                    <TabsTrigger value="doutorado" className="text-xs sm:text-sm">Doutorado</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-6">
                <TabsContent value='all'><DefensesPerYearChart filter='todos' /></TabsContent>
                <TabsContent value='mestrado'><DefensesPerYearChart filter='mestrado' /></TabsContent>
                <TabsContent value='doutorado'><DefensesPerYearChart filter='doutorado' /></TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </section>

        <section id="enrollments" className="space-y-4 sm:space-y-6 min-h-100 sm:min-h-125">
          <Card>
            <Tabs defaultValue="all">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <CardTitle className="text-base sm:text-lg lg:text-xl">Matrículas por ano</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => refetchQuery('enrollments_per_year', setIsRefetchingEnrollments)} disabled={isRefetchingEnrollments} title="Atualizar">
                    <RotateCw className={cn('h-4 w-4', isRefetchingEnrollments && 'animate-spin')} />
                  </Button>
                  <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">Todas</TabsTrigger>
                    <TabsTrigger value="mestrado" className="text-xs sm:text-sm">Mestrado</TabsTrigger>
                    <TabsTrigger value="doutorado" className="text-xs sm:text-sm">Doutorado</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-6">
                <TabsContent value='all'><EnrollmentsPerYearChart filter='todos' /></TabsContent>
                <TabsContent value='mestrado'><EnrollmentsPerYearChart filter='mestrado' /></TabsContent>
                <TabsContent value='doutorado'><EnrollmentsPerYearChart filter='doutorado' /></TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </section>

      </main>

      {/* Footer - Mobile First 
      <footer className="w-full border-t py-6 sm:py-8 lg:py-10 bg-neutral-900 dark:bg-neutral-950 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-base sm:text-lg font-bold">Dashboard PGComp</h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Desenvolvido pela equipe 3 na matéria de IC0045.
                <a href="https://github.com/pgcomp-dashboard/pgcomp-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white ml-1 inline-block">
                  Mais informações aqui
                </a>.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/pgcomp-dashboard/pgcomp-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="GitHub Repository">
                <svg className="fill-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <title>GitHub</title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}