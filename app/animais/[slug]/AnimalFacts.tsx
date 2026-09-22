import { cuidadoLabel } from '@/lib/animal-format'
import type { PublicAnimalDetail } from '@/lib/public-animals'

interface Fact {
  label: string
  value: string
  muted?: boolean
}

function pesoLabel(peso: number): string {
  return `${Number(peso).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} kg`
}

/** Tri-state: "Sim" em destaque, "Não" e "Não informado" em tom neutro (nunca tratados como equivalentes). */
function cuidadoFact(label: string, value: boolean | null): Fact {
  const texto = cuidadoLabel(value)
  return { label, value: texto, muted: texto !== 'Sim' }
}

/** Peso só aparece quando informado; os cuidados sempre aparecem, mesmo quando "não informado". */
function buildFacts(animal: PublicAnimalDetail): Fact[] {
  return [
    ...(animal.peso_kg ? [{ label: 'Peso', value: pesoLabel(animal.peso_kg) }] : []),
    cuidadoFact('Vacinado', animal.vacinado),
    cuidadoFact('Castrado', animal.castrado),
  ]
}

/** Sexo, idade e raça ficam junto ao nome; aqui vão os cuidados e o peso. */
export default function AnimalFacts({
  animal,
  className,
}: {
  animal: PublicAnimalDetail
  className?: string
}) {
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-9 ${className ?? ''}`}>
      {buildFacts(animal).map((fact) => (
        <div
          key={fact.label}
          className="flex flex-col-reverse gap-1 border-l border-[rgba(244,184,96,0.35)] pl-4"
        >
          <dt className="text-sm font-medium text-[var(--color-text-muted)]">{fact.label}</dt>
          <dd
            className={`font-display text-lg font-bold ${
              fact.muted ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-main)]'
            }`}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
