'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { AnimalFormInput, AnimalFormState, PhotoInput } from '@/app/admin/(protected)/animais/actions'
import type { Animal, AnimalEspecie, AnimalPhoto, AnimalSexo, AnimalStatus } from '@/types'

// ─── Tipos internos ────────────────────────────────────────────────────────────

interface PhotoItem {
  localId: string
  dbId: string | null
  file: File | null
  previewUrl: string
  storageUrl: string
  storagePath: string
  isCover: boolean
  uploading: boolean
  uploadError: string | null
}

type AnimalComFotos = Animal & { fotos?: AnimalPhoto[] }

interface Props {
  mode: 'create' | 'edit'
  animal?: AnimalComFotos
  action: (input: AnimalFormInput) => Promise<AnimalFormState>
}

const MAX_FOTOS = 5

type TriStateValue = 'sim' | 'nao' | 'indefinido'

function boolParaTriState(value: boolean | null | undefined): TriStateValue {
  if (value === true) return 'sim'
  if (value === false) return 'nao'
  return 'indefinido'
}

function triStateParaBool(value: FormDataEntryValue | null): boolean | null {
  if (value === 'sim') return true
  if (value === 'nao') return false
  return null
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-[#fca5a5]">{msg}</p>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 border-b border-white/10 pb-2 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
      {children}
    </h3>
  )
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm text-[var(--color-text-main)] focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
    hasError
      ? 'border-salmon-400 bg-[rgba(248,113,113,0.12)]'
      : 'border-white/10 bg-[rgba(13,17,23,0.56)]'
  }`
}

function labelClass() {
  return 'block text-sm font-semibold text-[var(--color-text-main)]'
}

function isNextRedirectError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('digest' in err)) {
    return false
  }

  return String((err as { digest: unknown }).digest).startsWith('NEXT_REDIRECT')
}

// ─── Controle tri-state (Sim / Não / Não informado) ────────────────────────────

const TRI_STATE_OPTIONS: { value: TriStateValue; label: string }[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'indefinido', label: 'Não informado' },
]

function TriStateField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue: TriStateValue
}) {
  return (
    <div>
      <span className={labelClass()}>{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[rgba(13,17,23,0.56)] p-1"
      >
        {TRI_STATE_OPTIONS.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={defaultValue === option.value}
              className="peer sr-only"
            />
            <span className="block cursor-pointer select-none rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-main)] peer-checked:bg-[var(--color-primary)] peer-checked:text-[#1f1406] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-primary)]">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Seção de Fotos ────────────────────────────────────────────────────────────

function PhotoGrid({
  photos,
  onAdd,
  onRemove,
  onSetCover,
  error,
}: {
  photos: PhotoItem[]
  onAdd: (files: FileList) => void
  onRemove: (localId: string) => void
  onSetCover: (localId: string) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-xs text-[#fca5a5]" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {photos.map((photo) => (
          <div
            key={photo.localId}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
              photo.isCover
                ? 'border-primary-400 shadow-md'
                : 'border-white/10'
            }`}
          >
            {/* Preview */}
            <div className="relative h-full w-full bg-[rgba(255,255,255,0.04)]">
              <Image
                src={photo.previewUrl}
                alt="Foto do animal"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 20vw"
              />
            </div>

            {/* Overlay de loading */}
            {photo.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(13,17,23,0.82)]">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
              </div>
            )}

            {/* Overlay de erro */}
            {photo.uploadError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[rgba(127,29,29,0.82)] p-2 text-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-salmon-600">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.75" fill="currentColor" />
                </svg>
                <span className="text-xs text-[#fecaca]">Erro ao enviar</span>
              </div>
            )}

            {/* Controles — aparecem sempre */}
            {!photo.uploading && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 px-1.5 py-1">
                {/* Radio capa */}
                <button
                  type="button"
                  onClick={() => onSetCover(photo.localId)}
                  title={photo.isCover ? 'Capa selecionada' : 'Definir como capa'}
                  aria-label={photo.isCover ? 'Capa selecionada' : 'Definir como capa'}
                  className={`flex items-center gap-0.5 rounded px-1 py-0.5 text-xs font-semibold transition-colors ${
                    photo.isCover
                      ? 'bg-primary-400 text-white'
                      : 'bg-white/30 text-white hover:bg-white/50'
                  }`}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                    <path d="M6 1L7.35 4.3L11 4.73L8.5 7.14L9.18 10.73L6 9.02L2.82 10.73L3.5 7.14L1 4.73L4.65 4.3L6 1Z" />
                  </svg>
                  Capa
                </button>

                {/* Remover */}
                <button
                  type="button"
                  onClick={() => onRemove(photo.localId)}
                  title="Remover foto"
                  aria-label="Remover foto"
                  className="flex h-5 w-5 items-center justify-center rounded bg-white/30 text-white transition-colors hover:bg-salmon-500"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Slot para adicionar */}
        {photos.length < MAX_FOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/5 text-[var(--color-text-muted)] transition-colors hover:border-primary-300 hover:bg-[rgba(244,184,96,0.12)] hover:text-[var(--color-primary)]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium">Adicionar</span>
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Máximo {MAX_FOTOS} fotos · JPG, PNG ou WebP · até 5 MB cada · A foto marcada com ★ será a capa.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        aria-label="Adicionar fotos"
        onChange={(e) => {
          if (e.target.files?.length) {
            onAdd(e.target.files)
            e.target.value = ''
          }
        }}
      />
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function AnimalForm({ mode, animal, action }: Props) {
  const isEdit = mode === 'edit'
  const fotos = animal?.fotos ?? []

  // Inicializa fotos existentes
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    fotos
      .sort((a, b) => a.ordem - b.ordem)
      .map((f) => ({
        localId: f.id,
        dbId: f.id,
        file: null,
        previewUrl: f.url,
        storageUrl: f.url,
        storagePath: f.storage_path,
        isCover: f.is_cover,
        uploading: false,
        uploadError: null,
      }))
  )

  const originalPhotoIds = fotos.map((f) => f.id)

  const [isPending, setIsPending] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [especieSelecionada, setEspecieSelecionada] = useState<AnimalEspecie | ''>(
    animal?.especie ?? ''
  )

  // ─── Handlers de fotos ──────────────────────────────────────────────────────

  function handleAddFiles(files: FileList) {
    const slots = MAX_FOTOS - photos.length
    if (slots <= 0) return

    const toAdd = Array.from(files).slice(0, slots)
    const newItems: PhotoItem[] = toAdd.map((file) => ({
      localId: `new-${Date.now()}-${Math.random()}`,
      dbId: null,
      file,
      previewUrl: URL.createObjectURL(file),
      storageUrl: '',
      storagePath: '',
      isCover: photos.length === 0 && toAdd.indexOf(file) === 0,
      uploading: false,
      uploadError: null,
    }))

    setPhotos((prev) => {
      // Se não há foto de capa e estamos adicionando a primeira
      const hasCover = prev.some((p) => p.isCover)
      return [
        ...prev,
        ...newItems.map((item, i) => ({
          ...item,
          isCover: !hasCover && i === 0,
        })),
      ]
    })
  }

  function handleRemove(localId: string) {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.localId !== localId)
      // Se removeu a capa, define a primeira como capa automaticamente
      const hasCover = filtered.some((p) => p.isCover)
      if (!hasCover && filtered.length > 0) {
        return filtered.map((p, i) => ({ ...p, isCover: i === 0 }))
      }
      return filtered
    })
  }

  function handleSetCover(localId: string) {
    setPhotos((prev) =>
      prev.map((p) => ({ ...p, isCover: p.localId === localId }))
    )
  }

  // ─── Upload ──────────────────────────────────────────────────────────────────

  async function uploadPendingPhotos(items: PhotoItem[]): Promise<PhotoItem[]> {
    const results = [...items]

    for (let i = 0; i < results.length; i++) {
      const photo = results[i]
      if (photo.storageUrl || !photo.file) continue // já enviada ou existente

      // Marcar como loading
      results[i] = { ...results[i], uploading: true, uploadError: null }
      setPhotos([...results])

      const fd = new FormData()
      fd.append('file', photo.file)
      fd.append('bucket', 'animal-photos')

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = (await res.json()) as { url?: string; path?: string; error?: string }

        if (!res.ok || json.error) {
          results[i] = {
            ...results[i],
            uploading: false,
            uploadError: json.error ?? 'Erro ao enviar.',
          }
        } else {
          results[i] = {
            ...results[i],
            uploading: false,
            storageUrl: json.url ?? '',
            storagePath: json.path ?? '',
            uploadError: null,
          }
        }
      } catch {
        results[i] = {
          ...results[i],
          uploading: false,
          uploadError: 'Erro de conexão.',
        }
      }

      setPhotos([...results])
    }

    return results
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return

    const form = e.currentTarget

    setIsPending(true)
    setGlobalError(null)
    setFieldErrors({})

    try {
      // 1. Fazer upload das fotos pendentes
      const updatedPhotos = await uploadPendingPhotos(photos)
      setPhotos(updatedPhotos)

      const failedUploads = updatedPhotos.filter((p) => p.uploadError)
      if (failedUploads.length > 0) {
        setFieldErrors({ photos: `Corrija os erros de upload antes de salvar (${failedUploads.length} foto${failedUploads.length > 1 ? 's' : ''} com falha).` })
        return
      }

      // 2. Montar input da action
      const fd = new FormData(form)

      const numOrNull = (name: string): number | null => {
        const v = (fd.get(name) as string | null)?.trim()
        if (!v) return null
        const n = Number(v)
        return Number.isFinite(n) ? n : null
      }

      const photosInput: PhotoInput[] = updatedPhotos.map((p, i) => ({
        dbId: p.dbId ?? undefined,
        storageUrl: p.storageUrl,
        storagePath: p.storagePath,
        isCover: p.isCover,
        ordem: i,
      }))

      const especieValue = fd.get('especie') as AnimalEspecie
      const especieDetalheRaw = (fd.get('especie_detalhe') as string | null)?.trim() || null

      const input: AnimalFormInput = {
        nome: (fd.get('nome') as string | null)?.trim() || null,
        especie: especieValue,
        especie_detalhe: especieValue === 'outro' ? especieDetalheRaw : null,
        raca: (fd.get('raca') as string | null)?.trim() || null,
        idade_anos: numOrNull('idade_anos'),
        idade_meses: numOrNull('idade_meses'),
        idade_estimada: fd.get('idade_estimada') === 'on',
        sexo: (fd.get('sexo') as AnimalSexo) ?? 'macho',
        peso_kg: numOrNull('peso_kg'),
        vacinado: triStateParaBool(fd.get('vacinado')),
        castrado: triStateParaBool(fd.get('castrado')),
        temperamento: (fd.get('temperamento') as string | null)?.trim() || null,
        descricao: (fd.get('descricao') as string | null)?.trim() || null,
        status: (fd.get('status') as AnimalStatus) ?? 'disponivel',
        destaque: fd.get('destaque') === 'on',
        photos: photosInput,
        originalPhotoIds,
      }

      // 3. Chamar a server action
      const result = await action(input)

      if (result?.error) {
        setGlobalError(result.error)
      } else if (result?.fieldErrors) {
        setFieldErrors(result.fieldErrors)
        if (result.fieldErrors.photos) {
          setFieldErrors((prev) => ({ ...prev, photos: result.fieldErrors!.photos }))
        }
      }
    } catch (err: unknown) {
      if (isNextRedirectError(err)) {
        throw err
      }

      setGlobalError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setIsPending(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="admin-animal-form" className="space-y-8">
      {/* Erro global */}
      {globalError && (
        <div
          role="alert"
          className="rounded-xl border border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] px-4 py-3 text-sm text-[#fca5a5]"
        >
          {globalError}
        </div>
      )}

      {/* ── Identidade ── */}
      <section>
        <SectionTitle>Identidade</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Nome */}
          <div className="sm:col-span-2">
            <label htmlFor="nome" className={labelClass()}>
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              maxLength={100}
              defaultValue={animal?.nome ?? ''}
              placeholder="Ex: Bolinha — deixe em branco se ainda não tem nome"
              className={inputClass(Boolean(fieldErrors.nome))}
            />
            <FieldError msg={fieldErrors.nome} />
          </div>

          {/* Espécie */}
          <div>
            <label htmlFor="especie" className={labelClass()}>
              Espécie <span className="text-salmon-500">*</span>
            </label>
            <select
              id="especie"
              name="especie"
              required
              defaultValue={animal?.especie ?? ''}
              onChange={(e) => setEspecieSelecionada(e.target.value as AnimalEspecie)}
              className={inputClass(Boolean(fieldErrors.especie))}
            >
              <option value="">Selecione…</option>
              <option value="gato">Gato</option>
              <option value="cao">Cão</option>
              <option value="outro">Outro</option>
            </select>
            <FieldError msg={fieldErrors.especie} />
          </div>

          {/* Sexo */}
          <div>
            <label htmlFor="sexo" className={labelClass()}>
              Sexo <span className="text-salmon-500">*</span>
            </label>
            <select
              id="sexo"
              name="sexo"
              required
              defaultValue={animal?.sexo ?? ''}
              className={inputClass(Boolean(fieldErrors.sexo))}
            >
              <option value="">Selecione…</option>
              <option value="macho">Macho</option>
              <option value="femea">Fêmea</option>
              <option value="nao_identificado">Não identificado</option>
            </select>
            <FieldError msg={fieldErrors.sexo} />
          </div>

          {/* Qual espécie? — só quando "Outro" está selecionado */}
          {especieSelecionada === 'outro' && (
            <div className="sm:col-span-2">
              <label htmlFor="especie_detalhe" className={labelClass()}>
                Qual espécie? <span className="text-salmon-500">*</span>
              </label>
              <input
                id="especie_detalhe"
                name="especie_detalhe"
                type="text"
                maxLength={60}
                defaultValue={animal?.especie_detalhe ?? ''}
                placeholder="Ex: Coelho, Ave, Porquinho-da-índia…"
                className={inputClass(Boolean(fieldErrors.especie_detalhe))}
              />
              <FieldError msg={fieldErrors.especie_detalhe} />
            </div>
          )}

          {/* Raça */}
          <div className="sm:col-span-2">
            <label htmlFor="raca" className={labelClass()}>
              Raça
            </label>
            <input
              id="raca"
              name="raca"
              type="text"
              defaultValue={animal?.raca ?? ''}
              placeholder="Ex: SRD, Persa, Labrador…"
              className={inputClass()}
            />
          </div>
        </div>
      </section>

      {/* ── Fotos ── */}
      <section>
        <SectionTitle>Fotos</SectionTitle>
        <PhotoGrid
          photos={photos}
          onAdd={handleAddFiles}
          onRemove={handleRemove}
          onSetCover={handleSetCover}
          error={fieldErrors.photos}
        />
      </section>

      {/* ── Personalidade e descrição ── */}
      <section>
        <SectionTitle>Personalidade e descrição</SectionTitle>
        <div className="space-y-5">
          <div>
            <label htmlFor="temperamento" className={labelClass()}>
              Temperamento
            </label>
            <input
              id="temperamento"
              name="temperamento"
              type="text"
              maxLength={200}
              defaultValue={animal?.temperamento ?? ''}
              placeholder="Ex: Brincalhão, carinhoso, tímido com estranhos…"
              className={inputClass()}
            />
          </div>

          <div>
            <label htmlFor="descricao" className={labelClass()}>
              Descrição completa
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={6}
              maxLength={2000}
              defaultValue={animal?.descricao ?? ''}
              placeholder="Conte a história deste animal, sua personalidade, o que busca em um novo lar…"
              className={`${inputClass()} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* ── Idade e peso ── */}
      <section>
        <SectionTitle>Idade e peso</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="idade_anos" className={labelClass()}>
              Idade (anos)
            </label>
            <input
              id="idade_anos"
              name="idade_anos"
              type="number"
              min={0}
              max={30}
              step={1}
              defaultValue={animal?.idade_anos ?? ''}
              placeholder="Ex: 2"
              className={inputClass(Boolean(fieldErrors.idade_anos))}
            />
            <FieldError msg={fieldErrors.idade_anos} />
          </div>

          <div>
            <label htmlFor="idade_meses" className={labelClass()}>
              Meses complementares
            </label>
            <input
              id="idade_meses"
              name="idade_meses"
              type="number"
              min={0}
              max={11}
              step={1}
              defaultValue={animal?.idade_meses ?? ''}
              placeholder="Ex: 6"
              className={inputClass(Boolean(fieldErrors.idade_meses))}
            />
            <FieldError msg={fieldErrors.idade_meses} />
          </div>

          <div>
            <label htmlFor="peso_kg" className={labelClass()}>
              Peso (kg)
            </label>
            <input
              id="peso_kg"
              name="peso_kg"
              type="number"
              min={0.1}
              max={150}
              step={0.1}
              defaultValue={animal?.peso_kg ?? ''}
              placeholder="Ex: 4.5"
              className={inputClass(Boolean(fieldErrors.peso_kg))}
            />
            <FieldError msg={fieldErrors.peso_kg} />
          </div>

          <div className="sm:col-span-3">
            <label className="flex cursor-pointer items-center gap-2.5 select-none">
              <input
                type="checkbox"
                name="idade_estimada"
                defaultChecked={animal?.idade_estimada ?? false}
                className="h-4 w-4 rounded border-neutral-300 accent-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <span className="text-sm font-semibold text-[var(--color-text-main)]">
                Idade é uma estimativa (não exata)
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* ── Cuidados ── */}
      <section>
        <SectionTitle>Cuidados</SectionTitle>
        <div className="flex flex-wrap gap-8">
          <TriStateField
            name="vacinado"
            label="Vacinado"
            defaultValue={boolParaTriState(animal?.vacinado)}
          />
          <TriStateField
            name="castrado"
            label="Castrado / Castrada"
            defaultValue={boolParaTriState(animal?.castrado)}
          />
        </div>
      </section>

      {/* ── Publicação ── */}
      <section>
        <SectionTitle>Publicação</SectionTitle>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex-1">
            <label htmlFor="status" className={labelClass()}>
              Status <span className="text-salmon-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={animal?.status ?? 'disponivel'}
              className={inputClass(Boolean(fieldErrors.status))}
            >
              <option value="disponivel">Disponível para adoção</option>
              <option value="em_processo">Em processo de adoção</option>
              <option value="adotado">Adotado</option>
            </select>
            <FieldError msg={fieldErrors.status} />
          </div>

          <label className="mt-0 flex cursor-pointer items-center gap-2.5 pt-7 select-none sm:mt-0">
            <input
              type="checkbox"
              name="destaque"
              defaultChecked={animal?.destaque ?? false}
              className="h-4 w-4 rounded border-neutral-300 accent-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <span className="text-sm font-semibold text-[var(--color-text-main)]">
              Destaque na página inicial
            </span>
          </label>
        </div>
      </section>

      {/* ── Ações ── */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/admin/animais"
          className="admin-button-muted"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          data-testid="admin-animal-submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 disabled:opacity-50"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {isEdit ? 'Salvar alterações' : 'Cadastrar animal'}
        </button>
      </div>
    </form>
  )
}
