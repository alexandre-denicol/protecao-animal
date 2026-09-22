import { Plus_Jakarta_Sans } from 'next/font/google'

/** Fonte de títulos da Home, a mesma família de marca definida em DESIGN.md. */
export const homeDisplayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-home-display',
})
