import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import {
  getPublicSiteSettings,
  type PublicSiteSettings,
} from '@/lib/site-settings'
import { salvarConfiguracoesAction } from './actions'

export const metadata: Metadata = { title: 'Configurações — Amiga Miau Admin' }

function labelClass() {
  return 'block text-sm font-semibold text-neutral-700 mb-1'
}

function inputClass() {
  return 'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100'
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 border-b border-neutral-100 pb-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
      {children}
    </h3>
  )
}

interface PageProps {
  searchParams: Promise<{ salvo?: string; erro?: string }>
}

export default async function ConfiguracoesPage({ searchParams }: PageProps) {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role !== 'admin') redirect('/admin/sem-permissao')

  const { salvo, erro } = await searchParams

  const settings: PublicSiteSettings = await getPublicSiteSettings()

  return (
    <div className="mx-auto max-w-2xl">
      {/* Cabeçalho */}
      <div className="mb-8">
        <nav aria-label="Navegação" className="mb-3 flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/admin" className="hover:text-neutral-700">
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-neutral-800">Configurações</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
          Configurações do site
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Edite os textos e informações exibidos na página inicial.
        </p>
      </div>

      {/* Feedback */}
      {salvo === '1' && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
        >
          Configurações salvas com sucesso!
        </div>
      )}
      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-salmon-200 bg-salmon-50 px-4 py-3 text-sm font-medium text-salmon-700"
        >
          {erro === 'acesso_negado'
            ? 'Acesso negado.'
            : 'Não foi possível salvar as configurações. Tente novamente.'}
        </div>
      )}

      <form action={salvarConfiguracoesAction} className="space-y-8">
        {/* Seção Hero */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <SectionTitle>Página inicial — Hero</SectionTitle>
          <div className="space-y-5">
            <div>
              <label htmlFor="hero_titulo" className={labelClass()}>
                Título principal
              </label>
              <input
                id="hero_titulo"
                name="hero_titulo"
                type="text"
                maxLength={150}
                defaultValue={settings.hero_titulo}
                placeholder="Ex: Todo animal merece um lar cheio de amor"
                className={inputClass()}
              />
            </div>
            <div>
              <label htmlFor="hero_subtitulo" className={labelClass()}>
                Subtítulo
              </label>
              <textarea
                id="hero_subtitulo"
                name="hero_subtitulo"
                rows={3}
                maxLength={300}
                defaultValue={settings.hero_subtitulo}
                placeholder="Ex: Resgatamos, cuidamos e encontramos famílias perfeitas para cada animal."
                className={`${inputClass()} resize-none`}
              />
            </div>
            <div>
              <label htmlFor="missao" className={labelClass()}>
                Missão da ONG
              </label>
              <textarea
                id="missao"
                name="missao"
                rows={4}
                maxLength={500}
                defaultValue={settings.missao}
                placeholder="Ex: Nossa missão é resgatar animais em situação de vulnerabilidade..."
                className={`${inputClass()} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Contadores */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <SectionTitle>Contadores</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="animais_resgatados" className={labelClass()}>
                Animais resgatados
              </label>
              <input
                id="animais_resgatados"
                name="animais_resgatados"
                type="number"
                min={0}
                defaultValue={settings.animais_resgatados}
                placeholder="Ex: 847"
                className={inputClass()}
              />
            </div>
            <div>
              <label htmlFor="animais_adotados" className={labelClass()}>
                Animais adotados
              </label>
              <input
                id="animais_adotados"
                name="animais_adotados"
                type="number"
                min={0}
                defaultValue={settings.animais_adotados}
                placeholder="Ex: 623"
                className={inputClass()}
              />
            </div>
            <div>
              <label htmlFor="animais_em_espera" className={labelClass()}>
                Em espera de lar
              </label>
              <input
                id="animais_em_espera"
                name="animais_em_espera"
                type="number"
                min={0}
                defaultValue={settings.animais_em_espera}
                placeholder="Ex: 24"
                className={inputClass()}
              />
            </div>
          </div>
        </div>

        {/* Doação e redes */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <SectionTitle>Doação e redes sociais</SectionTitle>
          <div className="space-y-5">
            <div>
              <label htmlFor="pix_chave" className={labelClass()}>
                Chave PIX (CNPJ)
              </label>
              <input
                id="pix_chave"
                name="pix_chave"
                type="text"
                maxLength={50}
                defaultValue={settings.pix_chave}
                placeholder="Ex: 49.728.609/0001-70"
                className={inputClass()}
              />
            </div>
            <div>
              <label htmlFor="instagram_url" className={labelClass()}>
                URL do Instagram
              </label>
              <input
                id="instagram_url"
                name="instagram_url"
                type="url"
                maxLength={200}
                defaultValue={settings.instagram_url}
                placeholder="https://instagram.com/amigamiau"
                className={inputClass()}
              />
            </div>
            <div>
              <label htmlFor="facebook_url" className={labelClass()}>
                URL do Facebook
              </label>
              <input
                id="facebook_url"
                name="facebook_url"
                type="url"
                maxLength={200}
                defaultValue={settings.facebook_url}
                placeholder="https://facebook.com/amigamiau"
                className={inputClass()}
              />
            </div>
            <div>
              <label htmlFor="whatsapp_numero" className={labelClass()}>
                Número do WhatsApp (com DDI)
              </label>
              <input
                id="whatsapp_numero"
                name="whatsapp_numero"
                type="text"
                maxLength={20}
                defaultValue={settings.whatsapp_numero}
                placeholder="Ex: DDI + DDD + número"
                className={inputClass()}
              />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-300 px-6 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
          >
            Salvar configurações
          </button>
        </div>
      </form>
    </div>
  )
}
