# UFBAProduz

### Iniciar projeto backend
`docker-compose exec php bash`\
`composer install`\
`! test -f .env && cp .env.example .env && php artisan key:generate`\
`php artisan migrate` ou importar dump do banco de dados.
