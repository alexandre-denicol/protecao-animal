# SECURITY.md — Diretrizes de Segurança Operacional

## Contexto
Este arquivo complementa o CLAUDE.md com instruções técnicas concretas de segurança,
aplicadas especificamente à stack Next.js 14 + Supabase + Vercel deste projeto.
Deve ser lido e seguido em TODA geração de código que envolva rotas, formulários,
autenticação, banco de dados, uploads ou exibição de dados ao usuário.

---

## 1. Error Handling — Nunca expor detalhes internos

### Regra
Erros internos revelam stack traces, caminhos de arquivo e versões de framework
para atacantes. NUNCA retornar `error.message` bruto ao cliente.

### Implementação obrigatória em todas as API Routes:
```typescript
// ❌ ERRADO — expõe detalhes internos
catch (error) {
  return Response.json({ error: error.message }, { status: 500 })
}

// ✅ CORRETO — resposta genérica ao cliente, log no servidor
catch (error) {
  console.error('[ERRO INTERNO]', error) // apenas no servidor
  return Response.json(
    { error: 'Ocorreu um erro interno. Tente novamente.' },
    { status: 500 }
  )
}
```

### Regras adicionais:
- Nunca usar `JSON.stringify(error)` em respostas ao cliente
- Nunca retornar códigos de status que revelem estrutura interna
  (ex: 404 em recursos autenticados — usar 403 para não confirmar existência)
- Sempre usar try/catch em todas as funções assíncronas de API

---

## 2. XSS — Output Encoding e Proibições

### Regra
Todo dado vindo do banco (nomes, descrições, depoimentos) deve ser tratado
como não confiável ao ser exibido.

### Proibições absolutas:
```typescript
// ❌ NUNCA usar — abre vetor de XSS
<div dangerouslySetInnerHTML={{ __html: animal.descricao }} />
document.innerHTML = dados
eval(qualquerCoisa)
element.innerHTML = dados
```

### Práticas obrigatórias:
```typescript
// ✅ CORRETO — React escapa automaticamente via JSX
<p>{animal.descricao}</p>
<h2>{animal.nome}</h2>

// ✅ Para manipulação DOM direta, usar textContent
element.textContent = dados  // nunca innerHTML
```

### Em campos de texto livre (descrições, depoimentos):
- Sanitizar no servidor antes de salvar no banco
- Usar biblioteca `DOMPurify` se precisar renderizar HTML formatado
- Validar comprimento máximo (ex: descrição máx 2000 chars)

---

## 3. HTTP Security Headers — Configurar no next.config.js

### Implementação obrigatória:
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN' // previne clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff' // previne MIME sniffing
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // unsafe-inline necessário para Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'"
    ].join('; ')
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 4. CORS — Configuração Restritiva

### Regra
Nunca usar `Access-Control-Allow-Origin: *` em rotas que retornam dados
do banco ou aceitam mutações. Definir origem explícita.

### Implementação em API Routes:
```typescript
// lib/cors.ts
export function setCorsHeaders(response: Response, origin: string): Response {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL!, // URL de produção
    'http://localhost:3000'             // apenas em desenvolvimento
  ]

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
```

### Regras adicionais:
- Rotas públicas (listagem de animais): podem ter CORS mais permissivo
- Rotas de escrita (cadastro, edição): CORS restrito à origem do próprio site
- Nunca usar wildcard `*` em rotas autenticadas

---

## 5. Rate Limiting — Formulários e Rotas de Escrita

### Rotas que OBRIGATORIAMENTE precisam de rate limiting:
- `/api/contact` — formulário de contato
- `/api/adoption-interest` — formulário "quero adotar"
- `/api/auth/login` — tentativas de login
- Qualquer rota POST/PUT/DELETE

### Implementação via middleware Next.js:
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true // permitido
  }

  if (record.count >= limit) return false // bloqueado

  record.count++
  return true // permitido
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  if (request.method === 'POST') {
    const allowed = rateLimit(ip, 10, 60 * 1000) // 10 req/min por IP
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## 6. Supabase Auth — Sessão e Tokens

### Problema
O Supabase armazena tokens de sessão em localStorage por padrão.
Um ataque XSS pode roubar esses tokens.

### Configuração obrigatória do cliente Supabase:
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Usar cookies em vez de localStorage
        // O @supabase/ssr faz isso automaticamente
        flowType: 'pkce', // mais seguro que implicit flow
      }
    }
  )
}
```

### Usar obrigatoriamente `@supabase/ssr` (não `@supabase/supabase-js` diretamente)
O pacote SSR gerencia sessão via cookies HttpOnly automaticamente,
evitando exposição do token ao JavaScript do cliente.

### Regras adicionais:
- Renovar sessão após mudança de privilégio (ex: após login)
- Invalidar sessão no logout (chamar `supabase.auth.signOut()`)
- Nunca armazenar tokens em localStorage manualmente
- Configurar expiração de sessão no painel do Supabase (máx 8 horas para área admin)

---

## 7. Upload de Fotos — Proteção Completa

### Regras obrigatórias (além do que está no CLAUDE.md):
```typescript
// app/api/upload/route.ts
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // 1. Validar autenticação ANTES de qualquer processamento
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  // 2. Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'Arquivo muito grande' }, { status: 400 })
  }

  // 3. Validar MIME type real (não confiar no Content-Type do request)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return Response.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
  }

  // 4. SEMPRE gerar nome de arquivo no servidor — nunca usar nome original do usuário
  const fileExt = file.type.split('/')[1]
  const safeFileName = `${crypto.randomUUID()}.${fileExt}`
  const storagePath = `animals/${user.id}/${safeFileName}` // caminho definido pelo servidor

  // 5. Upload com caminho controlado pelo servidor
  const { error } = await supabase.storage
    .from('animal-photos')
    .upload(storagePath, file, { contentType: file.type })

  if (error) {
    console.error('[UPLOAD ERROR]', error)
    return Response.json({ error: 'Falha no upload' }, { status: 500 })
  }

  return Response.json({ path: storagePath })
}
```

---

## 8. Links Externos — Prevenção de Tabnabbing

### Regra
Todo link com `target="_blank"` abre vetor de tabnabbing onde a nova aba
pode redirecionar a aba original via `window.opener`.

### Implementação obrigatória:
```typescript
// ❌ ERRADO
<a href="https://instagram.com/ong" target="_blank">Instagram</a>

// ✅ CORRETO — sempre incluir rel="noopener noreferrer"

  href="https://instagram.com/ong"
  target="_blank"
  rel="noopener noreferrer"
>
  Instagram
</a>
```

### Criar componente reutilizável para links externos:
```typescript
// components/ExternalLink.tsx
export function ExternalLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  )
}
```
Usar `<ExternalLink>` em vez de `<a target="_blank">` em todo o projeto.

---

## 9. Política de Senhas para Equipe da ONG

### Configuração no Supabase Auth (painel):
- Comprimento mínimo: **12 caracteres** (NIST recomenda 15 sem MFA)
- Habilitar confirmação por email obrigatória
- Habilitar proteção contra senhas comprometidas (HaveIBeenPwned)

### No formulário de criação/alteração de senha:
```typescript
function validatePassword(password: string): string | null {
  if (password.length < 12) return 'Senha deve ter no mínimo 12 caracteres'
  if (!/[A-Z]/.test(password)) return 'Senha deve conter ao menos uma letra maiúscula'
  if (!/[0-9]/.test(password)) return 'Senha deve conter ao menos um número'
  return null // válida
}
```

---

## 10. Variáveis de Ambiente — Checklist

### Nunca expor ao cliente (sem NEXT_PUBLIC_):
- `SUPABASE_SERVICE_ROLE_KEY` — chave de admin do Supabase
- Qualquer chave de API de terceiros com permissão de escrita

### Pode expor ao cliente (com NEXT_PUBLIC_):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave pública, segura para expor

### Arquivo .env.example obrigatório no repositório:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```
O arquivo `.env.local` real deve estar no `.gitignore` — NUNCA commitar.
