# Testes E2E

Suíte Playwright para validar os fluxos públicos e administrativos da Amiga Miau.

## Pré-requisitos

Defina as variáveis do ambiente de desenvolvimento ou teste. Não use produção.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
E2E_ADMIN_EMAIL=e2e-admin@amigamiau.test
E2E_ADMIN_PASSWORD=E2eAdmin12345!
```

`SUPABASE_SERVICE_ROLE_KEY` também é aceito no lugar de `SUPABASE_SECRET_KEY`.

O banco precisa ter o schema aplicado e os buckets de storage criados conforme `SCHEMA.md`.

## Ordem recomendada

```bash
npx playwright install chromium
npm run seed:e2e
npm run test:e2e
```

Por padrão, o Playwright sobe `npm run dev` em `http://127.0.0.1:3000`.
Para usar um servidor já aberto:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

## Scripts

- `npm run seed:e2e`: cria usuário admin, configurações e dados controlados `e2e-*`.
- `npm run test:e2e`: executa headless.
- `npm run test:e2e:headed`: executa com navegador visível.
- `npm run test:e2e:ui`: abre a UI do Playwright.
- `npm run test:e2e:debug`: modo debug.

## Cobertura

- Home e animais em destaque com dados reais.
- Catálogo `/animais` e navegação para `/animais/[slug]`.
- Detalhe do animal, ficha, WhatsApp e 404.
- Formulário público de interesse em adoção.
- Formulário público de contato.
- Login admin, dashboard e listagem de animais.
- Criação e edição de animal pelo admin.
- Listagem e marcação como lida de interesses e mensagens.
