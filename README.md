# 🐾 Proteção Animal — Site Institucional

Site institucional e operacional para ONG de proteção a animais de rua.
Projeto piloto desenvolvido com foco em visual profissional, segurança e boas práticas de código.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Estilização:** Tailwind CSS
- **Backend / Banco / Storage:** Supabase
- **Hospedagem:** Vercel

## Funcionalidades

- Página inicial com apresentação da ONG e animais em destaque
- Catálogo de animais disponíveis para adoção com filtros
- Perfil completo de cada animal com galeria de fotos
- Formulário de interesse em adoção
- Área restrita para cadastro e gestão de animais (equipe da ONG)
- Portfólio de adoções realizadas com sucesso
- Página institucional e formulário de contato

## Documentação do Projeto

| Arquivo | Descrição |
|---|---|
| `CLAUDE.md` | Diretrizes de código, design e segurança para o Claude Code |
| `REQUISITOS.md` | Escopo completo de páginas, funcionalidades e banco de dados |
| `DESIGN.md` | Diretrizes visuais baseadas em Refactoring UI |

## Referências Técnicas

- **Clean Code** (Robert C. Martin) — padrões de código limpo e legível
- **Refactoring** (Martin Fowler) — boas práticas de refatoração contínua
- **Refactoring UI** (Adam Wathan & Steve Schoger) — design de interfaces profissionais
- **OWASP Cheat Sheet Series** — segurança em aplicações web

## Segurança

Este projeto segue as diretrizes OWASP, incluindo:
validação de inputs, queries parametrizadas, Row Level Security no Supabase,
upload seguro de arquivos e credenciais exclusivamente em variáveis de ambiente.

## Como Contribuir

Este é um projeto piloto em desenvolvimento ativo via Claude Code.
Para sugestões ou melhorias, abra uma issue neste repositório.
