const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL!,
  'http://localhost:3000',
]

export function setCorsHeaders(response: Response, origin: string): Response {
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
