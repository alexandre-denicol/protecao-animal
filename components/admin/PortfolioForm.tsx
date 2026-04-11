'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { PortfolioFormState } from '@/app/admin/(protected)/portfolio/actions'
import type { Animal, Adoption } from '@/types'

interface Props {
  action: (prev: PortfolioFormState, data: FormData) => Promise<PortfolioFormState>
  animais: Pick<Animal, 'id' | 'nome'>[]
  adocao?: Adoption
}

export default function PortfolioForm({ action, animais, adocao }: Props) {
  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<PortfolioFormState>({})

  const [preview, setPreview] = useState<string | null>(adocao?.foto_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fotoUrl, setFotoUrl] = useState<string>(adocao?.foto_url ?? '')
  const [storagePath, setStoragePath] = useState<string>(adocao?.storage_path ?? '')

  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'adoption-photos')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = (await res.json()) as { url?: string; path?: string; error?: string }

      if (!res.ok || json.error) {
        setUploadError(json.error ?? 'Erro ao enviar foto.')
        setPreview(adocao?.foto_url ?? null)
        setFotoUrl(adocao?.foto_url ?? '')
        setStoragePath(adocao?.storage_path ?? '')
      } else {
        setFotoUrl(json.url ?? '')
        setStoragePath(json.path ?? '')
      }
    } catch {
      setUploadError('Erro de conexão ao enviar a foto.')
      setPreview(adocao?.foto_url ?? null)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending || uploading) return

    setIsPending(true)
    setState({})

    const formData = new FormData(e.currentTarget)
    formData.set('foto_url', fotoUrl)
    formData.set('storage_path', storagePath)

    try {
      const result = await action({}, formData)
      if (result && (result.error || result.fieldErrors)) {
        setState(result)
      }
      // Se não retornou erro, o action fez redirect — não há mais nada a fazer
    } catch {
      setState({ error: 'Ocorreu um erro inesperado. Tente novamente.' })
    } finally {
      setIsPending(false)
    }
  }

  const isEditing = Boolean(adocao)

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Erro global */}
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] px-4 py-3 text-sm text-[#fca5a5]"
        >
          {state.error}
        </div>
      )}

      {/* Animal */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="animal_id" className="admin-label mb-1">
            Animal cadastrado
          </label>
          <select
            id="animal_id"
            name="animal_id"
            defaultValue={adocao?.animal_id ?? ''}
            className="admin-select"
          >
            <option value="">— Não vinculado —</option>
            {animais.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="animal_nome" className="admin-label mb-1">
            Nome do animal <span className="text-salmon-500">*</span>
          </label>
          <input
            id="animal_nome"
            name="animal_nome"
            type="text"
            required
            defaultValue={adocao?.animal_nome ?? ''}
            placeholder="Ex: Bolinha"
            className={`rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
              state.fieldErrors?.animal_nome
                ? 'border-salmon-400 bg-[rgba(248,113,113,0.12)]'
                : 'border-white/10 bg-[rgba(13,17,23,0.56)]'
            }`}
          />
          {state.fieldErrors?.animal_nome && (
            <p className="text-xs text-[#fca5a5]">{state.fieldErrors.animal_nome}</p>
          )}
        </div>
      </div>

      {/* Adotante e Data */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="adotante_nome" className="admin-label mb-1">
            Nome do adotante
          </label>
          <input
            id="adotante_nome"
            name="adotante_nome"
            type="text"
            defaultValue={adocao?.adotante_nome ?? ''}
            placeholder="Ex: Maria Silva"
            className="admin-input"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="data_adocao" className="admin-label mb-1">
            Data da adoção <span className="text-salmon-500">*</span>
          </label>
          <input
            id="data_adocao"
            name="data_adocao"
            type="date"
            required
            defaultValue={adocao?.data_adocao?.slice(0, 10) ?? ''}
            className={`rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
              state.fieldErrors?.data_adocao
                ? 'border-salmon-400 bg-[rgba(248,113,113,0.12)]'
                : 'border-white/10 bg-[rgba(13,17,23,0.56)]'
            }`}
          />
          {state.fieldErrors?.data_adocao && (
            <p className="text-xs text-[#fca5a5]">{state.fieldErrors.data_adocao}</p>
          )}
        </div>
      </div>

      {/* Foto */}
      <div className="flex flex-col gap-1.5">
        <span className="admin-label mb-1">Foto</span>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {preview ? (
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)]">
              <Image src={preview} alt="Preview da foto" fill className="object-cover" />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(13,17,23,0.72)]">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[var(--color-text-muted)]"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M3 15L8 10L12 14L16 10L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="admin-button-muted disabled:opacity-50"
            >
              {uploading ? 'Enviando…' : 'Escolher foto'}
            </button>
            <p className="text-xs text-[var(--color-text-muted)]">JPG, PNG ou WebP. Máximo 5 MB.</p>
            {uploadError && <p className="text-xs text-[#fca5a5]">{uploadError}</p>}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Selecionar foto"
        />
      </div>

      {/* Depoimento */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="depoimento" className="admin-label mb-1">
          Depoimento do adotante
        </label>
        <textarea
          id="depoimento"
          name="depoimento"
          rows={4}
          defaultValue={adocao?.depoimento ?? ''}
          placeholder="Escreva aqui o depoimento do adotante sobre a experiência de adoção…"
          className="admin-textarea resize-none"
        />
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href="/admin/portfolio"
          className="admin-button-muted"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 disabled:opacity-50"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {isEditing ? 'Salvar alterações' : 'Publicar caso'}
        </button>
      </div>
    </form>
  )
}
