import type { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/site-settings'
import HeroSection from '@/components/home/HeroSection'
import AnimaisDestaque from '@/components/home/AnimaisDestaque'
import ComoCuidamos from '@/components/home/ComoCuidamos'
import ContadoresSection from '@/components/home/ContadoresSection'
import HistoriasAdocao from '@/components/home/HistoriasAdocao'
import SobreSection from '@/components/home/SobreSection'
import PixSection from '@/components/home/PixSection'
import { homeDisplayFont } from '@/components/home/home-font'

export const metadata: Metadata = {
  title: 'Associação Amiga Miau — Adoção Responsável',
  description:
    'Resgatamos animais de rua e encontramos lares amorosos para eles. Conheça nossos animais disponíveis para adoção.',
}

function parseCounter(value: string): number {
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export default async function HomePage() {
  const settings = await getPublicSiteSettings()

  return (
    <div className={`${homeDisplayFont.variable} bg-[var(--color-bg)]`}>
      <HeroSection
        titulo={settings.hero_titulo}
        subtitulo={settings.hero_subtitulo}
        imagemUrl={settings.hero_imagem_url}
      />
      <AnimaisDestaque />
      <ComoCuidamos />
      <ContadoresSection
        resgatados={parseCounter(settings.animais_resgatados)}
        adotados={parseCounter(settings.animais_adotados)}
        emEspera={parseCounter(settings.animais_em_espera)}
      />
      <HistoriasAdocao />
      <SobreSection missao={settings.missao} />
      <PixSection
        pixChave={settings.pix_chave}
        instagramUrl={settings.instagram_url}
        facebookUrl={settings.facebook_url}
        whatsappNumero={settings.whatsapp_numero}
      />
    </div>
  )
}
