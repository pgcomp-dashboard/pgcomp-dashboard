# Backend

### Sobre

Responsável pelo serviço de recuperação dos dados (através de web scraping), além do transporte de dados entre o frontend e os bancos de dados (o principal e o in-memory), função essa que posteriormente alimenta o Dashboard.

### Estrutura da pasta

    .
    ├── _app_ : código de controle do sistema (modelos, definições de rota, controladores, etc)
    ├── _bootstrap_ : inicialização do Laravel
    ├── _config_ : configuração do sistema
    ├── _database_ : migrations com estrutura das tabelas do banco de dados
    ├── _lang_ : arquivos com tradução de texto para a aplicação
    ├── _public_ : diretório público para o qual o servidor aponta
    ├── _resources_ : arquivos importantes para a entrega das views
    ├── _routes_ : definições de rota do sistema
    ├── _storage_ : arquivos de caches, arquivos compilados e logs do sistema
    ├── _tests_ : testes unitários e integração do sistema
    ├── _.editorconfig_ : plugin que obriga o editor de código a seguir padrões macro essenciais de formatação pré-configurados pelo usuário
    ├── _.env.example_ : arquivo template onde para a definição de todas as variáveis de ambiente
    ├── _gitattributes_ : arquivo de configuração do Git
    ├── _.gitignore_ : arquivo de configuração do Git
    ├── _.styleci.yml_ : fornece verificações para seu repositório, garante que seu código seja sempre escrito de acordo com os padrões que você deseja
    ├── _README.md_ : documentação do funcionamento do backend
    ├── _artisan_ : arquivo necessário para executarmos no terminal todos os comandos do Artisan
    ├── _composer.json_ : arquivo de configuração do Composer (pode ser editado)
    ├── _composer.lock_ : arquivo de configuração do Composer (não pode ser editado)
    ├── _package.json_ : similar ao composer.json, porém seu uso é voltado para assets frontend
    ├── _phpunit.xml_ : arquivo de configuração do PHPUnit, ferramenta de testes de uso do Laravel
    └── _webpack.mix.js_ : neste arquivo é possível definir as configuração para compactação e unificação de arquivos css e js

### Iniciar projeto backend

```bash

# Iniciar projeto backend
./vendor/bin/sail artisan migrate:fresh #(Isso apagará todos os dados!)

# Gerar chave de autenticação
./vendor/bin/sail artisan key:generate

# Gerar principais dados
./vendor/bin/sail artisan db:seed  # Inserir dados mockados

# Gerar Admin User
./vendor/bin/sail artisan user:create-admin

# Atualmente o projeto não usa todas as classes de scrapping então para emular o uso real é sugerido rodar o comando a seguir
./vendor/bin/sail artisan scraping:run AreaScrapingCommand SigaaScrapingCommand LattesUrlScrapingCommand

# Caso deseje executar todos os comandos de scraping utilize apenas o comando a seguir, mas podem ocorrer erros na adição de veículos e na busca dos currículos lattes
./vendor/bin/sail artisan scraping:run

```

## Ambiente de Testes

### Sobre

O ambiente de testes utiliza um banco isolado (`testing`) para executar comandos automatizados e validar o sistema sem afetar os dados reais. Esse ambiente pode ser usado tanto para rodar a aplicação normalmente com dados mockados, quanto para executar a suíte de testes.

---

### Configurando ambiente de testes

1. Garanta que o `.env` ativo é o do ambiente de testes:

```bash
cp .env.testing .env
```

2. Dê permissão de execução para o script (apenas na primeira vez):

```bash
chmod +x ./tests/scripts/ensure-testing-db.sh
```

3. Execute o script que cria e mocka o banco `testing`:

```bash
./tests/scripts/ensure-testing-db.sh ./tests/mock/mock-db-testing.sql testing
```

Essa configuração so precisa ser feita uma vez.

---

### Rodar aplicação em modo de teste

Basta configurar o ambiente de testes, ter o `.env` de testes ativo e rodar:

```bash
./vendor/bin/sail up
```

---

### Rodar testes automatizados

Com a aplicação rodando em modo de teste execute a suíte de testes:

```bash
./vendor/bin/sail test
```

---

### Restaurar mock do banco de testes

Com o `.env` de testes ativo rode:

```bash
./tests/scripts/ensure-testing-db.sh ./tests/mock/mock-db-testing.sql testing
```

---

### Observações

- O script `ensure-testing-db.sh`:
    - Cria automaticamente o banco `testing` (caso não exista);
    - Popula o banco com os dados definidos no arquivo `mock-db-testing.sql`.

- A suite de testes do backend não "suja" o banco de dados. Logo não é necessário restaurar o banco nem antes nem depois.

- Os testes de frontend por serem e2e(End to End) precisam persistir dados em alguns casos, o que pode acabar sujando o banco de testes (Caso um teste falhe por exemplo), nesses casos basta restaurar o mock do banco de testes
