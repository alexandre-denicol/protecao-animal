import Image from 'next/image'
import Link from 'next/link'

interface AnimalCard {
  nome: string
  especie: 'gato' | 'cao'
  idadeTexto: string
  sexo: 'Macho' | 'Fêmea'
  status: 'disponivel' | 'em_processo'
  foto: string
  slug: string
}

const animaisPlaceholder: AnimalCard[] = [
  {
    nome: 'Luna',
    especie: 'gato',
    idadeTexto: '2 anos',
    sexo: 'Fêmea',
    status: 'disponivel',
    foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    slug: 'luna',
  },
  {
    nome: 'Thor',
    especie: 'cao',
    idadeTexto: '3 anos',
    sexo: 'Macho',
    status: 'disponivel',
    foto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    slug: 'thor',
  },
  {
    nome: 'Mel',
    especie: 'gato',
    idadeTexto: '1 ano',
    sexo: 'Fêmea',
    status: 'em_processo',
    foto: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    slug: 'mel',
  },
]

const statusConfig = {
  disponivel: {
    label: 'Disponível',
    classes: 'bg-green-100 text-green-700',
  },
  em_processo: {
    label: 'Em processo',
    classes: 'bg-amber-100 text-amber-700',
  },
} as const

const especieLabel: Record<AnimalCard['especie'], string> = {
  gato: 'Gato',
  cao: 'Cachorro',
}

function CardAnimal({ animal }: { animal: AnimalCard }) {
  const status = statusConfig[animal.status]

  return (
    <Link
      href={`/animais/${animal.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary-300"
    >
      {/* Foto */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={animal.foto}
          alt={`Foto de ${animal.nome}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Badge de status */}
        <div className="absolute right-3 top-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Corpo do card */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-neutral-800">{animal.nome}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {especieLabel[animal.especie]} · {animal.idadeTexto} · {animal.sexo}
        </p>

        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors group-hover:text-primary-600">
            Conhecer {animal.nome}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function AnimaisDestaque() {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Cabeçalho da seção */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-500">
            Conheça quem busca um lar
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-neutral-800">
            Animais em Destaque
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
            Cada um com sua personalidade única, esperando pela família certa.
          </p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {animaisPlaceholder.map((animal) => (
            <CardAnimal key={animal.slug} animal={animal} />
          ))}
        </div>

        {/* CTA para catálogo completo */}
        <div className="mt-12 text-center">
          <Link
            href="/animais"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-300 px-8 py-3.5 text-sm font-bold text-primary-600 transition-all duration-200 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-300"
          >
            Ver todos os animais
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
