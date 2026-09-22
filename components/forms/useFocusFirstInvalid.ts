import { useEffect, type RefObject } from 'react'

/**
 * Depois de uma validação que falhou, leva o foco ao primeiro campo inválido
 * (aria-invalid="true"). A mensagem de erro é lida junto, via aria-describedby.
 * Chame com o objeto de erros por campo: cada nova falha gera um novo objeto.
 */
export function useFocusFirstInvalid(
  formRef: RefObject<HTMLFormElement>,
  fieldErrors: object | undefined,
) {
  useEffect(() => {
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) return

    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [formRef, fieldErrors])
}
