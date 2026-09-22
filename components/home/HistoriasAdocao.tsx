import Image from 'next/image'
import Link from 'next/link'
import {
  formatAdoptionMonth,
  getRecentPublicAdoptions,
  type PublicAdoption,
} from '@/lib/public-adoptions'
import SectionHeading from '@/components/public/SectionHeading'

function HistoriaAdocao({ adocao }: { adocao: PublicAdoption }) {
  const depoimento = adocao.depoimento?.trim()
  const adotante = adocao.adotante_nome?.trim()
  const mesAno = formatAdoptionMonth(adocao.data_adocao)

  return (
    <article className="flex flex-col gap-4">
      {adocao.foto_url && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-2)]">
          <Image
            src={adocao.foto_url}
            alt={`Foto da adoção de ${adocao.animal_nome}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div>
        <h3 className="font-display tracking-[-0.01em] text-xl font-bold text-[var(--color-text-main)]">
          {adocao.animal_nome}
        </h3>
        {mesAno && (
          <p className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
            <time dateTime={adocao.data_adocao}>Adotado(a) em {mesAno}</time>
          </p>
        )}
        {depoimento && (
          <figure className="mt-3">
            <blockquote className="text-base leading-7 text-[var(--color-text-soft)]">
              “{depoimento}”
            </blockquote>
            {adotante && (
              <figcaption className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
                {adotante}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </article>
  )
}

export default async function HistoriasAdocao() {
  const adocoes = await getRecentPublicAdoptions()

  if (adocoes.length === 0) return null

  return (
    <section
      aria-labelledby="historias-adocao-titulo"
      className="py-10 sm:py-14"
      data-testid="adoption-stories-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="historias-adocao-titulo"
          eyebrow="Resultados reais"
          title="Histórias de adoção"
        />
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {adocoes.map((adocao) => (
            <HistoriaAdocao key={adocao.id} adocao={adocao} />
          ))}
        </div>

        <Link
          href="/adocoes"
          className="-ml-1 mt-8 inline-flex items-center gap-2 rounded-[var(--radius-button)] px-1 py-2 text-sm font-semibold text-[var(--color-primary)] transition duration-200 hover:text-[var(--color-primary-hover)]"
        >
          Ver todas as histórias
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
