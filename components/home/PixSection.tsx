import { PixCopyButton } from '@/components/ui/PixCopyButton'

interface PixSectionProps {
  pixChave?: string
}

export default function PixSection({ pixChave = '49728609000170' }: PixSectionProps) {
  return (
    <section className="bg-primary-50 py-20">
      {/* Accent border no topo */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300 -mt-20 mb-20" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between lg:gap-16">

          {/* Texto à esquerda */}
          <div className="mb-10 text-center lg:mb-0 lg:max-w-lg lg:text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
              Faça a diferença
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-neutral-800">
              Apoie nossa causa
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              Cada doação, grande ou pequena, vai direto para ração, vacinas
              e cuidados veterinários. Você salva uma vida com um PIX.
            </p>

            <ul className="mt-8 flex flex-col gap-3 text-left">
              {[
                'Ração e suplementos para todos os animais',
                'Consultas e exames veterinários',
                'Vacinas e medicamentos necessários',
                'Castrações e procedimentos cirúrgicos',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-200">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5L4 7L8 3" stroke="#7A4EA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-neutral-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card PIX à direita */}
          <div className="w-full max-w-sm lg:flex-shrink-0">
            <div className="rounded-3xl border border-primary-200 bg-white p-8 shadow-xl shadow-primary-100">
              {/* Ícone */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-3xl">
                🐾
              </div>

              <h3 className="text-xl font-bold text-neutral-800">Doação via PIX</h3>
              <p className="mt-1 text-sm text-neutral-500">Transferência instantânea, sem taxas</p>

              <div className="mt-6 rounded-xl bg-primary-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                  Chave PIX — CNPJ
                </p>
                <p className="mt-1.5 break-all font-mono text-lg font-bold text-neutral-800">
                  {pixChave}
                </p>
              </div>

              <div className="mt-4">
                <PixCopyButton chavePix={pixChave} />
              </div>

              <p className="mt-5 text-center text-xs leading-relaxed text-neutral-400">
                100% dos recursos são destinados ao cuidado dos animais.
                <br />
                Associação Amiga Miau — CNPJ 49.728.609/0001-70
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
