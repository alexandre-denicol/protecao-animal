export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${uniqueSuffix()}@example.com`
}

export function uniqueName(prefix: string): string {
  return `${prefix} ${uniqueSuffix()}`
}
