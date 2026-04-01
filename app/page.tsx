import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import ContadoresSection from '@/components/home/ContadoresSection'
import AnimaisDestaque from '@/components/home/AnimaisDestaque'
import SobreSection from '@/components/home/SobreSection'
import PixSection from '@/components/home/PixSection'

export const metadata: Metadata = {
  title: 'Associação Amiga Miau — Adoção Responsável',
  description:
    'Resgatamos animais de rua e encontramos lares amorosos para eles. Conheça nossos animais disponíveis para adoção.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ContadoresSection />
      <AnimaisDestaque />
      <SobreSection />
      <PixSection />
    </>
  )
}
