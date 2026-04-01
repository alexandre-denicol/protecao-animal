# Projeto: Site ONG Proteção Animal

## Visão Geral
Site institucional e operacional para ONG de proteção a animais de rua.
Stack: Next.js 14, Tailwind CSS, Supabase (banco, auth e storage).
Hospedagem: Vercel.

## Identidade Visual
- Design limpo, moderno e profissional
- Paleta de cores: tons terrosos e naturais (âmbar, verde musgo, bege)
  combinados com branco e cinza escuro
- Tipografia elegante: fonte sans-serif moderna (ex: Inter ou Plus Jakarta Sans)
- Fotos dos animais em destaque, com cards bem espaçados e sombras suaves
- Totalmente responsivo (mobile first)
- Animações sutis de entrada nos elementos (fade, slide suave)

## Páginas

### 1. Home
- Hero com imagem impactante e chamada para adoção
- Contador de animais resgatados, adotados e em espera
- Seção de animais em destaque (cards com foto, nome e botão "Conhecer")
- Seção institucional resumida com missão da ONG
- Call to action para doação ou contato

### 2. Animais para Adoção
- Grid de cards com foto, nome, espécie, idade, sexo e status de saúde
- Filtros por espécie (cão, gato), idade e status
- Ao clicar no card, abre página de perfil completo do animal

### 3. Perfil do Animal
- Foto principal + galeria de fotos
- Dados completos: nome, espécie, raça, idade, sexo, peso,
  status de saúde, vacinação, castração, temperamento
- Status de adoção (disponível, em processo, adotado)
- Botão "Quero adotar" com formulário de interesse

### 4. Cadastro de Animal (área restrita)
- Formulário completo de cadastro
- Upload de múltiplas fotos
- Todos os campos do perfil acima
- Apenas usuários autenticados da ONG podem acessar

### 5. Portfólio de Adoções
- Galeria de casos de sucesso com foto antes/depois ou foto atual
- Nome do animal, nome do adotante (opcional), mensagem/depoimento
- Visual em estilo magazine, elegante

### 6. Sobre / Contato
- História da ONG
- Equipe (foto e nome)
- Formulário de contato
- Links de redes sociais e doação (PIX ou link externo)

## Banco de Dados (Supabase)

### Tabelas principais
- `animals`: id, nome, espécie, raça, idade, sexo, peso, saúde,
  vacinado, castrado, temperamento, status, created_at
- `animal_photos`: id, animal_id, url, is_cover
- `adoptions`: id, animal_id, adotante_nome, depoimento,
  foto_url, data_adocao
- `contact_messages`: id, nome, email, mensagem, created_at

### Segurança
- Row Level Security (RLS) ativado em todas as tabelas
- Leitura pública apenas para dados de animais e adoções
- Escrita restrita a usuários autenticados (equipe da ONG)
- Upload de fotos apenas por usuários autenticados

## Requisitos Técnicos
- Variáveis de ambiente para credenciais do Supabase (nunca no código)
- Validação de formulários no frontend e backend
- Sanitização de inputs antes de qualquer query ao banco
- Imagens otimizadas com next/image
- SEO básico com meta tags em cada página
- Acessibilidade básica (alt em imagens, contraste adequado, navegação por teclado)
