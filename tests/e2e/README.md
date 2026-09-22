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

## Proteção contra escrita (`E2E_ALLOW_MUTATION`)

A maior parte da suíte grava dados no banco Supabase configurado no ambiente da execução (animais, interesses de adoção, mensagens de contato). Por isso, todo teste ou script que escreve exige o opt-in explícito:

```bash
E2E_ALLOW_MUTATION=true
```

> **Atenção:** ao definir `E2E_ALLOW_MUTATION=true`, você permite que os testes **escrevam no banco Supabase configurado para aquela execução**. Habilite somente após confirmar que `NEXT_PUBLIC_SUPABASE_URL` aponta para um ambiente descartável de desenvolvimento ou teste, nunca produção.

- O valor precisa ser exatamente `true`. Qualquer outro valor, ou a ausência da variável, bloqueia a escrita.
- Sem o opt-in, o teste falha imediatamente, antes de qualquer escrita, com uma mensagem explicando o bloqueio.
- Defina a variável na linha de comando de cada execução. Não a grave em `.env.local`, pois o Playwright carrega esse arquivo e a proteção ficaria permanentemente desligada.
- A verificação fica em `utils/mutation-guard.ts` (`assertMutationAllowed`) e é usada pelos testes que escrevem, pelo helper `createAnimalViaAdmin` e por `scripts/seed-e2e.ts`.

Testes somente leitura rodam sem o opt-in: `smoke/navigation.spec.ts`, `admin/login.spec.ts`, `public/catalog-filters.spec.ts`, `public/adoption-cta.spec.ts` (abre e cancela o formulário, sem enviar), `public/accessibility.spec.ts` (landmarks, skip link, menu mobile e validação no cliente, sem enviar), `public/home-layout.spec.ts` (estrutura da Home, cabeçalho, apoio e rolagem horizontal, com ou sem animais em destaque), a listagem de `admin/animais.spec.ts` e o teste de slug inválido de `public/animal-detail.spec.ts`.

## Ordem recomendada

```bash
npx playwright install chromium

# Somente leitura (não exige opt-in)
npx playwright test tests/e2e/smoke tests/e2e/admin/login.spec.ts

# Suíte completa (escreve no banco configurado)
E2E_ALLOW_MUTATION=true npm run test:e2e
```

Os testes não dependem de seed, slugs fixos ou dados controlados no banco. Quando um fluxo precisa de animal, a própria suíte cria esse registro pela UI administrativa com credenciais reais configuradas no ambiente.

O script opcional `scripts/seed-e2e.ts` também exige `E2E_ALLOW_MUTATION=true`, pois cria e atualiza usuário admin, animal, interesse e mensagem no banco configurado.

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
- Filtros, busca e paginação do catálogo pela URL (somente leitura; cards e paginação são pulados se o banco não tiver animais suficientes).
- Detalhe do animal, ficha, WhatsApp e 404.
- CTA "Quero adotar" (posição, foco ao abrir/cancelar o formulário e barra fixa no mobile), sem enviar o formulário.
- Formulário público de interesse em adoção.
- Formulário público de contato.
- Acessibilidade pública: um `main` por página, link "Pular para o conteúdo", menu mobile por teclado, rótulos/autocomplete/`aria-invalid` dos formulários e movimento reduzido (somente leitura).
- Login admin, dashboard e listagem de animais.
- Criação e edição de animal pelo admin.
- Listagem e marcação como lida de interesses e mensagens.
