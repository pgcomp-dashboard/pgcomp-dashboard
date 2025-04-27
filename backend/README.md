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
./vendor/bin/sail artisan migrate #(ou importar dump do banco de dados)

# Gerar chave de autenticação
./vendor/bin/sail artisan key:generate

# SIGAA Web Scraping
./vendor/bin/sail artisan scraping:area-subarea-scraping
./vendor/bin/sail artisan scraping:sigaa-scraping --help
./vendor/bin/sail artisan scraping:sigaa-scraping
./vendor/bin/sail artisan scraping:qualis-conference-scraping
./vendor/bin/sail artisan scraping:qualis-journal-scraping

# Carregando arquivos xml do lattes
./vendor/bin/sail artisan load:lattes-files-load

# Recriar base de dados
./vendor/bin/sail artisan migrate:fresh #(Isso apagará todos os dados!)

# Inserir dados falsos
./vendor/bin/sail artisan db:seed #(Somente deve ser executado após de realizar o scraping)
```
