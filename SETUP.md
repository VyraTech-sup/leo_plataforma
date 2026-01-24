# 🚀 Guia Rápido de Instalação - LMG Platform

## Setup em 5 Minutos

### 1️⃣ Pré-requisitos
- ✅ Node.js 18.17+ instalado
- ✅ PostgreSQL rodando (pode ser Docker)
- ✅ Git instalado

### 2️⃣ Clone e Instale

```bash
# Clone
git clone <seu-repo>
cd plataformaleo

# Instale dependências
npm install
```

### 3️⃣ Configure o Banco

**Opção A: PostgreSQL Local**
```bash
# Crie o database
createdb lmg_platform

# Ou via psql
psql -U postgres
CREATE DATABASE lmg_platform;
\q
```

**Opção B: Docker (Recomendado)**
```bash
docker run --name lmg-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lmg_platform \
  -p 5432:5432 \
  -d postgres:15
```

### 4️⃣ Configure .env

```bash
# Copie o exemplo
cp .env.example .env

# Edite com suas credenciais
# Mínimo necessário:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lmg_platform"
NEXTAUTH_SECRET="mude-isso-para-algo-super-secreto-min-32-caracteres"
```

### 5️⃣ Rode o Setup Completo

```bash
# Um comando faz tudo:
npm run setup

# Ou passo a passo:
npm run db:generate  # Gera Prisma Client
npm run db:migrate   # Cria tabelas
npm run db:seed      # Popula dados
```

### 6️⃣ Inicie o App

```bash
npm run dev
```

**✨ Pronto!** Acesse: http://localhost:3000

## 🔑 Login

```
Admin:
  Email: admin@lmg.com
  Senha: admin123

Usuário:
  Email: user@lmg.com
  Senha: user123
```

## 🐛 Troubleshooting

### Erro de conexão com o banco?
```bash
# Verifique se o PostgreSQL está rodando
# No Windows:
services.msc  # Procure por PostgreSQL

# Teste conexão:
psql -U postgres -h localhost
```

### Prisma não gera os tipos?
```bash
npm run db:generate
```

### Erro ao rodar migrations?
```bash
# Resete o banco e comece do zero
npm run db:reset
```

### Porta 3000 já em uso?
```bash
# Mude no package.json ou mate o processo
npx kill-port 3000
```

## 📚 Comandos Úteis

```bash
# Abrir interface visual do banco
npm run db:studio

# Ver logs do Prisma
DEBUG=prisma:* npm run dev

# Resetar tudo
npm run db:reset && npm run db:seed
```

## 🎉 Próximos Passos

1. Explore o Dashboard
2. Crie uma conta nova
3. Adicione transações
4. Configure metas
5. Customize o tema

**Divirta-se! 🚀**
