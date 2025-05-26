export interface Production {
  professorId: number;
  titulo: string;
  autores: string;
  notaQualis: string;
  doi: string | null;
  publicacao: string;
}

const qualisOptions = ['A1', 'A2', 'B1', 'B2', 'B3'];

export const productionsByProfessor: Production[] = [
  { professorId: 1, titulo: 'Sistemas Inteligentes Aplicados', autores: 'Antonio Lopes et al.', notaQualis: 'A1', doi: '10.1000/antonio1', publicacao: 'Journal of AI - 2023' },
  { professorId: 1, titulo: 'Redes Neurais para Diagnóstico', autores: 'Antonio Lopes, Maria S.', notaQualis: 'B1', doi: '10.1000/antonio2', publicacao: 'Neural Computation - 2022' },
  { professorId: 1, titulo: 'Análise de Dados com Python', autores: 'Antonio Lopes', notaQualis: 'A2', doi: null, publicacao: 'Revista Computação - 2021' },

  { professorId: 2, titulo: 'Engenharia de Software Moderna', autores: 'Bruno Pereira et al.', notaQualis: 'A2', doi: '10.1000/bruno1', publicacao: 'Software Eng. Journal - 2023' },
  { professorId: 2, titulo: 'DevOps na Prática', autores: 'Bruno Pereira', notaQualis: 'B2', doi: null, publicacao: 'Revista de Sistemas - 2022' },
  { professorId: 2, titulo: 'Automação de Testes', autores: 'Bruno Pereira, Ana C.', notaQualis: 'B1', doi: '10.1000/bruno2', publicacao: 'Test Automation Conf. - 2021' },

  { professorId: 3, titulo: 'Computação em Nuvem', autores: 'Cassio Vinicius', notaQualis: 'A1', doi: '10.1000/cassio1', publicacao: 'Cloud Computing Conf. - 2022' },
  { professorId: 3, titulo: 'Contêineres e Kubernetes', autores: 'Cassio V., Pedro A.', notaQualis: 'B1', doi: null, publicacao: 'Sistemas Distribuídos - 2021' },
  { professorId: 3, titulo: 'Escalabilidade na Web', autores: 'Cassio Vinicius et al.', notaQualis: 'A2', doi: '10.1000/cassio2', publicacao: 'Web Systems Journal - 2023' },

  ...Array.from({ length: 33 }, (_, i) => {
    const id = i + 4;
    return [
      {
        professorId: id,
        titulo: `Pesquisa Avançada em Computação ${id}-A`,
        autores: `Professor ${id}, Coautor A`,
        notaQualis: qualisOptions[i % qualisOptions.length],
        doi: `10.1000/prof${id}-a`,
        publicacao: `Revista Científica ${2023 - (i % 3)}`
      },
      {
        professorId: id,
        titulo: `Estudo de Caso em Sistemas ${id}-B`,
        autores: `Professor ${id}, Coautor B`,
        notaQualis: qualisOptions[(i + 1) % qualisOptions.length],
        doi: null,
        publicacao: `Conferência Nacional ${2022 - (i % 2)}`
      },
      {
        professorId: id,
        titulo: `Algoritmos Otimizados ${id}-C`,
        autores: `Professor ${id}, Coautor C`,
        notaQualis: qualisOptions[(i + 2) % qualisOptions.length],
        doi: `10.1000/prof${id}-c`,
        publicacao: `Simpósio de Computação - ${2021 - (i % 2)}`
      },
    ];
  }).flat(),
];
