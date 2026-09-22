import { nomeOuEsteAnimal } from '@/lib/animal-format'
import type { PublicAnimalDetail } from '@/lib/public-animals'

const headingClass =
  'font-display font-bold tracking-[-0.01em] text-[var(--color-text-main)]'

function StoryBlock({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h2 className={`${headingClass} text-xl`}>{title}</h2>
      <p className="mt-2 text-base leading-7 text-[var(--color-text-soft)]">{children}</p>
    </div>
  )
}

/** Texto escrito pela equipe, exibido como veio: descrição em destaque, temperamento em apoio. */
export default function AnimalStory({
  animal,
  className,
}: {
  animal: PublicAnimalDetail
  className?: string
}) {
  const { descricao, temperamento } = animal

  if (!descricao && !temperamento) return null

  return (
    <div className={`border-t border-white/10 pt-8 ${className ?? ''}`}>
      {descricao && (
        <div>
          <h2 className={`${headingClass} text-2xl sm:text-3xl`}>
            Sobre {nomeOuEsteAnimal(animal.nome)}
          </h2>
          <p className="mt-4 max-w-[62ch] whitespace-pre-line text-base leading-8 text-[var(--color-text-soft)] sm:text-lg sm:leading-8">
            {descricao}
          </p>
        </div>
      )}

      {temperamento && (
        <div className={descricao ? 'mt-8' : ''}>
          <StoryBlock title="Temperamento">{temperamento}</StoryBlock>
        </div>
      )}
    </div>
  )
}
