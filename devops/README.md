# DevOps


### Docker Conteiners
- PHP;
- MySQL;
- Redis; 
- Node; 
- Frontend-admin; 
- Nginx; 
- PHPMyAdmin;
- Mailhog.


### Iniciando o Docker

```bash
# 1 - Instalar o Docker
# Windows com WSL2
https://docs.docker.com/desktop/windows/wsl/
# Ubuntu
bash devops/docker-install-ubuntu.bash

# 2 - Configurar o Gitflow
sudo apt-get update
sudo apt-get install git-flow
git flow init -d -t v

# 3 - Subir os containers
docker-compose up -d

# 4 - Iniciar Feature
git flow feature start backend-fulano
# ou
git flow feature start frontend-fulano

# 5 - Finalizar Feature
git flow feature finish NOME_FEATURE
Ao finalizar uma feature o código é mergeado na branch develop e a branch atual é removida e deverá ser recriada.
```
