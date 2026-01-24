<<<<<<< HEAD

# leo_plataforma

# Plataforma de Gestão Financeira

# 💰 LMG Platform - Gestão Financeira e Patrimonial

Plataforma completa de gestão financeira pessoal com dashboard interativo, gráficos em tempo real e controle total sobre suas finanças.

![Stack](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791?style=flat-square&logo=postgresql)

## 🚀 Funcionalidades

### ✅ Implementado e Funcionando

- **🔐 Autenticação Completa**
  - Login e registro com validação
  - Sessões seguras com NextAuth
  - Páginas protegidas por middleware
  - Usuários admin e comum

- **📊 Dashboard Interativo**
  - Patrimônio líquido em tempo real
  - Gráfico de evolução patrimonial (6 meses)
  - Fluxo de caixa (receitas vs despesas)
  - Gastos por categoria (gráfico de pizza)
  - Insights automáticos baseados em regras
  - Cards de métricas principais

- **💳 Gestão de Contas**
  - CRUD completo de contas bancárias
  - Tipos: Corrente, Poupança, Investimento, Dinheiro
  - Saldo total consolidado
  - Interface moderna com cards

- **🎯 Metas Financeiras**
  - Acompanhamento de progresso
  - Barra de progresso visual
  - Priorização de metas

- **📈 Investimentos**
  - Tipos: Ações, Renda Fixa, Cripto, Fundos
  - Cálculo de rentabilidade
  - Valor atual vs investido

- **🌓 Dark/Light Mode**
  - Tema dinâmico
  - Cores otimizadas (Teal, Grafite, Branco)
  - Persiste preferência

### 🎨 Design

- **UI Premium Minimalista**
  - Inspiração: GitHub Copilot / Microsoft Monarch
  - Bento grid layout
  - Cards com glassmorphism
  - Sidebar fixa e topbar
  - Componentes Radix UI
  - Animações suaves

## 🛠️ Stack Tecnológica

| Categoria          | Tecnologia                        |
| ------------------ | --------------------------------- |
| **Framework**      | Next.js 14 (App Router)           |
| **Linguagem**      | TypeScript (strict mode, sem any) |
| **Estilização**    | TailwindCSS + shadcn/ui           |
| **Banco de Dados** | PostgreSQL + Prisma ORM           |
| **Autenticação**   | NextAuth (Credentials)            |
| **Validação**      | Zod                               |
| **Formulários**    | React Hook Form                   |
| **Gráficos**       | Recharts                          |
| **Tabelas**        | TanStack Table                    |
| **State**          | Zustand                           |
| **UI Primitives**  | Radix UI                          |

## 📦 Instalação e Setup

### Pré-requisitos

- Node.js 18.17+ e npm 9+
- PostgreSQL instalado e rodando
- Git

### 1. Clone o Repositório

```bash
git clone <seu-repositorio>
cd plataformaleo
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lmg_platform?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-super-secreto-mude-em-producao"

# App
NODE_ENV="development"
```

**⚠️ IMPORTANTE**: Ajuste `DATABASE_URL` com suas credenciais do PostgreSQL.

### 4. Configure o Banco de Dados

````bash
## Scripts principais para rodar localmente ou no Vercel

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção local (após build)
npm run start
````

> O deploy na Vercel funciona com as configurações padrão Next.js. Não use Vite, react-scripts ou --prefix client.
> npm run db:generate

# Cria as tabelas no banco

npm run db:migrate

# Popula com dados de exemplo

npm run db:seed

````

### 5. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
````

Acesse: **http://localhost:3000**

## 👤 Usuários de Teste

Após o seed, você pode fazer login com:

| Tipo        | Email         | Senha    |
| ----------- | ------------- | -------- |
| **Admin**   | admin@lmg.com | admin123 |
| **Usuário** | user@lmg.com  | user123  |

> O usuário comum já vem com:
>
> - 3 contas (Nubank, Poupança, Carteira)
> - 1 cartão de crédito
> - 42 transações (6 meses)
> - 3 metas financeiras
> - 3 investimentos

## 📁 Estrutura do Projeto

```
plataformaleo/
├── app/
│   ├── (dashboard)/          # Páginas autenticadas
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── accounts/         # Gestão de contas
│   │   ├── transactions/     # Transações
│   │   ├── cards/           # Cartões
│   │   ├── goals/           # Metas
│   │   ├── investments/     # Investimentos
│   │   └── layout.tsx       # Layout com sidebar
│   ├── api/
│   │   ├── auth/            # Autenticação
│   │   └── accounts/        # API de contas
│   ├── login/               # Página de login
│   ├── register/            # Cadastro
│   └── layout.tsx           # Root layout
├── components/
│   ├── dashboard/           # Componentes do dashboard
│   ├── ui/                  # UI components (shadcn)
│   ├── sidebar.tsx
│   └── topbar.tsx
├── lib/
│   ├── auth.ts              # Config NextAuth
│   ├── db.ts                # Prisma client
│   └── utils.ts             # Helpers
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   └── seed.ts              # Dados de exemplo
└── package.json
```

## 🎯 Próximos Passos (Expansões Futuras)

- [ ] CRUD completo de Transações com TanStack Table
- [ ] Upload e parser de CSV para importação em massa
- [ ] CRUD de Cartões com gestão de faturas
- [ ] CRUD de Metas com atualizações automáticas
- [ ] CRUD de Investimentos com gráficos de rentabilidade
- [ ] Relatórios avançados com filtros e exportação
- [ ] Página de configurações com preferências do usuário
- [ ] Notificações push para lembretes
- [ ] API de integração bancária (Open Banking)
- [ ] App mobile com React Native

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia o servidor em modo dev

# Build
npm run build            # Cria build de produção
npm run start            # Inicia servidor de produção

# Banco de Dados
npm run db:generate      # Gera Prisma Client
npm run db:push          # Push schema sem migrations
npm run db:migrate       # Cria e aplica migrations
npm run db:seed          # Popula com dados de exemplo
npm run db:studio        # Abre Prisma Studio (GUI)
npm run db:reset         # Reseta DB e aplica migrations

# Setup Completo (recomendado primeira vez)
npm run setup            # Instala, migra e seed em um comando
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Sessões JWT com NextAuth
- Middleware de proteção de rotas
- Validação server-side com Zod
- TypeScript strict mode
- SQL injection protection (Prisma)

## 🎨 Temas e Cores

### Paleta Principal

- **Primary (Teal)**: `hsl(174, 62%, 47%)`
- **Success (Green)**: `hsl(142, 71%, 45%)`
- **Destructive (Red)**: `hsl(0, 84%, 60%)`
- **Warning (Orange)**: `hsl(38, 92%, 50%)`

### Modos

- **Light Mode**: Fundo branco, texto escuro
- **Dark Mode**: Fundo grafite, texto claro

## 📊 Modelos de Dados

### User

- id, name, email, password, role

### Account

- id, name, type, institution, balance, currency

### Transaction

- id, type, category, amount, description, date

### Card

- id, name, brand, limit, closingDay, dueDay

### Goal

- id, name, targetAmount, currentAmount, deadline

### Investment

- id, name, type, amount, currentValue, profitability

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Autor

**LMG Platform Team**

---

**🌟 Desenvolvido com Next.js, TypeScript e ❤️**

> > > > > > > a83b8fa (Primeiro commit da plataforma)
