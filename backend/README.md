# UFBAProduz

### Iniciar projeto backend
`docker-compose exec php bash`\
`composer install`\
`php artisan migrate` ou importar dump do banco de dados.

### SIGAA Web Scraping
`docker-compose exec php bash`\
`php artisan sigaa:scraping --help`\
`php artisan sigaa:scraping ID_DO_PROGRAMA` o ID do PGCOMP é 1820\

### Recriar base de dados
`docker-compose exec php bash`\
`php artisan migrate:fresh` **Isso apagará todos os dados!**
