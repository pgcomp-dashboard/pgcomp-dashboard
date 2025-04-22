<h1 align="center">Dashboard do PGCOMP</h1>



<p align="center">
  <a href="https://www.ufba.br/">
    <img alt="Feito por PGComp Dashboard Team" src="https://img.shields.io/badge/feito%20por-PGComp%20Dashboard%20Team-orange">
  </a>
</p>

<h4 align="center"> 
	🚧  Em produção 🚀 🚧
</h4>

<p align="center">
 <a href="#-sobre-o-projeto">Sobre</a> •
 <a href="#-funcionalidades">Funcionalidades</a> •
 <a href="#-layout">Layout</a> •
 <a href="#-arquitetura">Arquitetura</a> •
 <a href="#-executando-o-projeto">Executando o projeto</a> • 
 <a href="#-tecnologias">Tecnologias</a> • 
 <a href="#-contribuidores">Contribuidores</a> 
</p>


## 💻 Sobre o projeto  

Este projeto foi realizado por meio da disciplina Tópicos em Sistemas de Informação e WEB I, ministrada pelo professor Frederico Araújo Durão. O mesmo visa disponibilizar através de um Dashboard público, visualizações gráficas acerca das publicações realizadas pelo Programa de Pós-Graduação em Ciência da Computação (PGCOMP).

[Acessar Documentação do Projeto](https://github.com/pgcomp-dashboard/pgcomp-dashboard/wiki)

---

## ⚙ Funcionalidades
No Dashboard constam informações como:  
- Histórico anual de publicações do PGCOMP;
- Quantidades de publicações segmentadas por Qualis;
- Quantidade de produções para dicentes de Mestrado e Doutorado;
- Número de discentes por área;
- Número de discentes por subárea;
- Quantidade de alunos vinculados a cada Docente.


Esses gráficos podem ser filtrados por:
- Intervalo de ano de publicação;
- Publicado por (Docente, Mestrando ou Doutorado);
- Tipo de publicação (Conferência ou Periódico).


Os dados são adquiridos através de Web Scraping dentro dos seguinte sites, atualização feita a cada 3 meses:
- [PGCOMP](https://pgcomp.ufba.br/)
- [SIGAA](https://sigaa.ufba.br/sigaa/public/home.jsf)


Além disso, existe o frontend-admin, no qual um usuário do tipo Admin, após logar-se, pode Visualiar, Criar, Remover e/ou Editar de forma manual:
- Curso;
- Docente;
- Discente;
- Produção;
- Pontuação do estrato QUALIS;
- Discentes e docentes podem se cadastrar no sistema para alterar seus dados.

---

## 🎨 Layout

O layout da aplicação está disponível no Figma:

<a href="https://www.figma.com/design/Mx3VAlEXphCa124t9gl3Qb/dashboard-pgcomp-2025">
  <img alt="Special thanks to tgmarinho" src="https://img.shields.io/badge/Acessar%20Layout%20-Figma-%2304D361">
</a>

### Frontend-admin

<p align="center">
  <img alt="Front-admin" title="#AUFBAProduz" src="https://i.imgur.com/lg1DOxE.png" width="400px">
  <img alt="Front-admin" title="#AUFBAProduz" src="https://i.imgur.com/fEXAEFO.png" width="400px">
  <img alt="Front-admin" title="#AUFBAProduz" src="https://i.imgur.com/gqsQFG9.png" width="400px">
  <img alt="Front-admin" title="#AUFBAProduz" src="https://i.imgur.com/Y1eFejQ.png" width="400px">
  <img alt="Front-admin" title="#AUFBAProduz" src="https://i.imgur.com/0FyV6VZ.png" width="400px">
</p>

### Frontend (Dashboard)

<p align="center">
  <img alt="Front-dash" title="#AUFBAProduz" src="https://i.imgur.com/iuNYhJC.png" width="400px">
  <img alt="Front-dash" title="#AUFBAProduz" src="https://i.imgur.com/vE7JR8T.png" width="400px">
  <img alt="Front-dash" title="#AUFBAProduz" src="https://i.imgur.com/iOdt54H.png" width="400px">
  <img alt="Front-dash" title="#AUFBAProduz" src="https://i.imgur.com/viwTjMD.png" width="400px">
</p>

---

## 🏛 Arquitetura

### Diagrama da Aplicação Web

<img alt="Diagrama-app-web" title="#AUFBAProduz" src="https://gitlab.com/aufbaproduz/aufbaproduz/-/wikis/uploads/7078520d539cd701b7a642385173d7b2/modelo_aufbaproduz.drawio__10_.png" width="500px">

### Diagrama do Banco de Dados

<img alt="Diagrama-bd" title="#AUFBAProduz" src="https://gitlab.com/aufbaproduz/aufbaproduz/-/wikis/uploads/f96f0bc33ba3848a3a654916905c36ae/ufbafaz.png" width="500px">


---

## 🚀 Executando o projeto

### Ambiente de desenvolvimento

Aqui estão as instruções para executar os componentes desse projeto em ambiente de *desenvolvimento*.

#### Backend

Para executar o Backend em ambiente de desenvolvimento, utilizamos o [Laravel Sail](https://laravel.com/docs/12.x/sail).
*Portanto, é necessário o [Docker](https://www.docker.com/) ou ferramenta equivalente compatível com o Laravel Sail!*

Essa ferramenta irá rodar o backend junto com *todas dependências necessárias* (e.g. MySQL, Redis).

Após clonar o repositório, execute esse comando na pasta `backend/`:
```sh
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v $(pwd):/opt \
    -w /opt \
    laravelsail/php84-composer:latest \
    composer install --ignore-platform-reqs
```

> **Nota**: Nessa fase, é normal acontecer um erro relacionado ao Redis após o script `postAutoloadDump`. Isso acontece porque a imagem usada no comando acima contém apenas as dependências mínimas para rodar o composer. Após o bootstrap, a imagem que será usada terá todas dependências necessárias para o resto do projeto.

Copie o arquivo `.env.example` para `.env`:
```sh
! test -f .env && cp .env.example .env
```

Após isso, sempre que quiser rodar o backend junto com as dependências, só precisará executar:
```sh
./vendor/bin/sail up -d
```

Tudo será executado dentro de Containers. Dessa forma, para rodar comandos que precisem do PHP/Composer, será necessário rodar eles dentro do container.
O script do Laravel Sail facilita isso.

Por exemplo, para rodar um comando da aplicação, podemos fazer:
```sh
./vendor/bin/sail artisan scraping:example
```

Para executar um SHELL dentro do container, use:
```sh
./vendor/bin/sail shell
```

#### Frontend

Para instalar o ambiente frontend, é necessário rodar o seguinte comando dentro da pasta `frontend/`:
```sh
npm install
# or
yarn install
```

Para rodar o ambiente de desenvolvimento somente é necessário executar o seguinte comando:
```sh
npm run dev
# or
yarn dev
```

#### Admin
_TODO_

### Ambiente de produção
_TODO_

---

## 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

#### **Backend**

-   **[MySQL 8](https://dev.mysql.com/downloads/installer/)**
-   **[Redis](https://redis.io/docs/getting-started/)**
-   **[Laravel 9](https://laravel.com/docs/9.x/installation)**


#### **Frontend**

-   **[Node 16.14 - LTS](https://nodejs.org/pt-br/download/)**
-   **[NPM 8](https://docs.npmjs.com/cli/v8/commands/npm-install)**
-   **[React](https://pt-br.reactjs.org/)**
-   **[Bootstrap 5](https://getbootstrap.com/docs/5.0/getting-started/introduction/)**
-   **[Chart.js](https://www.chartjs.org/docs/latest/)**


#### **DevOps**

-   **[Ubuntu 20.04 - LTS](https://releases.ubuntu.com/20.04/)**
-   **[Docker 20.10](https://www.docker.com/blog/introducing-docker-engine-20-10/)**
-   **[Portainer](https://www.portainer.io/)**
-   **[Git](https://git-scm.com/downloads)**
-   **[Ngnix](https://www.nginx.com/)**
-   **[JSON](https://www.json.org/json-en.html)**


#### **Utilitários**

-   Protótipo:  **[Figma](https://www.figma.com/)**  →  **[Protótipo (Dashboard Publicações UFBA)](https://www.figma.com/design/Mx3VAlEXphCa124t9gl3Qb/dashboard-pgcomp-2025)**

---

## 👨‍💻 Contribuidores

Esse projeto é baseado em um projeto original diponível [AQUI](https://gitlab.com/aufbaproduz/aufbaproduz).

### Autores atuais
- Felipe Paixão
- Lucas Lopes
- Lucas França
- Harrison Borges
- Paulo Sérgio
- Rodrigo dos Santos
- Matheus Nascimento
- Tatiana Dias
- Augusto Perin
- Gustavo Coelho

### Autores do projeto original
- Diego Corrêa
- Guilherme do Valle
- Matheus Aguiar
- Iury Assunção
- Mateus Carvalho
- Litiano Moura
- Mayki Oliveira
- Denis Boaventura
- Ayran Campos
- Matheus Novais
