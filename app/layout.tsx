import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Associação Amiga Miau — Adoção Responsável',
    template: '%s | Amiga Miau',
  },
  description:
    'Associação sem fins lucrativos dedicada a resgatar e encontrar lares amorosos para animais de rua. Adote um amigo hoje!',
  keywords: ['adoção de animais', 'gatos para adotar', 'cães para adotar', 'ong animais', 'amiga miau'],
  openGraph: {
    siteName: 'Associação Amiga Miau',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      {/*
        Header é fixed (z-50), então main precisa de pt-16 para que
        o conteúdo das páginas internas não fique escondido abaixo do header.
        A HeroSection da home usa -mt-16 para se estender por baixo do header.
      */}
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ConditionalLayout header={<Header />} footer={<Footer />}>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}
