import type { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/site-settings'
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

const COUNTER_FALLBACKS = {
  animais_resgatados: 847,
  animais_adotados: 623,
  animais_em_espera: 24,
}

function parseCounter(value: string, fallback: number): number {
  return parseInt(value, 10) || fallback
}

export default async function HomePage() {
  const settings = await getPublicSiteSettings()
  const resgatados = parseCounter(
    settings.animais_resgatados,
    COUNTER_FALLBACKS.animais_resgatados,
  )
  const adotados = parseCounter(
    settings.animais_adotados,
    COUNTER_FALLBACKS.animais_adotados,
  )
  const emEspera = parseCounter(
    settings.animais_em_espera,
    COUNTER_FALLBACKS.animais_em_espera,
  )

  return (
    <>
      <HeroSection
        titulo={settings.hero_titulo}
        subtitulo={settings.hero_subtitulo}
        resgatados={resgatados}
        adotados={adotados}
        emEspera={emEspera}
      />
      <ContadoresSection
        resgatados={resgatados}
        adotados={adotados}
        emEspera={emEspera}
      />
      <AnimaisDestaque />
      <SobreSection missao={settings.missao} />
      <PixSection pixChave={settings.pix_chave} />
    </>
  )
}
