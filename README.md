# 🐾 Associação Amiga MiAu — Plataforma Web

Aplicação web para gestão de adoção de animais, captação de sócios e comunicação institucional da Associação Amiga MiAu.

> Versão: **v0.9 (Release Candidate)**

---

## 🎯 Escopo

- Catálogo público de animais para adoção  
- Registro de interesse de adoção  
- Gestão de sócios e contribuições  
- Controle de pagamentos  
- Comunicação com usuários (email e WhatsApp)  
- Painel administrativo completo  

---

## 🧱 Stack

- Next.js 14 (App Router)  
- React 18  
- Tailwind CSS  
- Supabase (PostgreSQL, Auth, Storage)  
- Resend (envio de emails)  
- Playwright (testes E2E)  
- Vercel (deploy)  

---

## 🏗️ Arquitetura

- Frontend e backend unificados via Server Actions  
- Supabase como backend principal (dados, autenticação e storage)  
- Camada de comunicação desacoplada (`lib/email.ts`)  

### Separação por domínio

- `app/` → rotas  
- `components/` → UI  
- `lib/` → integrações e lógica  

---

## 🔐 Segurança

- Variáveis sensíveis isoladas via `.env` (não versionado)  
- Uso controlado de `NEXT_PUBLIC_*`  
- Chaves administrativas restritas ao server  
- RLS ativo no banco  
- Logs sanitizados (sem exposição de dados sensíveis)  

---

## 🗄️ Domínio de dados

Principais entidades:

- `animals`  
- `adoption_interests`  
- `contact_messages`  
- `membership_interests`  
- `members`  
- `member_payments`  
- `member_contact_history`  

---

## 🎨 Direção visual

- Tema dark premium  
- Paleta baseada em âmbar e verde petróleo  
- Ênfase em contraste, hierarquia e legibilidade  
- Experiência responsiva (mobile-first)  

---

## 📌 Status

Aplicação funcional e estável, pronta para uso real em ambiente controlado, com base sólida para evolução incremental.

---

PIX — CNPJ: `49728609000170`
