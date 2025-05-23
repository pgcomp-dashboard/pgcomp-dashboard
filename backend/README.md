# Backend

### Sobre 

Responsável pelo serviço de recuperação dos dados (através de web scraping), além do transporte de dados entre o frontend e os bancos de dados (o principal e o in-memory), função essa que posteriormente alimenta o Dashboard.

### Estrutura da pasta
*backend*  
├── *app* : código de controle do sistema (modelos, definições de rota, controladores, etc)  
├── *bootstrap* : inicialização do Laravel  
├── *config* : configuração do sistema  
├── *database* : migrations com estrutura das tabelas do banco de dados  
├── *lang* : arquivos com tradução de texto para a aplicação  
├── *public* : diretório público para o qual o servidor aponta  
├── *resources* : arquivos importantes para a entrega das views  
├── *routes* : definições de rota do sistema  
├── *storage* : arquivos de caches, arquivos compilados e logs do sistema  
├── *tests* : testes unitários e integração do sistema  
├── *.editorconfig* : plugin que obriga o editor de código a seguir padrões macro essenciais de formatação pré-configurados pelo usuário  
├── *.env.example* : arquivo template onde para a definição de todas as variáveis de ambiente  
├── *gitattributes* : arquivo de configuração do Git  
├── *.gitignore* : arquivo de configuração do Git  
├── *.styleci.yml* : fornece verificações para seu repositório, garante que seu código seja sempre escrito de acordo com os padrões que você deseja  
├── *README.md* : documentação do funcionamento do backend  
├── *artisan* : arquivo necessário para executarmos no terminal todos os comandos do Artisan  
├── *composer.json* : arquivo de configuração do Composer (pode ser editado)  
├── *composer.lock* : arquivo de configuração do Composer (não pode ser editado)  
├── *package.json* : similar ao composer.json, porém seu uso é voltado para assets frontend  
├── *phpunit.xml* : arquivo de configuração do PHPUnit, ferramenta de testes de uso do Laravel  
└──  *webpack.mix.js* : neste arquivo é possível definir as configuração para compactação e unificação de arquivos css e js



### Iniciar projeto backend
```bash

# Iniciar projeto backend
./vendor/bin/sail artisan migrate:fresh #(Isso apagará todos os dados!)

# Gerar chave de autenticação
./vendor/bin/sail artisan key:generate

# Gerar principais dados
./vendor/bin/sail artisan db:seed  # Inserir dados mockados

# Executar todos os comandos de scraping
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
````

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

Basta configurar o ambiente de testes, ter o  `.env` de testes ativo e rodar:

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

* O script `ensure-testing-db.sh`:

  * Cria automaticamente o banco `testing` (caso não exista);
  * Popula o banco com os dados definidos no arquivo `mock-db-testing.sql`.

* A suite de testes do backend não "suja" o banco de dados. Logo não é necessário restaurar o banco nem antes nem depois.

* Os testes de frontend por serem e2e(End to End) precisam persistir dados em alguns casos, o que pode acabar sujando o banco de testes (Caso um teste falhe por exemplo), nesses casos basta restaurar o mock do banco de testes



