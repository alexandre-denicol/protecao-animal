import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AnimalStatusBadge from '@/components/animals/AnimalStatusBadge'
import { homeDisplayFont } from '@/components/home/home-font'
import {
  especieLabel,
  fotoAlt,
  idadeLabel,
  mensagemWhatsappInteresse,
  nomeDisplay,
  nomeOuEsteAnimal,
  sexoLabel,
  tituloParaAdocao,
} from '@/lib/animal-format'
import { getAnimalBySlug, type PublicAnimalDetail } from '@/lib/public-animals'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import AdoptionInterestForm from './AdoptionInterestForm'
import AnimalFacts from './AnimalFacts'
import AnimalGallery from './AnimalGallery'
import AnimalStory from './AnimalStory'

interface PageProps {
  params: {
    slug: string
  }
}

const SITE_NAME = 'Associação Amiga Miau'
const DESCRIPTION_MAX_LENGTH = 160

function buildDescription(animal: PublicAnimalDetail): string {
  const descricao = animal.descricao?.replace(/\s+/g, ' ').trim()

  if (!descricao) {
    return `Conheça ${nomeOuEsteAnimal(animal.nome)}, ${especieLabel(animal.especie, animal.especie_detalhe).toLowerCase()} em busca de um lar na ${SITE_NAME}.`
  }

  return descricao.length > DESCRIPTION_MAX_LENGTH
    ? `${descricao.slice(0, DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`
    : descricao
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

  const title = tituloParaAdocao(animal.nome)
  const description = buildDescription(animal)
  const coverPhoto = animal.photos[0] ?? null
  const images = coverPhoto
    ? [{ url: coverPhoto.url, alt: fotoAlt(animal.nome) }]
    : undefined

  // openGraph/twitter substituem (não mesclam com) os do layout raiz,
  // por isso siteName e locale são repetidos aqui.
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Amiga Miau`,
      description,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: `${title} | Amiga Miau`,
      description,
      images: images?.map((image) => image.url),
    },
  }
}

/** Espécie, sexo, idade e raça numa linha; idade só quando a equipe a informou. */
function buildIdentityLine(animal: PublicAnimalDetail): string {
  const temIdade = (animal.idade_anos ?? 0) > 0 || (animal.idade_meses ?? 0) > 0

  return [
    especieLabel(animal.especie, animal.especie_detalhe),
    sexoLabel(animal.sexo),
    temIdade ? idadeLabel(animal.idade_anos, animal.idade_meses, animal.idade_estimada) : null,
    animal.raca?.trim() || null,
  ]
    .filter(Boolean)
    .join(' · ')
}

const seta = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13 8H3M3 8L7.5 3.5M3 8L7.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default async function AnimalDetalhePage({ params }: PageProps) {
  const [animal, settings] = await Promise.all([
    getAnimalBySlug(params.slug),
    getPublicSiteSettings(),
  ])

  if (!animal) {
    notFound()
  }

  const animalWhatsappLink = buildWhatsAppUrl(
    settings.whatsapp_numero,
    mensagemWhatsappInteresse(animal.nome),
  )

  return (
    <div
      data-testid="animal-detail-page"
      className={`${homeDisplayFont.variable} mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8`}
    >
      <Link
        href="/animais"
        className="-ml-1 inline-flex min-h-[2.75rem] items-center gap-2 rounded-[var(--radius-button)] px-1 text-sm font-semibold text-[var(--color-primary)] transition duration-200 hover:text-[var(--color-primary-hover)]"
      >
        {seta}
        Voltar para animais
      </Link>

      {/* Mobile: foto, identidade e adoção, história. Desktop: história desce para a coluna da foto. */}
      <div className="mt-2 grid gap-x-12 gap-y-6 lg:gap-y-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <AnimalGallery
          photos={animal.photos.map(({ id, url }) => ({ id, url }))}
          animalNome={animal.nome}
          className="lg:col-start-1 lg:row-start-1"
        />

        <section className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <AnimalStatusBadge status={animal.status} />

          <h1 className="mt-3 text-balance break-words font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.025em] text-[var(--color-text-main)] sm:text-4xl lg:text-5xl">
            <span data-testid="animal-detail-name">{nomeDisplay(animal.nome)}</span>
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-soft)] sm:text-lg">
            {buildIdentityLine(animal)}
          </p>

          {animal.status !== 'adotado' && (
            <div className="mt-6">
              <AdoptionInterestForm
                animalId={animal.id}
                animalNome={animal.nome}
                status={animal.status}
                whatsappUrl={animalWhatsappLink}
              />
            </div>
          )}

          <AnimalFacts animal={animal} className="mt-8" />
        </section>

        <AnimalStory animal={animal} className="lg:col-start-1 lg:row-start-2 lg:self-start" />
      </div>
    </div>
  )
}
