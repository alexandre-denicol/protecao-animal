# REQUIREMENTS.md — Requisitos da Associação Amiga Miau

## Contexto
Site institucional e operacional da Associação Amiga Miau.
Idioma: Português do Brasil.
Foco: visual profissional e acolhedor, segurança, boas práticas.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage)
- Resend (envio de emails)
- Vercel (hospedagem)

## Usuários do Sistema

### Visitante (público geral)
- Navega pelo site sem login
- Visualiza animais, perfis, portfólio, informações institucionais
- Envia formulário de interesse em adoção
- Envia mensagem de contato

### Equipe (2-5 pessoas autenticadas)
- Acessa área administrativa com login
- Cadastra, edita e remove animais
- Gerencia status de adoção
- Visualiza mensagens de contato e interesse em adoção
- Cadastra casos de adoção no portfólio

## Páginas Públicas

### Home
- Header com logo, navegação e botão "Quero adotar"
- Hero com imagem impactante e chamada emocional
- Contador animado: animais resgatados, adotados, em espera
- Grid de animais em destaque (máx 6 cards)
- Seção institucional resumida com missão
- Seção de doação com chave PIX (CNPJ 49728609000170)
  e botão para copiar a chave
- Footer com links, redes sociais e informações da Associação

### Catálogo de Animais (/animais)
- Grid responsivo de cards
- Card: foto, nome, espécie, idade, sexo, status
- Filtros: espécie (gato/cão/todos), status (disponível/em processo)
- Paginação

### Perfil do Animal (/animais/[slug])
- Foto principal em destaque
- Galeria de fotos adicionais
- Ficha completa: nome, espécie, raça, idade, sexo, peso,
  saúde, vacinado, castrado, temperamento, descrição
- Badge de status (disponível / em processo / adotado)
- Botão "Quero adotar" → abre formulário de interesse
- Formulário de interesse: nome, email, telefone, mensagem
  → salva no banco + envia email de notificação para equipe

### Portfólio de Adoções (/adocoes)
- Galeria de casos de sucesso
- Card: foto do animal, nome, depoimento do adotante (opcional)
- Visual estilo magazine

### Sobre (/sobre)
- História da Associação Amiga Miau
- Equipe: foto e nome de cada membro
- Missão, visão e valores

### Contato (/contato)
- Formulário: nome, email, assunto, mensagem
  → salva no banco + envia email de notificação para equipe
- Chave PIX para doação
- Links de redes sociais

## Área Administrativa (/admin)

### Login (/admin/login)
- Formulário de email + senha
- Autenticação via Supabase Auth
- Redirect para /admin após login

### Dashboard (/admin)
- Resumo: total de animais por status
- Acessos rápidos para cadastrar animal e ver mensagens

### Gestão de Animais (/admin/animais)
- Listagem com busca e filtros
- Ações: editar, alterar status, excluir
- Botão para cadastrar novo animal

### Cadastro/Edição de Animal (/admin/animais/novo e /[id]/editar)
- Formulário completo com todos os campos
- Upload de múltiplas fotos (máx 5MB cada, somente imagens)
- Preview das fotos antes de salvar
- Definir foto de capa

### Mensagens (/admin/mensagens)
- Listagem de mensagens de contato e interesse em adoção
- Marcar como lida/não lida

### Portfólio (/admin/portfolio)
- Cadastrar novo caso de adoção
- Campos: animal (select), foto, depoimento, data

## Regras de Negócio
- Animal com status "adotado" não aparece no catálogo público
- Animal com status "em processo" aparece no catálogo com badge
- Formulário de interesse só disponível para animais "disponível" ou "em processo"
- Equipe recebe email a cada novo interesse em adoção
- Equipe recebe email a cada nova mensagem de contato
- Máximo 5 fotos por animal
- Foto de capa obrigatória para publicar animal

## Doação
- Exibir chave PIX (CNPJ 49728609000170) com botão "Copiar chave"
- Sem integração de gateway de pagamento
- Presente em: Home, página Contato e footer
