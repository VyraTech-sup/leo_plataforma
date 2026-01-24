# Guia de Deploy - LMG Platform

Este guia fornece instruções passo a passo para fazer o deploy da LMG Platform em produção usando Vercel e um banco de dados PostgreSQL (Neon ou Supabase).

## Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Banco de dados PostgreSQL (recomendado: [Neon](https://neon.tech) ou [Supabase](https://supabase.com))
- Node.js 18.17 ou superior instalado localmente
- Git configurado

## 1. Preparação do Banco de Dados

### Opção A: Neon (Recomendado)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto
3. Copie a `Connection String` (formato: `postgresql://user:password@host/database?sslmode=require`)

### Opção B: Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em `Settings` > `Database`
4. Copie a `Connection String` no modo `Transaction` (porta 5432)
5. Substitua `[YOUR-PASSWORD]` pela senha que você definiu

## 2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env.production` na raiz do projeto com as seguintes variáveis:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Optional: Logging
NODE_ENV="production"
```

### Gerando o NEXTAUTH_SECRET

Execute o seguinte comando para gerar uma chave secreta segura:

```bash
openssl rand -base64 32
```

Ou use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 3. Deploy no Vercel

### Via Dashboard (Recomendado para primeiro deploy)

1. **Conectar Repositório**
   - Acesse [vercel.com/new](https://vercel.com/new)
   - Importe seu repositório do GitHub/GitLab/Bitbucket
   - Selecione o projeto LMG Platform

2. **Configurar Projeto**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build` (já configurado no package.json)
   - **Output Directory**: `.next` (padrão do Next.js)
   - **Install Command**: `npm install` (padrão)

3. **Adicionar Variáveis de Ambiente**
   - Clique em "Environment Variables"
   - Adicione cada variável do `.env.production`:
     - `DATABASE_URL`
     - `NEXTAUTH_URL` (use `https://seu-projeto.vercel.app` - você verá o domínio após o deploy)
     - `NEXTAUTH_SECRET`

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde a conclusão (geralmente 2-5 minutos)

5. **Atualizar NEXTAUTH_URL**
   - Após o primeiro deploy, copie o domínio fornecido (ex: `https://lmg-platform.vercel.app`)
   - Vá em `Settings` > `Environment Variables`
   - Atualize `NEXTAUTH_URL` com o domínio correto
   - Faça um novo deploy (opcional: pode apenas aguardar o próximo deploy automático)

### Via CLI (Para deploys subsequentes)

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Deploy de preview (staging)
   vercel
   
   # Deploy de produção
   vercel --prod
   ```

## 4. Executar Migrações do Banco de Dados

As migrações são executadas automaticamente durante o build através do script `vercel-build` configurado no `package.json`.

Para executar migrações manualmente (se necessário):

```bash
# Localmente (staging/teste)
npx prisma migrate deploy

# Ou via script npm
npm run db:migrate:deploy
```

### Troubleshooting de Migrações

Se as migrações falharem durante o deploy:

1. **Verificar Connection String**
   - Certifique-se de que `DATABASE_URL` está correta
   - Teste localmente: `npx prisma db push`

2. **Executar Migrações Manualmente**
   - Configure `DATABASE_URL` localmente apontando para o banco de produção
   - Execute: `npx prisma migrate deploy`

3. **Reset do Banco (CUIDADO: Apaga todos os dados)**
   ```bash
   npx prisma migrate reset
   ```

## 5. Verificação Pós-Deploy

Após o deploy, verifique:

1. **Página Inicial**: `https://seu-dominio.vercel.app`
2. **Login**: `https://seu-dominio.vercel.app/login`
3. **Registro**: `https://seu-dominio.vercel.app/register`
4. **API Health Check**: Tente criar uma conta e fazer login

### Checklist de Verificação

- [ ] Página inicial carrega sem erros
- [ ] É possível criar uma nova conta
- [ ] Login funciona corretamente
- [ ] Dashboard carrega dados do banco
- [ ] É possível criar transações
- [ ] É possível criar contas
- [ ] É possível criar metas
- [ ] Exportação de dados funciona (CSV, Excel, PDF)
- [ ] Relatórios são gerados corretamente

## 6. Configuração de Domínio Customizado (Opcional)

1. Vá em `Settings` > `Domains` no Vercel
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído pelo Vercel
4. Atualize `NEXTAUTH_URL` para o novo domínio
5. Faça um novo deploy

## 7. Ambientes (Staging vs Production)

### Staging (Preview Deployments)

O Vercel cria automaticamente deploys de preview para cada branch/PR:

- Cada push em uma branch que não seja `main` cria um deploy de preview
- URL de preview: `https://lmg-platform-git-branch-name.vercel.app`
- Use variáveis de ambiente específicas para staging se necessário

### Production

- Deploys em `main` (ou branch configurada) vão para produção
- URL de produção: `https://seu-dominio.vercel.app`

### Configurar Variáveis por Ambiente

No Vercel Dashboard > Settings > Environment Variables:

- **Production**: Variáveis usadas apenas em produção
- **Preview**: Variáveis usadas em deploys de preview
- **Development**: Variáveis usadas localmente (raramente necessário)

## 8. Monitoramento e Logs

### Logs do Vercel

1. Acesse o projeto no Vercel Dashboard
2. Vá na aba "Deployments"
3. Clique em um deployment específico
4. Acesse "Functions" para ver logs de API routes

### Logs de Runtime

- Logs de build: Visíveis durante o deployment
- Logs de função: Acessíveis em `Functions` > selecione uma função > `Logs`

### Monitoramento de Erros (Opcional)

Configure ferramentas de monitoramento como:

- [Sentry](https://sentry.io) - Rastreamento de erros
- [LogRocket](https://logrocket.com) - Session replay
- [Vercel Analytics](https://vercel.com/analytics) - Análise de performance

## 9. Backup do Banco de Dados

### Neon

- Backups automáticos estão incluídos no plano gratuito
- Retenção: 7 dias (plano gratuito)
- Acesse `Backups` no dashboard do Neon para restaurar

### Supabase

- Backups diários automáticos (plano pago)
- Exporte manual:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```

## 10. Troubleshooting

### Build Falha

**Erro**: `Type error` ou `Module not found`

```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
npm run build
```

### Erro de Autenticação

**Erro**: `[next-auth][error][JWT_SESSION_ERROR]`

- Verifique se `NEXTAUTH_SECRET` está configurada
- Verifique se `NEXTAUTH_URL` corresponde ao domínio atual
- Limpe cookies do navegador

### Erro de Conexão com Banco

**Erro**: `Can't reach database server`

- Verifique se `DATABASE_URL` está correta
- Confirme que o IP do Vercel está na whitelist (Neon/Supabase geralmente permitem qualquer IP)
- Teste conexão localmente com a mesma connection string

### Erros 500 em API Routes

- Acesse `Functions` > `Logs` no Vercel Dashboard
- Procure por stack traces
- Verifique se todas as variáveis de ambiente necessárias estão configuradas

### Páginas não Carregam Dados

- Verifique se `NEXTAUTH_URL` está correto
- Confirme que o banco tem dados (ou crie dados de teste)
- Verifique logs de API no Vercel

## 11. Performance e Otimização

### Revalidação de Páginas

O projeto usa Server Components do Next.js 14, que são renderizados sob demanda. Para melhor performance:

```typescript
// Em pages que podem ser cached:
export const revalidate = 60 // Revalidar a cada 60 segundos
```

### Edge Functions (Opcional)

Para latência ultra-baixa em APIs:

```typescript
// app/api/example/route.ts
export const runtime = 'edge'
```

### Database Pooling

Para produção com muitas requisições, considere usar connection pooling:

- **Neon**: Suporta connection pooling nativo
- **Supabase**: Use Supavisor (connection pooler)
- **PgBouncer**: Solução independente

## 12. Segurança

### Checklist de Segurança

- [ ] `NEXTAUTH_SECRET` é forte e único (mínimo 32 caracteres)
- [ ] `DATABASE_URL` nunca é exposta no código cliente
- [ ] Variáveis de ambiente estão configuradas no Vercel (não commitadas no Git)
- [ ] HTTPS está habilitado (automático no Vercel)
- [ ] CORS está configurado corretamente (se aplicável)
- [ ] Rate limiting implementado em APIs sensíveis (recomendado)

### Recomendações Adicionais

1. **Habilitar Vercel Authentication** (opcional): Adicione senha para acessar previews
2. **CSP Headers**: Configure Content Security Policy headers
3. **SameSite Cookies**: Já configurado no NextAuth.js

## 13. CI/CD Automático

O Vercel já fornece CI/CD automático:

1. **Push para branch** → Vercel cria deploy de preview
2. **Merge para main** → Vercel cria deploy de produção
3. **Rollback**: Vá em Deployments e promova um deployment anterior

### GitHub Actions (Opcional)

Para testes antes do deploy, crie `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
```

## 14. Custos Estimados

### Neon (Database)

- **Free Tier**: 512 MB de storage, 1 branch
- **Pro**: $19/mês - 10 GB storage, branches ilimitados

### Vercel (Hosting)

- **Hobby** (Free): 100 GB bandwidth, Serverless Functions ilimitadas
- **Pro**: $20/mês - 1 TB bandwidth, Analytics, Teams

### Total Estimado

- **Desenvolvimento/Staging**: $0/mês (free tiers)
- **Produção Pequena**: $0-39/mês
- **Produção Média**: $39-100/mês

## 15. Contato e Suporte

- **Documentação Next.js**: https://nextjs.org/docs
- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Prisma**: https://prisma.io/docs
- **Documentação NextAuth**: https://next-auth.js.org

---

## Resumo Rápido

```bash
# 1. Criar banco de dados no Neon ou Supabase
# 2. Copiar DATABASE_URL

# 3. Configurar variáveis de ambiente no Vercel:
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# 4. Fazer deploy
git push origin main

# 5. Verificar deploy
# Acesse https://seu-dominio.vercel.app e teste funcionalidades

# 6. Monitorar
# Vercel Dashboard > Deployments > Functions > Logs
```

**Pronto! Sua LMG Platform está no ar! 🚀**
