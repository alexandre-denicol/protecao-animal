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

function helpTextClass() {
  return 'mt-1 text-xs leading-relaxed text-neutral-400'
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
          Edite os textos, contatos e informações exibidos nas páginas públicas.
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
              <p className={helpTextClass()}>
                Aparece em destaque no topo da página inicial.
              </p>
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
              <label htmlFor="hero_imagem_url" className={labelClass()}>
                URL da imagem de fundo
              </label>
              <input
                id="hero_imagem_url"
                name="hero_imagem_url"
                type="url"
                maxLength={500}
                defaultValue={settings.hero_imagem_url}
                placeholder="https://..."
                className={inputClass()}
              />
              <p className={helpTextClass()}>
                Use uma imagem horizontal, com boa resolução. Se ficar vazio, a Home usa um fundo visual neutro.
              </p>
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
              <p className={helpTextClass()}>
                Texto usado na seção institucional resumida da Home.
              </p>
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
              <p className={helpTextClass()}>
                Informe apenas números ou use uma formatação simples. O site limpa a formatação antes de montar links.
              </p>
            </div>
          </div>
        </div>

        {/* Sócios */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <SectionTitle>Área de sócios</SectionTitle>
          <div className="space-y-5">
            <div>
              <label htmlFor="socios_titulo" className={labelClass()}>
                Título da página de sócios
              </label>
              <input
                id="socios_titulo"
                name="socios_titulo"
                type="text"
                maxLength={120}
                defaultValue={settings.socios_titulo}
                placeholder="Ex: Quero ser sócio"
                className={inputClass()}
              />
            </div>
            <div>
              <label htmlFor="socios_texto" className={labelClass()}>
                Texto institucional
              </label>
              <textarea
                id="socios_texto"
                name="socios_texto"
                rows={5}
                maxLength={1200}
                defaultValue={settings.socios_texto}
                placeholder="Explique como a contribuição dos sócios ajuda a associação."
                className={`${inputClass()} resize-none`}
              />
              <p className={helpTextClass()}>
                Aparece na página pública de cadastro de sócios.
              </p>
            </div>
            <div>
              <label htmlFor="socios_cta_titulo" className={labelClass()}>
                Título do formulário
              </label>
              <input
                id="socios_cta_titulo"
                name="socios_cta_titulo"
                type="text"
                maxLength={120}
                defaultValue={settings.socios_cta_titulo}
                placeholder="Ex: Faça parte dessa corrente de cuidado"
                className={inputClass()}
              />
              <p className={helpTextClass()}>
                Aparece acima do formulário público de cadastro.
              </p>
            </div>
            <div>
              <label htmlFor="socios_cta_subtitulo" className={labelClass()}>
                Texto de apoio do formulário
              </label>
              <textarea
                id="socios_cta_subtitulo"
                name="socios_cta_subtitulo"
                rows={3}
                maxLength={300}
                defaultValue={settings.socios_cta_subtitulo}
                placeholder="Oriente brevemente o visitante sobre o próximo contato."
                className={`${inputClass()} resize-none`}
              />
            </div>
            <div>
              <label htmlFor="socios_valor_minimo" className={labelClass()}>
                Valor mínimo mensal
              </label>
              <input
                id="socios_valor_minimo"
                name="socios_valor_minimo"
                type="text"
                maxLength={40}
                defaultValue={settings.socios_valor_minimo}
                placeholder="Ex: R$ 20,00"
                className={inputClass()}
              />
              <p className={helpTextClass()}>
                Mostrado como referência para quem deseja contribuir mensalmente.
              </p>
            </div>
            <div>
              <label htmlFor="socios_mensagem_admin" className={labelClass()}>
                Instrução interna de abordagem
              </label>
              <textarea
                id="socios_mensagem_admin"
                name="socios_mensagem_admin"
                rows={4}
                maxLength={800}
                defaultValue={settings.socios_mensagem_admin}
                placeholder="Ex: Entrar em contato pelo WhatsApp, explicar valores e combinar vencimento."
                className={`${inputClass()} resize-none`}
              />
              <p className={helpTextClass()}>
                Aparece apenas no admin para orientar a equipe no acompanhamento dos cadastros.
              </p>
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
