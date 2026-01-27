# 🚀 CHECKLIST DE DEPLOY (PRODUÇÃO) — LMG PLATFORM

> Use este checklist para garantir uma entrega segura, rastreável e reversível em produção. Marque cada item conforme for validado.

---

## 1. Infraestrutura & Configuração

- [ ] Variáveis de ambiente (envs) revisadas e seguras
- [ ] Secrets/API keys protegidos e não expostos
- [ ] Configuração de banco de dados (produção) validada
- [ ] Storage, CDN e serviços externos testados

## 2. Banco de Dados

- [ ] Migrations aplicadas com sucesso
- [ ] Seeds executados (se necessário)
- [ ] Backup recente disponível e testado

## 3. Segurança

- [ ] HTTPS ativo e obrigatório
- [ ] Headers de segurança configurados (CSP, HSTS, etc.)
- [ ] Acesso administrativo restrito
- [ ] Logs de acesso e erro ativos

## 4. Monitoramento & Logs

- [ ] Monitoramento de uptime configurado
- [ ] Alertas de erro e performance ativos
- [ ] Logs centralizados e acessíveis

## 5. Plano de Rollback

- [ ] Plano de rollback documentado (ex: restore de backup, reverter release)
- [ ] Teste de rollback realizado (se possível)

## 6. Smoke Tests Pós-Deploy

- [ ] Login/logout
- [ ] Dashboard carrega dados reais
- [ ] Edição de transação e orçamento
- [ ] Projeções e metas atualizam corretamente
- [ ] Navegação entre telas sem erro
- [ ] Logs e monitoramento capturam eventos

---

> Observações/Notas:

- ***

  **Responsável pelo Deploy:**

Data: **/**/\_\_\_\_

Versão/Release: **\_\_\_\_**
