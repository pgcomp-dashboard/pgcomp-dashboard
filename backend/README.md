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
docker-compose exec php bash
composer install
php artisan migrate #(ou importar dump do banco de dados)

# SIGAA Web Scraping
docker-compose exec php bash
php artisan sigaa:scraping --help
php artisan sigaa:scraping ID_DO_PROGRAMA #(o ID do PGCOMP é 1820)
php artisan area-subarea
php artisan qualis:conference-scraping
php artisan qualis:journal-scraping

# Carregando arquivos xml do lattes
php artisan lattes:load-files

# Recriar base de dados
docker-compose exec php bash
php artisan migrate:fresh #(Isso apagará todos os dados!)

# Inserir dados falsos
php artisan db:seed #(Somente deve ser executado após de realizar o scraping)
```
