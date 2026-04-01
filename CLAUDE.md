# CLAUDE.md — Diretrizes do Projeto Associação Amiga Miau

## Visão Geral
Site institucional e operacional da Associação Amiga Miau,
organização de proteção a animais de rua.
Stack: Next.js 14 (App Router), Tailwind CSS, Supabase, Resend, Vercel.
Idioma: Português do Brasil em todo o projeto (UI, mensagens, comentários).

Leia também antes de qualquer geração de código:
REQUIREMENTS.md, DESIGN.md, SECURITY.md, SCHEMA.md

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
- Nomenclatura de arquivos: PascalCase para componentes,
  kebab-case para rotas e utilitários
- Nunca usar `any` em TypeScript — tipar sempre

## Design e Visual (ver DESIGN.md para detalhes completos)
- Paleta oficial: lilás #C8A8E8, laranja #E8934A, rosa #F07850
- Fonte: Plus Jakarta Sans (Google Fonts)
- Hierarquia visual acima de tudo — definir primário, secundário, terciário
- Começar com espaçamento generoso e reduzir — nunca o contrário
- Mobile first — header com hamburger menu em telas pequenas
- Imagens sempre com next/image
- Estados vazios (empty states) sempre tratados com ícone + CTA
- Loading states: Claude Code escolhe entre skeleton ou spinner
  conforme o contexto de cada componente

## Segurança (ver SECURITY.md para implementação completa)
- Nunca colocar credenciais no código — sempre em .env
- Validar e sanitizar todos os inputs no frontend E backend
- Upload: validar tipo MIME real e tamanho (máx 5MB)
- RLS ativo em todas as tabelas do Supabase
- Queries parametrizadas — nunca concatenar strings em SQL
- Nunca expor erros internos ao usuário final
- Links externos sempre com rel="noopener noreferrer"
- Usar componente <ExternalLink> definido no SECURITY.md

## Email (Resend)
- Usar Resend para envio de emails de notificação
- Notificar equipe quando: novo interesse em adoção, nova mensagem de contato
- Templates em português do Brasil
- Nunca expor chave da API Resend ao cliente

## Estrutura de Pastas
- /app — páginas e rotas (App Router)
- /app/admin — área restrita da equipe
- /app/api — API routes (Next.js)
- /components — componentes reutilizáveis
- /components/ui — componentes base (botões, inputs, cards)
- /lib — funções utilitárias, cliente Supabase, cliente Resend
- /lib/supabase — client.ts e server.ts separados
- /lib/email — templates e função de envio
- /types — tipos TypeScript do projeto
- /public — assets estáticos (logo, ícones)
