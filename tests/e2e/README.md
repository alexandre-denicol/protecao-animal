# Testes E2E

Suíte Playwright para validar os fluxos públicos e administrativos da Amiga Miau.

## Pré-requisitos

Defina as variáveis do ambiente de desenvolvimento ou teste. Não use produção.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
```

`SUPABASE_SERVICE_ROLE_KEY` também é aceito no lugar de `SUPABASE_SECRET_KEY`.

O banco precisa ter o schema aplicado e os buckets de storage criados conforme `SCHEMA.md`.

## Ordem recomendada

```bash
npx playwright install chromium
npm run test:e2e
```

Os testes não dependem de seed, slugs fixos ou dados controlados no banco. Quando um fluxo precisa de animal, a própria suíte cria esse registro pela UI administrativa com credenciais reais configuradas no ambiente.

Por padrão, o Playwright sobe `npm run dev` em `http://127.0.0.1:3000`.
Para usar um servidor já aberto:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

## Scripts

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
