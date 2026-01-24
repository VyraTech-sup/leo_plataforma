# 🚀 GUIA RÁPIDO: DEPLOY EM 10 PASSOS

**Tempo estimado:** 15 minutos  
**Você já fez:** Nada! Este é o seu primeiro deploy em produção.

---

## ✅ ANTES DE COMEÇAR - VERIFIQUE

- [ ] Você tem conta no [Neon.tech](https://neon.tech)
- [ ] Você tem conta no [Vercel.com](https://vercel.com)
- [ ] Você tem acesso ao repositório GitHub: `VyraTech-sup/leo_plataforma`

Se não tiver nenhuma dessas, crie contas primeiro (são gratuitas).

---

## 🔧 PASSO 1: Criar Banco de Dados de Produção

1. Acesse https://console.neon.tech
2. Clique em **"Create a new project"**
3. Escolha um nome: `lmg-platform-prod`
4. Escolha a região: **`sa-east-1` (São Paulo)** ← Mesmo que você usa localmente
5. Clique em **"Create project"**
6. Aguarde ~1 minuto
7. Clique na aba **"Connection string"** no painel esquerdo
8. Copie a string completa (começa com `postgresql://`)
9. Salve em um arquivo seguro (você vai precisar em alguns minutos)

**Exemplo de como fica:**

```
postgresql://neondb_owner:xyz123abc456@ep-prod-123456.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🌐 PASSO 2: Criar Projeto na Vercel

1. Abra https://vercel.com/new
2. Clique em **"Import Project"**
3. Se for perguntado, autorize o GitHub
4. Na barra de busca, procure: `leo_plataforma`
5. Clique em **"Import"** quando vir `VyraTech-sup/leo_plataforma`

---

## ⚙️ PASSO 3: Configurar Projeto no Vercel

Você vai ver uma tela com 4 campos:

### Campo 1: Root Directory

- Deixe como está: `./`

### Campo 2: Build Command

- Deixe como está: `npm run build`

### Campo 3: Output Directory

- Deixe como está: `.next`

### Campo 4: Environment Variables ← **AQUI É IMPORTANTE**

Clique em **"Environment Variables"** e adicione as variáveis abaixo:

**1. DATABASE_URL**

- Key: `DATABASE_URL`
- Value: Cole a string que você copiou do Neon
- Environments: Marque apenas **Production** ✓

**2. NEXTAUTH_URL**

- Key: `NEXTAUTH_URL`
- Value: `https://seu-projeto.vercel.app` ← Você não sabe o domínio ainda? Coloque um placeholder por enquanto, vamos atualizar depois
- Environments: Marque apenas **Production** ✓

**3. NEXTAUTH_SECRET**

- Key: `NEXTAUTH_SECRET`
- Value: Copie exatamente do seu `.env` local
- Environments: Marque apenas **Production** ✓

**4. NODE_ENV**

- Key: `NODE_ENV`
- Value: `production`
- Environments: Marque apenas **Production** ✓

**5. NEXT_PUBLIC_API_URL**

- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://seu-projeto.vercel.app/api`
- Environments: Marque apenas **Production** ✓

**6. PLUGGY_CLIENT_ID**

- Key: `PLUGGY_CLIENT_ID`
- Value: `0ffadaeb-4791-4f7e-aa20-c4f27f54e844`
- Environments: Marque apenas **Production** ✓

**7. PLUGGY_CLIENT_SECRET**

- Key: `PLUGGY_CLIENT_SECRET`
- Value: `bea3a201-3893-40f8-8b7e-dd164496942e`
- Environments: Marque apenas **Production** ✓

**8. PLUGGY_WEBHOOK_SECRET**

- Key: `PLUGGY_WEBHOOK_SECRET`
- Value: `SUA_WEBHOOK_SECRET_AQUI`
- Environments: Marque apenas **Production** ✓

---

## 🚀 PASSO 4: Fazer Deploy

Após adicionar as variáveis de ambiente:

1. Clique em **"Deploy"** (botão azul no canto inferior direito)
2. Aguarde a barra de progresso completar
3. Quando ver "Deployment Completed", anote o domínio (ex: `lmg-platform.vercel.app`)

**Tempo estimado:** 3-5 minutos

---

## 🔄 PASSO 5: Atualizar NEXTAUTH_URL

Agora que você tem o domínio real, precisa atualizar:

1. Vá para https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá na aba **"Settings"**
4. Clique em **"Environment Variables"**
5. Clique em `NEXTAUTH_URL`
6. Mude o valor para: `https://seu-dominio-real.vercel.app`
   - Exemplo: `https://lmg-platform.vercel.app`
7. Clique em **"Save"**

---

## 🔄 PASSO 6: Fazer Novo Deploy (para aplicar a mudança)

1. Volte para a aba **"Deployments"**
2. Clique nos **"..."** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde completar

---

## ✔️ PASSO 7: Testar o Login

1. Abra https://seu-dominio.vercel.app/login
2. Use as credenciais de teste:
   - Email: `admin@lmg.com`
   - Senha: `admin123`
3. Você deve ser redirecionado para o dashboard

**Se der erro:**

- Vá para Vercel > Deployments > Clique no deploy > Scroll para "Function Logs"
- Procure por mensagens de erro vermelhas
- Se for erro de conexão: verifique `DATABASE_URL`
- Se for erro de autenticação: verifique `NEXTAUTH_SECRET` e `NEXTAUTH_URL`

---

## 🧪 PASSO 8: Testar Funcionalidades Principais

✅ Faça todos esses testes:

1. **Dashboard**
   - Você consegue ver a página de dashboard?
   - Há dados sendo carregados?

2. **Transações**
   - Vá em "Transações"
   - Clique em "Nova Transação"
   - Preencha os campos
   - Clique em "Salvar"
   - A transação apareceu na lista?

3. **Contas**
   - Vá em "Contas"
   - Clique em "Conectar Conta"
   - Se tiver dados, excelente!

4. **Exportação**
   - Vá em "Transações"
   - Clique em "Exportar"
   - Escolha um formato (CSV, Excel ou PDF)
   - O arquivo foi baixado?

5. **Logout**
   - Clique na sua foto/nome no topo
   - Clique "Sair"
   - Você foi redirecionado para login?

---

## 🎉 PASSO 9: Criar Usuário de Produção (Opcional)

Se quiser criar um usuário novo em produção:

1. Acesse https://seu-dominio.vercel.app/register
2. Preencha os dados:
   - Nome: (seu nome)
   - Email: (seu email)
   - Senha: (uma senha forte)
3. Clique em "Registrar"
4. Você deve ser redirecionado para o dashboard

---

## 📋 PASSO 10: Checklist Final

Marque cada item conforme testar:

- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Pode criar transações
- [ ] Pode criar contas
- [ ] Exportação funcionando
- [ ] Nenhum erro vermelho no console (F12 → Console)
- [ ] Nenhum erro nos logs do Vercel

---

## 🎊 PARABÉNS! VOCÊ FEZEU SEU PRIMEIRO DEPLOY! 🚀

Sua aplicação está agora em produção em: **https://seu-dominio.vercel.app**

---

## ❓ DÚVIDAS FREQUENTES

### O deploy falhou. Agora?

1. Vá em Vercel > Deployments
2. Clique no deploy com erro
3. Procure pela mensagem de erro
4. Procure a mensagem aqui abaixo:

**"Deployment failed: Build failed"**

- Pode ser erro de sintaxe. Verifique os logs.
- Tente fazer um novo push no GitHub para retrigger o build.

**"DATABASE_URL is not defined"**

- Você esqueceu de adicionar `DATABASE_URL` nas Environment Variables.
- Vá em Settings > Environment Variables e adicione.

**"NEXTAUTH_SECRET is not defined"**

- Mesmo problema: adicione em Environment Variables.

**"Connect ECONNREFUSED"**

- A aplicação consegue conectar no Neon?
- Verifique se `DATABASE_URL` é válido.
- Tente conectar manualmente: copie a string no Neon e teste.

### Posso usar um domínio próprio?

Sim! Mas é um passo extra:

1. Vercel > Settings > Domains
2. Clique em "Add"
3. Digite seu domínio
4. Siga as instruções de DNS
5. Atualize `NEXTAUTH_URL` para seu novo domínio
6. Faça novo deploy

### Como sou notificado de erros?

Você não é automaticamente. Para monitorar:

1. Vercel Dashboard > seu projeto
2. Aba "Analytics" - vê performance
3. Aba "Deployments" - vê status de deploys

### Posso fazer rollback?

Sim! Se algo der errado:

1. Vercel > Deployments
2. Clique num deployment anterior bem-sucedido
3. Clique "..."
4. Clique "Rollback to this Deployment"

---

**Dúvida não resolvida?** Verifique o arquivo [DEPLOY_STATUS_CHECKLIST.md](./DEPLOY_STATUS_CHECKLIST.md) para mais detalhes!
