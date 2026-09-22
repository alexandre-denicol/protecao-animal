'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import AnimalStatusBadge from '@/components/animals/AnimalStatusBadge'
import Field, { fieldInputClass } from '@/components/forms/Field'
import PhoneNumberField from '@/components/forms/PhoneNumberField'
import { useFocusFirstInvalid } from '@/components/forms/useFocusFirstInvalid'
import { nomeDisplay, nomeOuEsteAnimal } from '@/lib/animal-format'
import { type PhoneCountry, validatePhoneNumber } from '@/lib/whatsapp'
import {
  createAdoptionInterestAction,
  type AdoptionInterestState,
} from './actions'

interface Props {
  animalId: string
  /** Pode ser null: o animal pode ainda não ter nome. */
  animalNome: string | null
  status: 'disponivel' | 'em_processo' | 'adotado'
  whatsappUrl: string | null
}

type View = 'idle' | 'form' | 'sent'

// Altura do header fixo: o CTA logo abaixo dele ainda conta como "fora da tela".
const HEADER_OFFSET_PX = 80
// Se o título focado estiver abaixo desta fração da tela, ele é levado ao topo
// para que o formulário apareça quase inteiro (no desktop ele já está no alto).
const REVEAL_MAX_TOP_RATIO = 0.55
// Altura reservada para a barra fixa: garante que o fim da página (rodapé) e o
// foco por teclado nunca fiquem atrás dela.
const STICKY_CLEARANCE = 'calc(5rem + env(safe-area-inset-bottom))'

function focusAndReveal(element: HTMLElement | null) {
  if (!element) return

  element.focus({ preventScroll: true })

  const { top } = element.getBoundingClientRect()

  if (top < HEADER_OFFSET_PX || top > window.innerHeight * REVEAL_MAX_TOP_RATIO) {
    element.scrollIntoView({ block: 'start' })
  }
}

const primaryButtonClass =
  'inline-flex min-h-[2.75rem] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 focus:outline-offset-[var(--color-surface-1)]'

export default function AdoptionInterestForm({
  animalId,
  animalNome,
  status,
  whatsappUrl,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const formHeadingRef = useRef<HTMLHeadingElement>(null)
  const sentHeadingRef = useRef<HTMLHeadingElement>(null)
  const restoreFocusRef = useRef(false)

  const [view, setView] = useState<View>('idle')
  const [state, setState] = useState<AdoptionInterestState>({})
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('BR')
  const [phoneValue, setPhoneValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isOpenButtonInView, setIsOpenButtonInView] = useState(true)

  const isStickyVisible = view === 'idle' && !isOpenButtonInView

  useFocusFirstInvalid(formRef, state.fieldErrors)

  // Move o foco para onde a interface mudou: título do formulário, título da
  // confirmação, ou de volta ao botão quando o formulário é cancelado.
  useEffect(() => {
    if (view === 'form') {
      focusAndReveal(formHeadingRef.current)
    } else if (view === 'sent') {
      focusAndReveal(sentHeadingRef.current)
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current = false
      openButtonRef.current?.focus()
    }
  }, [view])

  // A barra fixa (mobile) só aparece quando o botão principal saiu da tela.
  useEffect(() => {
    const target = openButtonRef.current

    if (view !== 'idle' || !target || typeof IntersectionObserver === 'undefined') {
      setIsOpenButtonInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsOpenButtonInView(entry.isIntersecting),
      { rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px` },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [view])

  // Enquanto a barra fixa está na tela, abre espaço abaixo do rodapé e no
  // scroll-padding, para que nenhum conteúdo nem foco de teclado fique atrás dela.
  useEffect(() => {
    if (!isStickyVisible) return

    const root = document.documentElement
    const body = document.body
    root.style.scrollPaddingBottom = STICKY_CLEARANCE
    body.style.paddingBottom = STICKY_CLEARANCE

    return () => {
      root.style.scrollPaddingBottom = ''
      body.style.paddingBottom = ''
    }
  }, [isStickyVisible])

  function openForm() {
    setState({})
    setView('form')
  }

  function cancelForm() {
    setState({})
    restoreFocusRef.current = true
    setView('idle')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const phoneError = validatePhoneNumber(phoneValue, phoneCountry, {
      required: false,
      label: 'um telefone',
    })

    if (phoneError) {
      // Só o telefone é validado no cliente: substitui os erros antigos (que o
      // usuário já pode ter corrigido) para o foco ir ao campo realmente inválido.
      setState({ fieldErrors: { telefone: phoneError } })
      return
    }

    startTransition(async () => {
      const result = await createAdoptionInterestAction(formData)
      setState(result)

      if (result.success) {
        setPhoneCountry('BR')
        setPhoneValue('')
        setView('sent')
      }
    })
  }

  return (
    <div className="max-w-xl">
      {view !== 'sent' && status === 'em_processo' && (
        <div
          data-testid="adoption-status-notice"
          className="mb-5 border-l-2 border-[var(--color-primary)] pl-4"
        >
          <p className="text-sm font-bold text-[var(--color-primary)]">Em processo de adoção</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-soft)]">
            Este animal está em processo de adoção. Você ainda pode registrar seu
            interesse e a equipe entrará em contato.
          </p>
        </div>
      )}

      {view === 'idle' && (
        <div>
          <p className="text-sm leading-6 text-[var(--color-text-soft)] sm:text-base sm:leading-7">
            Se este animal combina com a sua rotina, preencha o interesse e fale com
            a equipe. O processo acontece com calma, escuta e acompanhamento.
          </p>
          <button
            ref={openButtonRef}
            type="button"
            data-testid="adoption-open-form"
            onClick={openForm}
            className={`${primaryButtonClass} mt-4 w-full`}
          >
            Quero adotar
          </button>
        </div>
      )}

      {view === 'form' && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="adoption-form-title"
          data-testid="adoption-interest-form"
          className="rounded-2xl bg-white/[0.04] p-4 sm:p-5"
        >
          <input type="hidden" name="animal_id" value={animalId} />

          <div className="mb-5">
            <h2
              id="adoption-form-title"
              ref={formHeadingRef}
              tabIndex={-1}
              className="scroll-mt-24 font-display text-xl font-bold tracking-[-0.01em] text-[var(--color-text-main)] outline-none"
            >
              Quero adotar {nomeOuEsteAnimal(animalNome)}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Conte um pouco sobre você para a nossa equipe continuar a conversa.
            </p>
          </div>

          {state.error && (
            <div
              role="alert"
              className="mb-4 rounded-[var(--radius-button)] border border-salmon-400/40 bg-[rgba(127,29,29,0.22)] px-4 py-3 text-sm text-[#fecaca]"
            >
              {state.error}
            </div>
          )}

          <div className="grid gap-4 sm:gap-5">
            <Field label="Nome" required error={state.fieldErrors?.nome}>
              {(control) => (
                <input
                  {...control}
                  name="nome"
                  type="text"
                  maxLength={100}
                  autoComplete="name"
                  className={fieldInputClass(Boolean(state.fieldErrors?.nome))}
                />
              )}
            </Field>

            <Field label="Email" required error={state.fieldErrors?.email}>
              {(control) => (
                <input
                  {...control}
                  name="email"
                  type="email"
                  maxLength={150}
                  autoComplete="email"
                  className={fieldInputClass(Boolean(state.fieldErrors?.email))}
                />
              )}
            </Field>

            <PhoneNumberField
              label="Telefone"
              name="telefone"
              countryName="telefone_country"
              value={phoneValue}
              country={phoneCountry}
              error={state.fieldErrors?.telefone}
              onValueChange={setPhoneValue}
              onCountryChange={setPhoneCountry}
            />

            <Field label="Mensagem" error={state.fieldErrors?.mensagem}>
              {(control) => (
                <textarea
                  {...control}
                  name="mensagem"
                  rows={4}
                  maxLength={1000}
                  className={`${fieldInputClass(Boolean(state.fieldErrors?.mensagem))} resize-none`}
                />
              )}
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancelForm}
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-[var(--radius-button)] border border-white/20 px-5 py-2.5 text-sm font-semibold text-[var(--color-text-main)] transition duration-200 hover:border-[rgba(244,184,96,0.45)] hover:text-[var(--color-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              data-testid="adoption-submit"
              className={`${primaryButtonClass} gap-2 disabled:opacity-50`}
            >
              {isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
              )}
              Enviar interesse
            </button>
          </div>
        </form>
      )}

      {view === 'sent' && (
        <div
          role="status"
          data-testid="adoption-success"
          className="rounded-2xl bg-[rgba(31,111,107,0.18)] p-5 sm:p-6"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(31,111,107,0.3)] text-[#a7f3d0]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            ref={sentHeadingRef}
            tabIndex={-1}
            className="scroll-mt-24 font-display text-xl font-bold tracking-[-0.01em] text-[#a7f3d0] outline-none"
          >
            Interesse enviado!
          </h2>
          <p className="mt-2 text-sm leading-7 text-white/85">
            Recebemos o seu interesse em adotar {nomeOuEsteAnimal(animalNome)}. Nossa equipe vai entrar
            em contato usando os dados que você informou.
          </p>
          <p className="mt-2 text-sm leading-7 text-white/70">
            O processo acontece com calma, escuta e acompanhamento.
          </p>
          <Link
            href="/animais"
            className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}
          >
            Ver outros animais
          </Link>
        </div>
      )}

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="animal-whatsapp-link"
          className="mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[rgba(31,111,107,0.45)] bg-[rgba(31,111,107,0.18)] px-6 py-3 text-sm font-bold text-[#a7f3d0] transition duration-200 hover:bg-[rgba(31,111,107,0.26)] focus:outline-none focus:ring-2 focus:ring-[rgba(31,111,107,0.3)]"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.6 10.8c.7 1.5 1.9 2.8 3.5 3.5l1.2-1.2c.3-.3.7-.4 1.1-.3 1 .3 2 .4 3 .4.6 0 1 .4 1 1v2.1c0 .6-.4 1-1 1A12.4 12.4 0 0 1 5 4.9c0-.6.4-1 1-1h2.1c.6 0 1 .4 1 1 0 1 .1 2 .4 3 .1.4 0 .8-.3 1.1l-1.2 1.2Z"
            />
          </svg>
          Falar no WhatsApp
        </a>
      )}

      {isStickyVisible && (
        <div
          data-testid="adoption-sticky-cta"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[rgba(13,17,23,0.94)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-bold text-[var(--color-text-main)]">
                {nomeDisplay(animalNome)}
              </p>
              <div className="mt-1">
                <AnimalStatusBadge status={status} />
              </div>
            </div>
            <button
              type="button"
              onClick={openForm}
              className={`${primaryButtonClass} shrink-0`}
            >
              Quero adotar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
