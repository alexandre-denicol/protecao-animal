# CLAUDE.md — Diretrizes do Projeto ONG Proteção Animal

## Visão Geral
Site piloto para ONG de proteção a animais de rua.
Stack: Next.js 14 (App Router), Tailwind CSS, Supabase, Vercel.

## Padrões de Código
- Seguir os princípios de Clean Code: funções pequenas, nomes claros e descritivos
- Componentes React separados por responsabilidade
- Nunca repetir lógica (DRY) — extrair funções reutilizáveis sempre que possível
- Comentários apenas quando a intenção do código não for óbvia

## Design e Visual
- Visual profissional, moderno e acolhedor
- Paleta suave: tons terrosos, bege, verde musgo e branco
- Tipografia limpa (Inter ou Plus Jakarta Sans)
- Animações sutis: fade e slide suave nos elementos
- Mobile first — responsivo em todos os breakpoints
- Imagens sempre com next/image para otimização automática

## Segurança (OWASP)
- Nunca colocar credenciais ou chaves no código — sempre em variáveis de ambiente (.env)
- Validar e sanitizar todos os inputs no frontend e no backend antes de qualquer operação
- Upload de arquivos: validar tipo (apenas imagens) e tamanho máximo
- Row Level Security (RLS) ativo em todas as tabelas do Supabase
- Leitura pública apenas para dados de animais e adoções
- Escrita restrita a usuários autenticados da ONG
- Nunca expor mensagens de erro detalhadas ao usuário final

## Banco de Dados
- Usar queries parametrizadas — nunca concatenar strings em queries SQL
- Princípio do menor privilégio nas permissões do Supabase
- RLS obrigatório em todas as tabelas

## Estrutura de Pastas
- /app — páginas e rotas (App Router)
- /components — componentes reutilizáveis
- /lib — funções utilitárias e cliente Supabase
- /docs — documentação e referências do projeto
- /public — assets estáticos

## Referências
- REQUISITOS.md — funcionalidades e escopo do projeto
- /docs — guias OWASP e referências de segurança
