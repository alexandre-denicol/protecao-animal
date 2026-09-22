import SectionHeading from '@/components/public/SectionHeading'

const etapas = [
  { titulo: 'Resgate responsável', descricao: 'Cada acolhimento respeita o tempo e as necessidades do animal.' },
  { titulo: 'Cuidado contínuo', descricao: 'Saúde, segurança e bem-estar vêm antes de qualquer adoção.' },
  { titulo: 'Adoção acompanhada', descricao: 'A nova família recebe orientação para uma adaptação tranquila.' },
]

export default function ComoCuidamos() {
  return (
    <section
      aria-labelledby="como-cuidamos-titulo"
      className="py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading id="como-cuidamos-titulo" title="Como a Amiga Miau cuida" />

        <ol className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {etapas.map((etapa, indice) => (
            <li
              key={etapa.titulo}
              className="border-t border-[rgba(244,184,96,0.35)] pt-5"
            >
              <span className="font-mono text-sm font-semibold text-[var(--color-primary)]" aria-hidden="true">
                0{indice + 1}
              </span>
              <h3 className="mt-2 font-display tracking-[-0.01em] text-xl font-bold text-[var(--color-text-main)]">
                {etapa.titulo}
              </h3>
              <p className="mt-2 max-w-[38ch] text-base leading-7 text-[var(--color-text-soft)]">
                {etapa.descricao}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
