const MUTATION_FLAG = 'E2E_ALLOW_MUTATION'

export function assertMutationAllowed(action: string): void {
  if (process.env[MUTATION_FLAG] === 'true') {
    return
  }

  throw new Error(
    `${action} escreve no banco Supabase configurado e foi bloqueado. ` +
      `Confirme que o ambiente é descartável e defina ${MUTATION_FLAG}=true para permitir.`,
  )
}
