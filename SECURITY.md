# 🔐 Security Policy & Guidelines

This document defines the security standards and best practices applied to this project.

It is tailored for a modern fullstack architecture using:
- Next.js 14 (App Router)
- Supabase (Auth, Database, Storage)
- Vercel (deployment)

All contributors must follow these guidelines when working with authentication, APIs, forms, file uploads, and user data.

---

## 1. Error Handling

### Rule
Never expose internal errors to the client.

### Incorrect
```ts
return Response.json({ error: error.message }, { status: 500 })
```

### Correct
```ts
console.error('[INTERNAL ERROR]', error)

return Response.json(
  { error: 'An unexpected error occurred. Please try again.' },
  { status: 500 }
)
```

### Requirements
- Never return raw error messages
- Never expose stack traces
- Always use try/catch in async operations

---

## 2. XSS Protection

### Rule
All data must be treated as untrusted.

### Forbidden
- dangerouslySetInnerHTML
- element.innerHTML = data
- eval(...)

### Correct
```ts
<p>{data}</p>
element.textContent = data
```

### Additional
- Sanitize input on the server when needed
- Use DOMPurify if rendering HTML
- Enforce input size limits

---

## 3. HTTP Security Headers

Configured via next.config.js.

Includes:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Content-Security-Policy

### Goal
Prevent clickjacking, MIME sniffing, and XSS vectors.

---

## 4. CORS Policy

### Rule
Never use wildcard origins (*) on sensitive routes.

### Guidelines
- Public endpoints → controlled access
- Authenticated routes → restricted origin
- Use environment-based allowlist

---

## 5. Rate Limiting

### Required for:
- Forms (contact, adoption, membership)
- Authentication routes
- All write operations

### Strategy
- IP-based limiting
- Time window enforcement
- Return 429 when exceeded

---

## 6. Authentication (Supabase)

### Requirements
- Use @supabase/ssr (cookie-based sessions)
- Avoid localStorage for tokens
- Use PKCE flow

### Rules
- Never expose service role keys
- Validate user on server
- Invalidate sessions on logout
- Set session expiration (recommended: ≤ 8h for admin)

---

## 7. File Upload Security

### Requirements
- Max size: 5MB
- Allowed types: jpeg, png, webp
- Generate filenames on server (UUID)
- Validate authentication before processing

### Never
- Trust user filenames
- Trust Content-Type blindly

---

## 8. External Links

### Rule
Prevent tabnabbing.

### Always use
```html
target="_blank" rel="noopener noreferrer"
```

---

## 9. Password Policy

### Requirements
- Minimum length: 12 characters
- Must include uppercase letter
- Must include number

### Recommended
- Email confirmation required
- Breached password protection enabled

---

## 10. Environment Variables

### Never expose
- SUPABASE_SERVICE_ROLE_KEY
- Any sensitive API key

### Public variables
- NEXT_PUBLIC_*

### Rules
- .env.local must NOT be committed
- .env.example must not contain real values

---

## 11. Logging Policy

### Rules
- Do not log full emails or personal data
- Mask sensitive fields
- Log only necessary information

---

## 12. General Principles

- Validate all inputs (client and server)
- Apply least privilege principle
- Avoid unnecessary data exposure
- Prefer server-side execution for sensitive logic
- Keep dependencies updated

---

## Summary

This project follows modern security practices suitable for production environments.

All contributions must respect these guidelines to ensure:
- data integrity
- user privacy
- system reliability
