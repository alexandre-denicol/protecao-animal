import Link from 'next/link'
import { getPublicAdoptions } from '@/lib/public-adoptions'
import { statePrimaryLinkClass } from '@/components/public/StatePanel'
import AdoptionStory from './AdoptionStory'
import { AdoptionStoriesEmpty, AdoptionStoriesFailure } from './AdoptionStoriesStates'

export default async function AdoptionStories() {
  const { adoptions, failed } = await getPublicAdoptions()

  if (failed) return <div className="mt-8"><AdoptionStoriesFailure /></div>
  if (adoptions.length === 0) return <div className="mt-8"><AdoptionStoriesEmpty /></div>

  return (
    <>
      <ul data-testid="adoption-stories-list" className="mt-8">
        {adoptions.map((adocao, index) => (
          <li key={adocao.id}>
            <AdoptionStory adocao={adocao} index={index} />
          </li>
        ))}
      </ul>

      <section
        aria-labelledby="proxima-historia-titulo"
        className="border-t border-white/10 pt-8 sm:pt-10"
      >
        <h2
          id="proxima-historia-titulo"
          className="font-display text-2xl font-bold tracking-[-0.01em] text-[var(--color-text-main)]"
        >
          Conheça quem espera por um lar
        </h2>
        <p className="mt-2 max-w-[52ch] text-base leading-7 text-[var(--color-text-soft)]">
          Veja os animais disponíveis e registre o seu interesse.
        </p>
        <Link href="/animais" className={`${statePrimaryLinkClass} mt-5`}>
          Ver animais para adoção
        </Link>
      </section>
    </>
  )
}
