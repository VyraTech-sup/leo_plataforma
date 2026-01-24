# 🔒 GUIA DE SEGURANÇA PARA PRODUÇÃO

**Prioridade:** Alta  
**Tempo de leitura:** 5 minutos

---

## ⚠️ SEGURANÇA CRÍTICA - FAZ AGORA!

### 1️⃣ Gerar Novo NEXTAUTH_SECRET

O `NEXTAUTH_SECRET` deve ser uma string aleatória **diferente** para cada ambiente.

**Para Desenvolvimento:** Use qualquer string (já tem no `.env`)

**Para Produção:** Use este comando para gerar:

```bash
# Opção 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opção 2: OpenSSL (se tiver instalado)
openssl rand -base64 32
```

Copie o resultado e **use APENAS em produção no Vercel**.

**❌ NUNCA USE A MESMA SECRET DE DESENVOLVIMENTO**

---

### 2️⃣ DATABASE_URL - Banco de Produção Isolado

**✅ Correto:**

- Banco de desenvolvimento: `postgresql://...@ep-blue-tree-**dev**.../...`
- Banco de produção: `postgresql://...@ep-blue-tree-**prod**.../...` ← **DIFERENTE**

**❌ Errado:**

- Usar o mesmo banco para dev e prod
- Expor credenciais do banco no GitHub

**O que você tem agora:**

- ✅ Um banco de desenvolvimento em `ep-blue-tree-acmmyt96-pooler`
- ❌ Ainda vai criar um novo para produção

**O que fazer:**

1. No Neon, crie um **novo projeto** para produção
2. Use a nova connection string em Vercel
3. Seu banco de desenvolvimento não deve sofrer impacto

---

### 3️⃣ Variáveis de Ambiente - Checklist de Segurança

| Variável               | Deve ser única por ambiente? | Risco                      |
| ---------------------- | ---------------------------- | -------------------------- |
| `DATABASE_URL`         | ✅ SIM                       | Exposição de dados         |
| `NEXTAUTH_SECRET`      | ✅ SIM                       | Falsificação de tokens JWT |
| `NEXTAUTH_URL`         | ✅ SIM                       | Redirect attacks           |
| `PLUGGY_CLIENT_ID`     | ❌ Pode ser igual            | Acesso à API Pluggy        |
| `PLUGGY_CLIENT_SECRET` | ❌ Pode ser igual            | Acesso à API Pluggy        |

---

### 4️⃣ Proteção de Rotas

Sua aplicação já protege:

- ✅ `/dashboard/*` - Requer autenticação
- ✅ `/accounts/*` - Requer autenticação
- ✅ `/transactions/*` - Requer autenticação
- ✅ Todas as rotas protegidas pelo middleware

**O middleware (middleware.ts) valida todo acesso.**

---

### 5️⃣ Senhas Hasheadas

**Status:** ✅ Implementado com bcrypt

```typescript
// Seu código já faz isso:
const isPasswordValid = await bcrypt.compare(
  credentials.password, // Entrada do usuário
  user.password // Hash armazenado no banco
)
```

**Significa:** Mesmo que alguém invada o banco, não consegue ver as senhas.

---

### 6️⃣ SSL/TLS - Conexão Criptografada

**Status:** ✅ Automático no Vercel

- Vercel fornece HTTPS automático para seu domínio
- Neon requer `sslmode=require` (já está na sua connection string)
- Seu banco está protegido em trânsito

---

## ⚠️ SEGURANÇA RECOMENDADA

### 1️⃣ Dois Fatores de Autenticação (2FA) - Para Você

1. Vercel: https://vercel.com/account/settings
   - Aba "Security"
   - Enable "2-Factor Authentication"

2. Neon: https://console.neon.tech/account/security
   - Aba "Security"
   - Enable "Two-factor authentication"

3. GitHub: https://github.com/settings/security
   - "Enable two-factor authentication"

**Tempo:** 10 minutos  
**Importância:** 🔴 ALTA - Alguém com acesso à sua conta pode destruir tudo

---

### 2️⃣ Rotação de Secrets Periodicamente

Recomendação: A cada 3-6 meses

1. Gere um novo `NEXTAUTH_SECRET`
2. Atualize em Vercel Environment Variables
3. Faça novo deploy

---

### 3️⃣ Logs e Auditoria

**Vercel oferece:**

- Logs de deployments
- Logs de function calls
- Analytics

**Para ver:**

1. Vercel Dashboard > seu projeto
2. Aba "Analytics" - vê acessos
3. Aba "Deployments" > um deploy > "Function Logs"

---

### 4️⃣ Backup do Banco de Dados

**Status:** ✅ Neon faz automático

Neon oferece backups automáticos diários. Você não precisa fazer nada.

**Mas você pode:**

- Exportar dados manualmente via Vercel (usando a funcionalidade de export da app)
- Backup periódico: uma vez por semana, faça um export CSV

---

## 🛡️ O QUE JÁ ESTÁ PROTEGIDO

| Proteção                        | Status | Detalhes               |
| ------------------------------- | ------ | ---------------------- |
| Senhas hasheadas                | ✅     | bcrypt com salt        |
| Conexão ao banco criptografada  | ✅     | SSL/TLS Neon           |
| Rotas protegidas por middleware | ✅     | NextAuth.js            |
| Tokens JWT com secret           | ✅     | NEXTAUTH_SECRET        |
| HTTPS em produção               | ✅     | Vercel automático      |
| Isolamento de banco dev/prod    | ⏳     | Você vai fazer         |
| CORS configurado                | ✅     | Next.js padrão         |
| SQL Injection                   | ✅     | Prisma ORM             |
| XSS                             | ✅     | React automático       |
| CSRF                            | ✅     | NextAuth.js automático |

---

## 🔓 RISCOS CONHECIDOS (Mitigáveis)

### Risco 1: Expo de Credenciais no GitHub

**Risco:** Alguém vê as credenciais no repositório  
**Proteção:** ✅ Variáveis estão no `.env` (git ignore)  
**Status:** SEGURO

**Como verificar:**

```bash
git status
git check-ignore .env
```

---

### Risco 2: Força Bruta de Login

**Risco:** Alguém tenta muitas senhas diferentes  
**Mitigação:** Implementar rate limiting

**Sua aplicação:** ❌ Não tem rate limiting ainda

**Adicionar (Opcional):**

```typescript
// Adicionar em /api/auth/callback/credentials
import rateLimit from "express-rate-limit"

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
})
```

**Importância:** 🟡 Média

---

### Risco 3: XSS em Transações

**Risco:** Alguém insere `<script>alert('hacked')</script>` em descrição  
**Proteção:** ✅ React sanitiza automático  
**Status:** SEGURO

---

### Risco 4: Dados Sensíveis em Logs

**Risco:** Senha aparecendo nos logs  
**Proteção:** ✅ Seu código não loga senhas  
**Status:** SEGURO

**Verifique:**

```typescript
// Bom ✅
console.log("Login attempt for:", email) // Só email

// Ruim ❌
console.log("Login with password:", password) // Nunca faça isso!
```

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [ ] `NEXTAUTH_SECRET` de produção é **diferente** de desenvolvimento
- [ ] `DATABASE_URL` aponta para banco de **produção**
- [ ] `.env` não foi commitado no Git
- [ ] Nenhuma credencial real no repositório público
- [ ] 2FA ativado em Vercel
- [ ] 2FA ativado em Neon
- [ ] 2FA ativado em GitHub
- [ ] Você tem acesso de recuperação (códigos backup)

---

## 📞 EMERGÊNCIA: Credencial Exposta!

Se você acidentalmente commitou uma credencial:

1. **Imediato:**
   - Acessar Neon e **resetar a senha do banco**
   - Acessar Vercel e gerar novo `NEXTAUTH_SECRET`

2. **Depois:**

   ```bash
   # Remover do histórico Git
   git log --oneline
   git revert <commit-id>
   git push
   ```

3. **Notificar:**
   - Se foi credencial de cliente, notifique imediatamente
   - Documentar em relatório de incidente

---

## 🔍 MONITORAMENTO CONTÍNUO

Semanalmente, verifique:

1. **Logs de erro:** Vercel > Deployments > Function Logs
2. **Acessos suspeitos:** Verifique se há IPs estranhos
3. **Performance:** Analytics > vê se houve ataque DDoS

---

## 📚 LEITURA RECOMENDADA

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/example)

---

**Última atualização:** 24 de janeiro de 2026

✅ Sua aplicação está pronta para produção com segurança!
