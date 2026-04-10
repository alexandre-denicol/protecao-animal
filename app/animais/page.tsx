import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPublicAnimals, type PublicAnimal } from '@/lib/public-animals'

export const metadata: Metadata = {
  title: 'Animais para Adoção',
  description: 'Conheça nossos animais disponíveis para adoção.',
}

function especieLabel(especie: PublicAnimal['especie']): string {
  return especie === 'cao' ? 'Cão' : 'Gato'
}

function statusLabel(status: PublicAnimal['status']): string {
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

export default async function AnimaisPage() {
  const animals = await getPublicAnimals()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-800">
        Animais para adoção
      </h1>
      <p className="max-w-2xl text-neutral-500">
        Conheça os animais que estão esperando por um lar cheio de cuidado.
      </p>

      {animals.length === 0 ? (
        <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-neutral-800">
            Nenhum animal disponível no momento
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Volte em breve para conhecer novos amigos.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => (
            <Link
              key={animal.id}
              href={`/animais/${animal.slug}`}
              className="group overflow-hidden rounded-xl bg-white shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-neutral-100">
                {animal.photoUrl ? (
                  <Image
                    src={animal.photoUrl}
                    alt={`Foto de ${animal.nome}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-neutral-400">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-neutral-800">
                    {animal.nome}
                  </h2>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                    {statusLabel(animal.status)}
                  </span>
                </div>

                <dl className="grid gap-2 text-sm text-neutral-600">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold text-neutral-500">Espécie</dt>
                    <dd>{especieLabel(animal.especie)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold text-neutral-500">Idade</dt>
                    <dd>{idadeLabel(animal.idade_anos, animal.idade_meses)}</dd>
                  </div>
                </dl>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
