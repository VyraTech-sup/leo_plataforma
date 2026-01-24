# 🪟 Setup no Windows - LMG Platform

## Pré-requisitos

### 1. Instalar Node.js
- Baixe em: https://nodejs.org/ (versão LTS 18+)
- Verifique: `node --version` e `npm --version`

### 2. Instalar PostgreSQL

**Opção A: Instalador Nativo**
1. Baixe: https://www.postgresql.org/download/windows/
2. Instale com senha: `postgres`
3. Adicione ao PATH do Windows

**Opção B: Docker Desktop (Recomendado)**
1. Instale Docker Desktop: https://www.docker.com/products/docker-desktop
2. Inicie o Docker Desktop
3. Execute:
```powershell
docker run --name lmg-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lmg_platform -p 5432:5432 -d postgres:15
```

### 3. Instalar Git
- Baixe: https://git-scm.com/download/win
- Use Git Bash ou PowerShell

## Setup Rápido

### PowerShell (Administrador)

```powershell
# 1. Clone o projeto
git clone <seu-repositorio>
cd plataformaleo

# 2. Instale dependências
npm install

# 3. Configure ambiente
Copy-Item .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# 4. Configure o banco
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Inicie o servidor
npm run dev
```

## Solução de Problemas

### PostgreSQL não conecta?

**Verifique se está rodando:**
```powershell
# Abra Services (services.msc)
# Procure por "postgresql-x64-15"
# Certifique-se que está "Running"
```

**Ou via Docker:**
```powershell
docker ps
# Se não estiver rodando:
docker start lmg-postgres
```

**Teste a conexão:**
```powershell
# Com psql instalado:
psql -U postgres -h localhost

# Dentro do psql:
\l                    # Lista databases
\c lmg_platform       # Conecta ao database
\dt                   # Lista tabelas
```

### Erro de porta 3000 ocupada?

```powershell
# Mate o processo
npx kill-port 3000

# Ou descubra qual processo:
netstat -ano | findstr :3000
taskkill /PID [numero_do_pid] /F
```

### Prisma não gera tipos?

```powershell
# Limpe e regenere
Remove-Item -Recurse -Force node_modules\.prisma
npm run db:generate
```

### Erro ao rodar migrations?

```powershell
# Resete o banco
npm run db:reset

# Se persistir, delete manualmente:
# 1. Abra pgAdmin ou psql
# 2. DROP DATABASE lmg_platform;
# 3. CREATE DATABASE lmg_platform;
# 4. npm run db:migrate
```

## Comandos PowerShell Úteis

```powershell
# Ver processos Node rodando
Get-Process node

# Matar todos processos Node
Get-Process node | Stop-Process -Force

# Ver portas em uso
netstat -ano

# Limpar cache do npm
npm cache clean --force

# Reinstalar tudo do zero
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Configuração do VS Code (Opcional)

Instale extensões recomendadas:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens

Configurações (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

## Atalhos Úteis

```powershell
# Setup completo (uma linha)
npm run setup

# Abrir Prisma Studio (GUI do banco)
npm run db:studio

# Ver logs detalhados
$env:DEBUG="prisma:*"; npm run dev
```

## Próximos Passos

1. ✅ Acesse http://localhost:3000
2. ✅ Faça login com user@lmg.com / user123
3. ✅ Explore o Dashboard
4. ✅ Teste criar uma conta nova
5. ✅ Configure o dark mode

**Boa sorte! 🚀**
