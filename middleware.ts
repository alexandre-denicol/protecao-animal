import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) return false

  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  // Rate limiting para rotas POST da API
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/')) {
    const allowed = rateLimit(ip, 10, 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }
  }

  // Proteção da área admin via Supabase Auth
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    const response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
}
