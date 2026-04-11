import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAnimalBySlug,
  type PublicAnimalDetail,
} from '@/lib/public-animals'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import AdoptionInterestForm from './AdoptionInterestForm'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const animal = await getAnimalBySlug(params.slug)

  if (!animal) {
    return {
      title: 'Animal não encontrado',
    }
  }

  return {
    title: `${animal.nome} para adoção`,
    description:
      animal.descricao ?? `Conheça ${animal.nome}, disponível para adoção.`,
  }
}

function especieLabel(especie: PublicAnimalDetail['especie']): string {
  return especie === 'cao' ? 'Cão' : 'Gato'
}

function sexoLabel(sexo: PublicAnimalDetail['sexo']): string {
  return sexo === 'femea' ? 'Fêmea' : 'Macho'
}

function statusLabel(status: PublicAnimalDetail['status']): string {
  if (status === 'em_processo') return 'Em processo'
  if (status === 'adotado') return 'Adotado'
  return 'Disponível'
}

function idadeLabel(anos: number | null, meses: number | null): string {
  const partes: string[] = []

  if (anos && anos > 0) {
    partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`)
  }

  if (meses && meses > 0) {
    partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`)
  }

  return partes.length > 0 ? partes.join(' e ') : 'Idade não informada'
}

function pesoLabel(peso: number | null): string {
  if (!peso) return 'Não informado'
  return `${Number(peso).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} kg`
}

function simNaoLabel(value: boolean): string {
  return value ? 'Sim' : 'Não'
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-white/8 bg-white/5 px-4 py-4">
      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold text-[var(--color-text-main)]">{value}</dd>
    </div>
  )
}

export default async function AnimalDetalhePage({ params }: PageProps) {
  const [animal, settings] = await Promise.all([
    getAnimalBySlug(params.slug),
    getPublicSiteSettings(),
  ])

  if (!animal) {
    notFound()
  }

  const mainPhoto = animal.photos[0] ?? null
  const galleryPhotos = animal.photos.slice(1)
  const animalWhatsappLink = buildWhatsAppUrl(
    settings.whatsapp_numero,
    `Olá! Tenho interesse no animal ${animal.nome}.`,
  )

  return (
    <main
      data-testid="animal-detail-page"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <Link
        href="/animais"
        className="mb-6 inline-flex rounded-[var(--radius-button)] border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--color-text-main)] transition duration-200 hover:border-[rgba(244,184,96,0.24)] hover:text-[var(--color-primary)]"
      >
        Voltar para animais
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-8">
        <section>
          <div className="relative aspect-[4/4.7] overflow-hidden rounded-[24px] border border-white/10 bg-[var(--color-surface-2)] shadow-[var(--shadow-soft)] sm:aspect-[4/4.4] sm:rounded-[28px]">
            {mainPhoto ? (
              <>
                <Image
                  src={mainPhoto.url}
                  alt={`Foto de ${animal.nome}`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,17,23,0.96)] via-[rgba(13,17,23,0.12)] to-transparent" />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--color-text-muted)]">
                Sem foto
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[rgba(244,184,96,0.22)] bg-[rgba(244,184,96,0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                  {statusLabel(animal.status)}
                </span>
                <span className="rounded-full border border-white/10 bg-[rgba(13,17,23,0.62)] px-3 py-1 text-xs font-semibold text-white/82">
                  {especieLabel(animal.especie)}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <span data-testid="animal-detail-name">{animal.nome}</span>
              </h1>
              <p className="mt-2 text-base text-white/72">
                {animal.raca ? `${animal.raca} • ` : ''}
                {idadeLabel(animal.idade_anos, animal.idade_meses)}
              </p>
            </div>
          </div>

          {galleryPhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {galleryPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-[18px] border border-white/10 bg-[var(--color-surface-2)]"
                >
                  <Image
                    src={photo.url}
                    alt={`Foto ${index + 2} de ${animal.nome}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 160px"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[24px] border border-white/10 bg-[rgba(17,24,39,0.84)] p-5 shadow-[var(--shadow-soft)] sm:rounded-[28px] sm:p-6">
          <div className="mb-6 rounded-[var(--radius-card)] border border-[rgba(244,184,96,0.18)] bg-[rgba(244,184,96,0.12)] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-primary)]">
              Encontro responsável
            </p>
            <p className="mt-3 text-sm leading-7 text-white/78">
              Se este animal combina com a sua rotina, preencha o interesse e fale com
              a equipe. O processo acontece com calma, escuta e acompanhamento.
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Idade"
              value={idadeLabel(animal.idade_anos, animal.idade_meses)}
            />
            <InfoItem label="Sexo" value={sexoLabel(animal.sexo)} />
            <InfoItem label="Peso" value={pesoLabel(animal.peso_kg)} />
            <InfoItem label="Vacinado" value={simNaoLabel(animal.vacinado)} />
            <InfoItem label="Castrado" value={simNaoLabel(animal.castrado)} />
            <InfoItem label="Saudável" value={simNaoLabel(animal.saudavel)} />
          </dl>

          {animal.temperamento && (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Temperamento
              </h2>
              <p className="mt-3 text-[var(--color-text-muted)] leading-7">{animal.temperamento}</p>
            </div>
          )}

          {animal.descricao && (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Sobre
              </h2>
              <p className="mt-3 whitespace-pre-line text-[var(--color-text-muted)] leading-7">
                {animal.descricao}
              </p>
            </div>
          )}

          {animal.obs_saude && (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Saúde
              </h2>
              <p className="mt-3 text-[var(--color-text-muted)] leading-7">{animal.obs_saude}</p>
            </div>
          )}

          {animal.status !== 'adotado' && (
            <>
              <AdoptionInterestForm
                animalId={animal.id}
                animalNome={animal.nome}
              />

              {animalWhatsappLink && (
                <a
                  href={animalWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="animal-whatsapp-link"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[rgba(31,111,107,0.45)] bg-[rgba(31,111,107,0.18)] px-6 py-3 text-sm font-bold text-[#a7f3d0] transition duration-200 hover:bg-[rgba(31,111,107,0.26)] focus:outline-none focus:ring-2 focus:ring-[rgba(31,111,107,0.3)]"
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
            </>
          )}
        </section>
      </div>
    </main>
  )
}
