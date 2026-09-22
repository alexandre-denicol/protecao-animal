import Image from 'next/image'
import { formatAdoptionMonth, type PublicAdoption } from '@/lib/public-adoptions'

interface AdoptionStoryProps {
  adocao: PublicAdoption
  /** Posição na lista: define o lado da foto (alternado) e a prioridade de carga. */
  index: number
}

// Classes completas (não montadas por interpolação) para o Tailwind enxergá-las.
const layout = {
  photo: { left: 'md:col-start-1', right: 'md:col-start-8' },
  // O respiro fica só do lado da foto, para o texto alinhar com o resto da página.
  textBesidePhoto: {
    left: 'md:col-span-7 md:col-start-6 md:pl-6 lg:pl-8',
    right: 'md:col-span-7 md:col-start-1 md:pr-6 lg:pr-8',
  },
  textAlone: 'md:col-span-8 md:col-start-1',
} as const

/**
 * Uma adoção, só com o que a equipe registrou: foto, data, nome, depoimento e
 * quem o assina. O que faltar simplesmente não aparece (sem foto inventada).
 */
export default function AdoptionStory({ adocao, index }: AdoptionStoryProps) {
  const depoimento = adocao.depoimento?.trim()
  const adotante = adocao.adotante_nome?.trim()
  const mesAno = formatAdoptionMonth(adocao.data_adocao)
  const side = index % 2 === 0 ? 'left' : 'right'
  const isBrief = !adocao.foto_url && !depoimento

  return (
    <article
      data-testid="adoption-story"
      className={`grid gap-x-4 gap-y-5 border-t border-white/10 md:grid-cols-12 md:items-center ${
        isBrief ? 'py-5' : 'py-8 sm:py-10'
      }`}
    >
      {adocao.foto_url && (
        <div
          className={`relative aspect-[3/2] overflow-hidden rounded-2xl bg-[var(--color-surface-2)] ring-1 ring-white/10 md:col-span-5 md:row-start-1 md:aspect-[4/3] ${layout.photo[side]}`}
        >
          <Image
            src={adocao.foto_url}
            alt={`Foto da adoção de ${adocao.animal_nome}`}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      )}

      <div
        className={`min-w-0 md:row-start-1 ${
          adocao.foto_url ? layout.textBesidePhoto[side] : layout.textAlone
        }`}
      >
        {mesAno && (
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            <time dateTime={adocao.data_adocao}>Adotado(a) em {mesAno}</time>
          </p>
        )}

        <h2 className="mt-1 text-balance break-words font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--color-text-main)] sm:text-3xl">
          {adocao.animal_nome}
        </h2>

        {depoimento && (
          <figure className="mt-4">
            <blockquote className="max-w-[54ch] whitespace-pre-line break-words font-display text-lg font-semibold leading-8 text-[var(--color-text-main)] sm:text-xl sm:leading-9">
              “{depoimento}”
            </blockquote>
            {adotante && (
              <figcaption className="mt-3 break-words text-sm font-semibold text-[var(--color-text-muted)]">
                — {adotante}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </article>
  )
}
