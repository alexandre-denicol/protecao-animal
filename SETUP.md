# SETUP.md — Guia de Configuração de Infraestrutura

## Ordem obrigatória de setup
1. Supabase (banco + auth + storage)
2. Resend (email)
3. Variáveis de ambiente (.env.local)
4. Vercel (hospedagem)

---

## Passo 1 — Supabase

### 1.1 Criar conta e projeto
1. Acesse https://supabase.com e crie uma conta gratuita
2. Clique em "New Project"
3. Nome do projeto: `amiga-miau`
4. Defina uma senha forte para o banco (guardar em local seguro)
5. Região: South America (São Paulo) — menor latência para BR
6. Aguarde o projeto ser criado (~2 minutos)

### 1.2 Criar as tabelas
1. No painel Supabase, vá em **SQL Editor**
2. Execute todo o conteúdo do arquivo `SCHEMA.md` na ordem indicada
3. Confirme que todas as tabelas aparecem em **Table Editor**

### 1.3 Configurar Storage
1. Vá em **Storage > New Bucket**
2. Criar bucket `animal-photos` (público, conforme SCHEMA.md)
3. Criar bucket `adoption-photos` (público, conforme SCHEMA.md)

### 1.4 Configurar autenticação da equipe
1. Vá em **Authentication > Settings**
2. Desabilite "Enable email confirmations" se quiser cadastro imediato
   (ou mantenha ativo para mais segurança — recomendado)
3. Em **Authentication > Users**, clique "Invite user"
4. Cadastre os emails de cada membro da equipe (até 5 pessoas)
5. Cada membro receberá email para definir a senha

### 1.5 Configurar política de senha
1. Vá em **Authentication > Settings > Password Policy**
2. Minimum password length: **12**
3. Marque "Prevent use of leaked passwords"

### 1.6 Obter as chaves do projeto
1. Vá em **Settings > API**
2. Copie:
   - `Project URL` → será o NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key → será o NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` key → será o SUPABASE_SERVICE_ROLE_KEY
     ⚠️ Esta chave é secreta — nunca expor no frontend

---

## Passo 2 — Resend (Email)

### 2.1 Criar conta
1. Acesse https://resend.com e crie conta gratuita
2. O plano gratuito permite 3.000 emails/mês — suficiente para começar

### 2.2 Criar API Key
1. Vá em **API Keys > Create API Key**
2. Nome: `amiga-miau-production`
3. Permissão: Sending access
4. Copie a chave → será o RESEND_API_KEY
   ⚠️ Aparece apenas uma vez — guardar imediatamente

### 2.3 Verificar domínio (opcional mas recomendado)
- Se tiver domínio próprio, verificar em **Domains**
- Se não tiver, usar o domínio padrão do Resend por enquanto
- Email de envio padrão: `onboarding@resend.dev`
- Email de destino das notificações: definir em variável de ambiente

---

## Passo 3 — Variáveis de Ambiente

### Criar arquivo `.env.local` na raiz do projeto:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Resend
RESEND_API_KEY=re_xxxx

# Email de destino das notificações da equipe
NOTIFICATION_EMAIL=equipe@associacaoamigamiau.org.br

# URL do site (sem barra no final)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ O arquivo `.env.local` já está no `.gitignore` por padrão no Next.js.
Nunca commitar este arquivo.

---

## Passo 4 — Vercel (Hospedagem)

### 4.1 Criar conta
1. Acesse https://vercel.com e crie conta gratuita
2. Conecte com sua conta GitHub

### 4.2 Importar projeto
1. Clique em **Add New > Project**
2. Selecione o repositório `protecao-animal`
3. Framework: Next.js (detectado automaticamente)
4. Clique em **Deploy** — o primeiro deploy será feito sem as variáveis
   (vai falhar, isso é esperado neste momento)

### 4.3 Configurar variáveis de ambiente na Vercel
1. Vá em **Settings > Environment Variables**
2. Adicione todas as variáveis do `.env.local` uma por uma
3. Para `NEXT_PUBLIC_SITE_URL`, use a URL do seu projeto na Vercel
   (ex: `https://protecao-animal.vercel.app`)
4. Clique em **Redeploy** após adicionar todas as variáveis

### 4.4 Deploy automático
- A partir de agora, cada push para o branch `main` faz deploy automático
- Branches de feature geram preview deployments automáticos

---

## Checklist Final

- [ ] Projeto Supabase criado
- [ ] Tabelas criadas via SCHEMA.md
- [ ] Buckets de storage criados
- [ ] Usuários da equipe convidados no Supabase Auth
- [ ] Conta Resend criada e API Key obtida
- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] `.env.local` no `.gitignore` (confirmar)
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Redeploy feito após configurar variáveis
