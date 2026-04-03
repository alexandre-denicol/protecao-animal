# CLAUDE.md — Diretrizes do Projeto Associação Amiga Miau

## Visão Geral
Site institucional e operacional da Associação Amiga Miau,
organização de proteção a animais de rua.
Stack: Next.js 14 (App Router), Tailwind CSS, Supabase, Resend, Vercel.
Idioma: Português do Brasil em todo o projeto (UI, mensagens, comentários).

Leia também antes de qualquer geração de código:
REQUIREMENTS.md, DESIGN.md, SECURITY.md, SCHEMA.md, ROLES.md

## Identidade da Marca
- Nome oficial: Associação Amiga Miau
- Personalidade: acolhedora, confiável, alegre, cuidadosa
- Tom de voz: próximo, humano, positivo — nunca frio ou corporativo
- A logo é um gato e cachorro se abraçando em formato de coração
  sobre fundo lilás — o design do site deve refletir esse afeto

## Padrões de Código (Clean Code)
- Funções pequenas com responsabilidade única e nomes descritivos
- Nunca repetir lógica — extrair funções reutilizáveis (DRY)
- Comentários apenas quando a intenção não for óbvia pelo código
- Componentes React separados por responsabilidade
- Nomenclatura: PascalCase para componentes, kebab-case para rotas
- Nunca usar `any` em TypeScript — tipar sempre

## Controle de Acesso (RBAC)
Ver ROLES.md para especificação completa das roles e permissões.

### Regra crítica — verificação em 3 camadas obrigatórias:
1. **Middleware** — bloqueia acesso à rota antes de renderizar
2. **Server Action / API Route** — verifica role antes de qualquer operação
3. **RLS no Supabase** — última linha de defesa no banco

- Nunca verificar autorização apenas no frontend
- Role sempre vem do banco — nunca do frontend ou de parâmetros da URL
- Usuário inativo (ativo = false) deve ser tratado como não autenticado
- Negar por padrão: se a role não está explicitamente autorizada, negar

### Roles disponíveis:
- `admin` — acesso total, gerencia membros
- `editor` — cadastra/edita seus próprios animais
- `viewer` — somente leitura no painel

## Design e Visual (ver DESIGN.md para detalhes completos)
- Paleta oficial: lilás #C8A8E8, laranja #E8934A, rosa #F07850
- Fonte: Plus Jakarta Sans (Google Fonts)
- Hierarquia visual acima de tudo
- Começar com espaçamento generoso e reduzir
- Mobile first — header com hamburger menu em telas pequenas
- Imagens sempre com next/image
- Empty states sempre tratados com ícone + CTA
- Loading states: skeleton ou spinner conforme contexto

## Segurança (ver SECURITY.md para implementação completa)
- Nunca colocar credenciais no código — sempre em .env
- Validar e sanitizar todos os inputs no frontend E backend
- Upload: validar tipo MIME real e tamanho (máx 5MB)
- RLS ativo em todas as tabelas do Supabase
- Queries parametrizadas — nunca concatenar strings em SQL
- Nunca expor erros internos ao usuário final
- Links externos sempre com rel="noopener noreferrer"
- Rate limiting em todos os formulários públicos

## Email (Resend)
- Usar Resend para notificações de novos interesses e mensagens
- Templates em português do Brasil
- Nunca expor chave da API Resend ao cliente

## Estrutura de Pastas
- /app — páginas e rotas (App Router)
- /app/admin — área restrita da equipe
- /app/api — API routes
- /components — componentes reutilizáveis
- /components/ui — componentes base
- /lib — funções utilitárias
- /lib/supabase — client.ts e server.ts separados
- /lib/auth — funções de verificação de role (roles.ts)
- /lib/email — templates e função de envio
- /types — tipos TypeScript
- /public — assets estáticos (logo, ícones)

## Referências no Repositório
- REQUIREMENTS.md — escopo completo de páginas e funcionalidades
- DESIGN.md — diretrizes visuais detalhadas
- SECURITY.md — instruções técnicas de segurança operacional
- SCHEMA.md — schema SQL completo do banco Supabase
- ROLES.md — controle de acesso por roles (RBAC)
- SETUP.md — guia de configuração de infraestrutura