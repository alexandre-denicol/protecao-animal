# CLAUDE.md — Diretrizes do Projeto ONG Proteção Animal

## Visão Geral
Site piloto para ONG de proteção a animais de rua.
Stack: Next.js 14 (App Router), Tailwind CSS, Supabase (banco + auth + storage), Vercel.
Este arquivo deve ser lido antes de qualquer geração de código.

## Padrões de Código (Clean Code)
- Funções pequenas, com responsabilidade única e nomes descritivos
- Nunca repetir lógica — extrair funções reutilizáveis (DRY)
- Comentários apenas quando a intenção não é óbvia pelo código
- Componentes React separados por responsabilidade
- Nomes de variáveis e funções que revelam intenção — evitar abreviações

## Design e Visual (Refactoring UI)
- Hierarquia visual é a prioridade: nem tudo tem a mesma importância
- Usar peso da fonte (600-700) e cor para criar hierarquia — não só tamanho
- Paleta de cores: máximo 3 níveis — cor escura (conteúdo principal),
  cinza médio (secundário), cinza claro (terciário)
- Começar com espaçamento generoso e reduzir — nunca o contrário
- Usar sistema de espaçamento consistente (múltiplos de 4px)
- Evitar bordas desnecessárias — preferir box-shadow ou background diferente
- Linha de texto entre 45-75 caracteres para boa leitura
- Mobile first, responsivo em todos os breakpoints
- Imagens sempre com next/image para otimização automática
- Estados vazios (empty states) devem ser tratados com atenção, nunca ignorados

## Segurança (OWASP)
- NUNCA colocar credenciais no código — sempre em variáveis de ambiente (.env)
- Validar e sanitizar todos os inputs no frontend E no backend
- Upload de imagens: validar tipo (somente image/*) e tamanho máximo (5MB)
- Row Level Security (RLS) ativo em TODAS as tabelas do Supabase
- Leitura pública apenas para animais e adoções aprovadas
- Escrita restrita a usuários autenticados
- Queries parametrizadas — NUNCA concatenar strings em SQL
- Nunca expor mensagens de erro detalhadas ao usuário final
- Sessões com expiração configurada adequadamente

## Banco de Dados
- Princípio do menor privilégio nas permissões
- RLS obrigatório em todas as tabelas
- Usar apenas prepared statements / queries parametrizadas

## Estrutura de Pastas
- /app — páginas e rotas (App Router)
- /components — componentes reutilizáveis
- /lib — funções utilitárias e cliente Supabase
- /docs — documentação e referências do projeto
- /public — assets estáticos

## Referências no Repositório
- REQUISITOS.md — funcionalidades e escopo
- DESIGN.md — diretrizes visuais detalhadas
