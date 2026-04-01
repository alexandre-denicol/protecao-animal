# Requisitos do Projeto — ONG Proteção Animal

## Contexto
Site piloto institucional e operacional para ONG de proteção a animais de rua.
Foco em funcionalidade, segurança e visual profissional e acolhedor.

## Stack Técnica
- Framework: Next.js 14 (App Router)
- Estilização: Tailwind CSS
- Backend e banco: Supabase (PostgreSQL + Auth + Storage)
- Hospedagem: Vercel

## Páginas e Funcionalidades

### 1. Home
- Hero com imagem impactante e chamada para adoção
- Contador animado: animais resgatados, adotados, em espera
- Grid de animais em destaque (máximo 6 cards)
- Seção institucional resumida (missão da ONG)
- Call to action para adoção e doação

### 2. Catálogo de Animais
- Grid responsivo de cards (foto, nome, espécie, idade, sexo, status)
- Filtros por espécie (cão, gato) e status de adoção
- Paginação ou scroll infinito

### 3. Perfil do Animal
- Foto principal em destaque
- Ficha completa: nome, espécie, raça, idade, sexo, peso,
  saúde, vacinação, castração, temperamento, descrição
- Status de adoção (disponível / em processo / adotado)
- Botão "Quero adotar" com formulário de interesse

### 4. Cadastro de Animal (área restrita)
- Acesso apenas para usuários autenticados da ONG
- Formulário: todos os campos do perfil acima
- Upload de foto com preview antes de salvar
- Validação de tipo (somente imagens) e tamanho (máx 5MB)

### 5. Portfólio de Adoções
- Galeria de casos de sucesso
- Foto, nome do animal, depoimento do adotante (opcional)
- Visual em estilo magazine, elegante

### 6. Sobre / Contato
- História da ONG e equipe
- Formulário de contato
- Links para redes sociais e doação

## Banco de Dados (Supabase)

### Tabelas
- `animals`: id, nome, espécie, raça, idade, sexo, peso, saúde,
  vacinado (bool), castrado (bool), temperamento, descricao,
  status (disponível/em_processo/adotado), created_at
- `animal_photos`: id, animal_id, url, is_cover
- `adoptions`: id, animal_id, adotante_nome, depoimento, foto_url, data_adocao
- `contact_messages`: id, nome, email, mensagem, created_at

### Segurança
- RLS ativo em todas as tabelas
- Leitura pública: animals e adoptions
- Escrita restrita a usuários autenticados

## Requisitos Técnicos
- Variáveis sensíveis apenas em .env (nunca no código)
- Validação de formulários no frontend e no servidor
- Inputs sanitizados antes de qualquer operação no banco
- Imagens via next/image
- SEO básico com meta tags em cada página
- Acessibilidade: alt em todas as imagens, contraste adequado,
  navegação por teclado funcional
