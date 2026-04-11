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
    <div className="rounded-xl bg-neutral-50 px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-neutral-800">{value}</dd>
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
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <Link
        href="/animais"
        className="mb-6 inline-flex text-sm font-semibold text-primary-700 hover:text-primary-800"
      >
        Voltar para animais
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 shadow-md">
            {mainPhoto ? (
              <Image
                src={mainPhoto.url}
                alt={`Foto de ${animal.nome}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-neutral-400">
                Sem foto
              </div>
            )}
          </div>

          {galleryPhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {galleryPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
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

        <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-800">
                <span data-testid="animal-detail-name">{animal.nome}</span>
              </h1>
              <p className="mt-2 text-neutral-500">
                {especieLabel(animal.especie)}
                {animal.raca ? ` • ${animal.raca}` : ''}
              </p>
            </div>

            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
              {statusLabel(animal.status)}
            </span>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Temperamento
              </h2>
              <p className="mt-2 text-neutral-700">{animal.temperamento}</p>
            </div>
          )}

          {animal.descricao && (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Sobre
              </h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700">
                {animal.descricao}
              </p>
            </div>
          )}

          {animal.obs_saude && (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Saúde
              </h2>
              <p className="mt-2 text-neutral-700">{animal.obs_saude}</p>
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
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
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
