# REQUIREMENTS.md — Associação Amiga Miau

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

## Roles do Sistema
Ver ROLES.md para especificação completa.
- `admin` — acesso total, gerencia membros
- `editor` — cadastra e edita seus próprios animais
- `viewer` — somente leitura no painel

---

## Usuários do Sistema

### Visitante (público geral)
- Navega pelo site sem login
- Visualiza animais, perfis, portfólio, informações institucionais
- Envia formulário de interesse em adoção
- Envia mensagem de contato

### Equipe (2-5 pessoas autenticadas)
- Acessa área administrativa com login
- Permissões conforme role definida pelo admin

---

## Páginas Públicas

### Home
- Header fixo com logo, navegação e botão "Quero adotar"
- Hero fullscreen com foto de animal, overlay gradiente,
  título grande e bold, dois botões em hierarquia clara
- Contador animado: animais resgatados, adotados, em espera
- Grid de animais em destaque (máx 6 cards)
- Seção institucional com missão da Associação
- Seção de doação PIX (CNPJ 49728609000170) com botão copiar
- Footer escuro com logo, links e redes sociais

### Catálogo de Animais (/animais)
- Grid responsivo de cards
- Card: foto, nome, espécie, idade, sexo, status
- Filtros: espécie (gato/cão/todos), status (disponível/em processo)
- Paginação
- Animais com status "adotado" não aparecem

### Perfil do Animal (/animais/[slug])
- Foto principal em destaque
- Galeria de fotos adicionais
- Ficha completa: nome, espécie, raça, idade, sexo, peso,
  saúde, vacinado, castrado, temperamento, descrição
- Badge de status (disponível / em processo / adotado)
- Botão "Quero adotar" visível apenas para status disponível/em processo
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

---

## Área Administrativa (/admin)

### Login (/admin/login)
- Formulário email + senha
- Autenticação via Supabase Auth
- Redirect para /admin após login bem-sucedido
- Redirect para /admin/login se não autenticado
- Mensagem de erro genérica — nunca revelar se email existe

### Dashboard (/admin)
- Resumo: total de animais por status
- Total de mensagens não lidas
- Total de interesses de adoção não lidos
- Acessos rápidos para cadastrar animal e ver mensagens

### Gestão de Animais (/admin/animais)
- Admin: vê todos os animais
- Editor: vê apenas seus próprios animais
- Busca e filtros
- Ações: editar, alterar status, excluir (conforme role)
- Botão para cadastrar novo animal

### Cadastro/Edição de Animal (/admin/animais/novo e /[id]/editar)
- Formulário completo com todos os campos
- Upload de múltiplas fotos (máx 5 por animal, 5MB cada, somente imagens)
- Preview das fotos antes de salvar
- Definir foto de capa obrigatória
- Campo created_by preenchido automaticamente com o usuário logado

### Mensagens (/admin/mensagens)
- Admin e viewer: veem todas as mensagens de contato
- Editor: não acessa esta página
- Marcar como lida/não lida

### Interesses de Adoção (/admin/interesses)
- Admin e viewer: veem todos os interesses
- Editor: vê apenas interesses dos seus animais
- Marcar como lido/não lido
- Ver animal relacionado

### Portfólio (/admin/portfolio)
- Admin e editor: cadastram novo caso de adoção
- Campos: animal (select), foto, depoimento, data
- Viewer: somente visualiza

### Gerenciamento de Membros (/admin/membros)
- APENAS admin acessa esta página
- Listar todos os membros ativos com nome, email e role
- Convidar novo membro:
  → Admin informa email, nome e role (admin/editor/viewer)
  → Sistema envia convite via Supabase Auth
  → Novo membro recebe email para definir senha
  → Perfil criado automaticamente com a role definida
- Alterar role de membro existente
- Revogar acesso (ativo = false) — não deleta o usuário
- Reativar membro revogado
- Admin pode convidar outros admins
- Admin não pode revogar a si mesmo

---

## Regras de Negócio
- Animal com status "adotado" não aparece no catálogo público
- Animal com status "em processo" aparece com badge amarelo
- Formulário de interesse só disponível para animais disponível/em processo
- Equipe recebe email a cada novo interesse em adoção
- Equipe recebe email a cada nova mensagem de contato
- Máximo 5 fotos por animal
- Foto de capa obrigatória para publicar animal
- Editor só edita/deleta animais que ele cadastrou
- Admin revogado perde acesso imediatamente
- Role nunca vem do frontend — sempre validada no servidor

## Doação
- Exibir chave PIX (CNPJ 49728609000170) com botão "Copiar chave"
- Sem integração de gateway de pagamento
- Presente em: Home, página Contato e footer

## Segurança
- Verificação de role em 3 camadas: middleware + API route + RLS
- Nunca expor erros internos ao usuário
- Rate limiting em todos os formulários públicos
- Upload com validação de tipo MIME e tamanho
- Sessão invalidada após logout
- Ver SECURITY.md e ROLES.md para detalhes completos