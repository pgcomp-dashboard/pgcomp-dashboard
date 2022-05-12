<h1 align="center">Dashboard de Produção Científica - UFBA</h1>



<p align="center">
  <a href="https://www.ufba.br/">
    <img alt="Feito por AUFBAProduz" src="https://img.shields.io/badge/feito%20por-AUFBAProduz-%237519C1">
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

[Acessar Documentação do Projeto](https://gitlab.com/aufbaproduz/aufbaproduz/-/wikis/home)

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

<a href="https://www.figma.com/file/9M697aFVIxaRZ3gWmGwrrc/new-dashboard-pgcomp?node-id=0%3A1">
  <img alt="Made by tgmarinho" src="https://img.shields.io/badge/Acessar%20Layout%20-Figma-%2304D361">
</a>

<h1>Inseris AQUI imagens sobre a aplicação.</h1>

### Frontend-admin

<p align="center">
  <img alt="Front-admin" title="#AUFBAProduz" src="" width="200px">

  <img alt="Front-admin" title="#AUFBAProduz" src="" width="200px">
</p>

### Frontend

<p align="center">
  <img alt="Front-dash" title="#AUFBAProduz" src="" width="200px">

  <img alt="Front-dash" title="#AUFBAProduz" src="" width="200px">
</p>

---

## 🏛 Arquitetura

### Diagrama da Aplicação Web

<img alt="Diagrama-app-web" title="#AUFBAProduz" src="https://gitlab.com/aufbaproduz/aufbaproduz/-/wikis/uploads/7078520d539cd701b7a642385173d7b2/modelo_aufbaproduz.drawio__10_.png" width="500px">

### Diagrama do Banco de Dados

<img alt="Diagrama-bd" title="#AUFBAProduz" src="https://gitlab.com/aufbaproduz/aufbaproduz/-/wikis/uploads/f96f0bc33ba3848a3a654916905c36ae/ufbafaz.png" width="500px">


---

## 🚀 Executando o projeto

Este projeto é divido em quatro partes:
1. Backend [(pasta backend)](https://gitlab.com/aufbaproduz/aufbaproduz/-/tree/develop/backend)
2. Frontend [(pasta frontend)](https://gitlab.com/aufbaproduz/aufbaproduz/-/tree/develop/frontend)
3. DevOps [(pasta devops)](https://gitlab.com/aufbaproduz/aufbaproduz/-/tree/develop/devops)
4. Frontend-admin [(pasta frontend-admin)](https://gitlab.com/aufbaproduz/aufbaproduz/-/tree/develop/frontend-admin)

💡Tanto o Frontend quanto o Mobile precisam que o Backend esteja sendo executado para funcionar.

### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
[Git](https://git-scm.com), [Docker](https://www.docker.com/). 

#### :cloud: Instalando Git e Docker

- Para instalar o Git siga este [passo a passo](https://git-scm.com/book/pt-br/v2/Come%C3%A7ando-Instalando-o-Git).
- Para instalar o Docker e Docker-compose, siga o passo a passo abaixo:
```bash
# Instalando
$ curl -fsSL https://get.docker.com/ | sh

# Adcionando o seu usuário ao grupo docker (retira a necessidade de utilização do sudo)
$ sudo usermod -aG docker <user>
# Substitua <user> por seu usuário

# Instalando docker-compose
# Buscando a última versão
$ VERSION=$(curl --silent https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*\d')
# Indicando local de instalação
$ DESTINATION=/usr/local/bin/docker-compose
# Instalando
$ sudo curl -L https://github.com/docker/compose/releases/download/${VERSION}/docker-compose-$(uname -s)-$(uname -m) -o $DESTINATION
# Distribuindo permissões de usuário
$ sudo chmod 755 $DESTINATION
```

#### :on: Clonado o repositório, subindo e startando containers

```bash
# Clonando repositório
$ git clone -b develop https://gitlab.com/aufbaproduz/aufbaproduz.git

```

```bash
# Subindo os containers do projeto
$ docker-compose up -d

# Startando os containers do projeto
$ docker-compose start

```

#### 🎲 Rodando o Backend (servidor)

```bash
$ docker-compose exec php bash
$ composer install
$ ! test -f .env && cp .env.example .env && php artisan key:generate
$ php artisan migrate
$ exit

# O servidor phpmyadmin será iniciado na porta:8080 - acesse http://localhost:8080
```


#### 🧭 Rodando a Aplicação Web

##### Página do Dashboard (Frontend)

```bash
$ docker-compose exec node bash
$ npm install
$ yarn webpack serve --port 3000
$ exit

# A aplicação será aberta na porta:3000 - acesse http://localhost:3000
```

##### Painel Administrativo (Frontend-admin)

```bash
$ docker-compose exec frontend-admin bash
$ npm install
$ npm start
$ exit

# A aplicação será aberta na porta:4000 - acesse http://localhost:4000
```

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

-   Protótipo:  **[Figma](https://www.figma.com/)**  →  **[Protótipo (Dashboard Publicações UFBA)](https://www.figma.com/file/9M697aFVIxaRZ3gWmGwrrc/new-dashboard-pgcomp?node-id=0%3A1)**

---

## 👨‍💻 Contribuidores
- **Gestor do Projeto:**
    - Diego Corrêa

- **Frontend:**
    - Guilherme do Valle
    - Matheus Aguiar
    - Iury Assunção

- **Backend:**
    - Mateus Carvalho
    - Litiano Moura

- **Documentação:**
    - Mayki Oliveira
    - Denis Boaventura

- **Teste:**
    - Ayran Campos
    - Matheus Novais
