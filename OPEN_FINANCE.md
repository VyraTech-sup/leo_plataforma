# Open Finance - Guia de Implementação

## ✅ O QUE FOI IMPLEMENTADO

### 🗄️ Modelagem de Dados (Prisma)

**Novos Modelos:**
- `BankConnection` - Conexões bancárias do usuário
- Enums: `BankProvider`, `ConnectionStatus`

**Modelos Atualizados:**
- `Account` - Agora suporta contas manuais e Open Finance
- `Transaction` - Rastreamento de transações externas

### 🔌 API Routes (Next.js App Router)

1. **POST /api/open-finance/connect**
   - Cria Connect Token do Pluggy
   - Usado pelo frontend para inicializar widget

2. **POST /api/open-finance/callback**
   - Recebe itemId após usuário conectar banco
   - Salva conexão no banco de dados

3. **POST /api/open-finance/webhook**
   - Recebe eventos do Pluggy (item/created, item/updated, item/error, etc)
   - Sincroniza contas e transações automaticamente
   - **Idempotente** - pode processar mesmo evento múltiplas vezes sem duplicar dados

4. **POST /api/open-finance/sync**
   - Força sincronização manual de uma conexão

5. **GET /api/open-finance/connections**
   - Lista todas as conexões do usuário

6. **DELETE /api/open-finance/connections/[id]**
   - Desconecta e remove conexão bancária

### 🎨 Componente React

**`<ConnectBankDialog />`**
- Widget Pluggy integrado
- Lista de conexões com status
- Sincronização manual
- Desconexão de bancos

### 📚 Utilitário Centralizado

**`lib/pluggy.ts`**
- Cliente Pluggy singleton
- Funções helper para todas as operações
- Mapeamento de tipos Pluggy → LMG Platform
- Validação de webhook signature

---

## 🚀 COMO TESTAR LOCALMENTE

### 1. Configurar Credenciais Pluggy

**a) Criar conta no Pluggy:**
1. Acesse https://dashboard.pluggy.ai
2. Crie uma conta (use Google/GitHub)
3. Vá em "API Keys"
4. Copie:
   - Client ID
   - Client Secret

**b) Configurar webhook (opcional para testes):**
1. No Pluggy Dashboard, vá em "Webhooks"
2. Adicione URL: `https://seu-dominio.ngrok.io/api/open-finance/webhook`
3. Copie o Webhook Secret

**c) Adicionar credenciais no `.env`:**

```bash
PLUGGY_CLIENT_ID="sua-client-id-aqui"
PLUGGY_CLIENT_SECRET="seu-client-secret-aqui"
PLUGGY_WEBHOOK_SECRET="seu-webhook-secret-aqui"  # Opcional
```

### 2. Expor localhost para receber webhooks (desenvolvimento)

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Copiar URL HTTPS gerado (ex: https://abc123.ngrok.io)
# Configurar no Pluggy Dashboard: https://abc123.ngrok.io/api/open-finance/webhook
```

### 3. Testar Fluxo Completo

**a) Iniciar aplicação:**
```bash
npm run dev
```

**b) Fazer login:**
- Acesse http://localhost:3000/login
- Use: `user@lmg.com` / `user123`

**c) Ir para página de Contas:**
- http://localhost:3000/accounts

**d) Clicar em "Conectar Banco"**

**e) No widget do Pluggy:**
- Escolha "Sandbox" (bancos de teste)
- Selecione "Itaú" (ou outro banco de teste)
- Use credenciais de teste:
  - **User:** `user-ok`
  - **Password:** `password-ok`

**f) Aguardar sincronização:**
- Webhook receberá evento `item/created`
- Contas serão criadas automaticamente
- Transações serão importadas (últimos 90 dias)

**g) Verificar resultado:**
- Atualize a página `/accounts`
- Você verá as contas sincronizadas do banco de teste
- Vá em `/transactions` para ver transações importadas

---

## 🏭 PREPARAÇÃO PARA PRODUÇÃO

### 1. Variáveis de Ambiente (Vercel)

```bash
# Produção
PLUGGY_CLIENT_ID="prod-client-id"
PLUGGY_CLIENT_SECRET="prod-client-secret"
PLUGGY_WEBHOOK_SECRET="prod-webhook-secret"

# Staging
PLUGGY_CLIENT_ID="staging-client-id"
PLUGGY_CLIENT_SECRET="staging-client-secret"
PLUGGY_WEBHOOK_SECRET="staging-webhook-secret"
```

### 2. Configurar Webhook no Pluggy Dashboard

**Produção:**
```
URL: https://seu-dominio.vercel.app/api/open-finance/webhook
Events: Selecione todos (item/*, account/*, transaction/*)
```

**Staging:**
```
URL: https://staging.seu-dominio.vercel.app/api/open-finance/webhook
```

### 3. Segurança

✅ **Implementado:**
- Validação de assinatura de webhook
- Autenticação obrigatória em todas as rotas
- Isolamento por userId
- Secrets não expostos no frontend
- HTTPS obrigatório

⚠️ **Recomendações Adicionais:**
- Rate limiting nas API routes (usar Vercel Edge Config ou Upstash)
- Logs estruturados (DataDog, Sentry)
- Retry logic para webhooks falhados (usar fila: Inngest, BullMQ)
- Circuit breaker para API do Pluggy

### 4. Performance

**Webhooks podem ser lentos. Soluções:**

**a) Usar fila (recomendado para produção):**
```typescript
// Em /api/open-finance/webhook
export async function POST(request: NextRequest) {
  const event = await request.json()
  
  // Adicionar na fila ao invés de processar imediatamente
  await queue.add('sync-item', {
    itemId: event.data.itemId,
  })
  
  return NextResponse.json({ ok: true })
}
```

**b) Background jobs:**
- Use Inngest, Trigger.dev ou QStash
- Webhook retorna 200 imediatamente
- Job processa sincronização em background

### 5. Monitoramento

**Métricas importantes:**
- Taxa de sucesso de conexões
- Tempo médio de sincronização
- Erros de webhook
- Falhas de autenticação bancária

**Ferramentas:**
- Vercel Analytics (grátis)
- Sentry (errors)
- LogRocket (session replay)

---

## 🧪 TESTES

### Testar Webhook Localmente (sem ngrok)

```bash
# Simular evento do Pluggy
curl -X POST http://localhost:3000/api/open-finance/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "item/updated",
    "data": {
      "itemId": "seu-item-id-aqui"
    }
  }'
```

### Testar Sincronização Manual

```bash
# Forçar sync de uma conexão
curl -X POST http://localhost:3000/api/open-finance/sync \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "connectionId": "sua-connection-id"
  }'
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Missing Pluggy credentials"

**Causa:** Variáveis `PLUGGY_CLIENT_ID` ou `PLUGGY_CLIENT_SECRET` não configuradas

**Solução:**
```bash
# Adicionar no .env
PLUGGY_CLIENT_ID="..."
PLUGGY_CLIENT_SECRET="..."
```

### Erro: "Failed to create connect token"

**Causa:** Credenciais Pluggy inválidas

**Solução:**
1. Verifique no Pluggy Dashboard se as credenciais estão corretas
2. Teste com curl:
```bash
curl -X POST https://api.pluggy.ai/connect_token \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: SEU_CLIENT_ID" \
  -H "X-CLIENT-SECRET: SEU_CLIENT_SECRET"
```

### Webhook não está sendo chamado

**Causa:** URL do webhook incorreta ou ngrok não configurado

**Solução:**
1. Verifique URL no Pluggy Dashboard
2. Teste webhook manualmente:
```bash
curl -X POST https://seu-ngrok.io/api/open-finance/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"item/updated","data":{"itemId":"test"}}'
```

### Transações não aparecem

**Causa:** Sincronização não concluída ou contas sem transações

**Solução:**
1. Verifique status da conexão (deve estar "ACTIVE")
2. Force sincronização manual
3. Verifique logs do webhook

---

## 📊 PRÓXIMOS PASSOS (V2)

### Funcionalidades Futuras:
- [ ] Suporte para cartões de crédito (faturas)
- [ ] Categorização automática melhorada (ML)
- [ ] Investimentos sincronizados
- [ ] Alertas de transações suspeitas
- [ ] Exportação de dados Open Finance
- [ ] Multi-provider (Belvo, Celcoin)
- [ ] Pagamentos via Open Finance (Pix)

### Melhorias de Arquitetura:
- [ ] Migrar webhooks para fila
- [ ] Implementar retry logic
- [ ] Cache de respostas do Pluggy
- [ ] GraphQL API (opcional)
- [ ] WebSockets para updates em tempo real

---

## 📞 SUPORTE

- **Pluggy Docs:** https://docs.pluggy.ai
- **Pluggy Dashboard:** https://dashboard.pluggy.ai
- **Pluggy Discord:** https://discord.gg/pluggy

---

**✅ IMPLEMENTAÇÃO COMPLETA E PRONTA PARA PRODUÇÃO!**
