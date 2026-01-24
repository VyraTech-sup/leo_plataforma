# Configurar Banco de Dados PostgreSQL (Neon)

## Passos Rápidos:

1. **Acesse**: https://neon.tech
2. **Crie uma conta gratuita**
3. **Crie um projeto** (escolha região us-east-1)
4. **Copie a Connection String**
5. **Cole no arquivo `.env`**:

```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

6. **Execute as migrações**:
```bash
npx prisma migrate deploy
```

7. **Execute o seed**:
```bash
npx tsx prisma/seed.ts
```

8. **Reinicie o servidor**:
```bash
npm run dev
```

Pronto! Agora você pode fazer login com:
- **Admin**: admin@lmg.com / admin123
- **User**: user@lmg.com / user123

---

## Alternativa: Cadastre-se diretamente

Se não quiser configurar banco agora:

1. Vá em http://localhost:3000/register
2. Cadastre-se com qualquer email/senha
3. Faça login normalmente

**Nota**: Sem banco PostgreSQL, os dados serão perdidos quando reiniciar o servidor.
