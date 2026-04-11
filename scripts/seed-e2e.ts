type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@amigamiau.test'
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'E2eAdmin12345!'

if (!supabaseUrl || !serviceKey) {
  throw new Error(
    'Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY para rodar o seed E2E.',
  )
}

const restUrl = `${supabaseUrl}/rest/v1`
const authUrl = `${supabaseUrl}/auth/v1`

const jsonHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
}

async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Seed E2E falhou em ${url}: ${response.status} ${body}`)
  }

  if (response.status === 204) {
    return null as T
  }

  const body = await response.text()
  if (!body) {
    return null as T
  }

  return JSON.parse(body) as T
}

async function upsertRows<T extends JsonValue>(
  table: string,
  rows: T,
  onConflict: string,
): Promise<void> {
  await request(`${restUrl}/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
}

async function deleteRows(table: string, query: string): Promise<void> {
  await request(`${restUrl}/${table}?${query}`, { method: 'DELETE' })
}

type AdminUser = {
  id: string
  email?: string
}

async function ensureAdminUser(): Promise<AdminUser> {
  const usersResponse = await request<{ users: AdminUser[] }>(
    `${authUrl}/admin/users?per_page=200`,
  )
  const existing = usersResponse.users.find((user) => user.email === adminEmail)

  if (existing) {
    await request<AdminUser>(`${authUrl}/admin/users/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          nome: 'Admin E2E',
          role: 'admin',
        },
      }),
    })

    return existing
  }

  return request<AdminUser>(`${authUrl}/admin/users`, {
    method: 'POST',
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        nome: 'Admin E2E',
        role: 'admin',
      },
    }),
  })
}

async function seed() {
  const admin = await ensureAdminUser()

  await upsertRows(
    'profiles',
    [
      {
        id: admin.id,
        nome: 'Admin E2E',
        email: adminEmail,
        role: 'admin',
        ativo: true,
      },
    ],
    'id',
  )

  await upsertRows(
    'site_settings',
    [
      { id: 'hero_titulo', value: 'Todo animal merece um lar cheio de amor' },
      {
        id: 'hero_subtitulo',
        value:
          'Resgatamos, cuidamos e encontramos famílias perfeitas para cada animal.',
      },
      { id: 'missao', value: 'Seed E2E da Associação Amiga Miau.' },
      { id: 'pix_chave', value: '49728609000170' },
      { id: 'instagram_url', value: '' },
      { id: 'facebook_url', value: '' },
      { id: 'whatsapp_numero', value: '555499886688' },
      { id: 'hero_imagem_url', value: '' },
    ],
    'id',
  )

  const animals = await request<
    {
      id: string
      slug: string
    }[]
  >(`${restUrl}/animals?on_conflict=slug&select=id,slug`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([
      {
        slug: 'e2e-luna',
        nome: 'E2E Luna',
        especie: 'gato',
        raca: 'SRD',
        idade_anos: 2,
        idade_meses: 3,
        sexo: 'femea',
        peso_kg: 4.2,
        vacinado: true,
        castrado: true,
        saudavel: true,
        obs_saude: 'Sem observações importantes.',
        temperamento: 'Carinhosa e curiosa',
        descricao: 'Animal criado pelo seed E2E para testes públicos e admin.',
        status: 'disponivel',
        destaque: true,
        created_by: admin.id,
      },
    ]),
  })

  const animal = animals[0]

  await deleteRows('animal_photos', `animal_id=eq.${animal.id}`)
  await upsertRows(
    'animal_photos',
    [
      {
        animal_id: animal.id,
        storage_path: 'e2e/luna-cover.jpg',
        url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
        is_cover: true,
        ordem: 0,
      },
      {
        animal_id: animal.id,
        storage_path: 'e2e/luna-gallery.jpg',
        url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
        is_cover: false,
        ordem: 1,
      },
    ],
    'id',
  )

  await deleteRows('adoption_interests', 'email=eq.e2e-adocao@example.com')
  await upsertRows(
    'adoption_interests',
    [
      {
        animal_id: animal.id,
        nome: 'E2E Pessoa Interessada',
        email: 'e2e-adocao@example.com',
        telefone: '555499999999',
        mensagem: 'Interesse criado pelo seed E2E.',
        lida: false,
      },
    ],
    'id',
  )

  await deleteRows('contact_messages', 'email=eq.e2e-contato@example.com')
  await upsertRows(
    'contact_messages',
    [
      {
        nome: 'E2E Contato',
        email: 'e2e-contato@example.com',
        assunto: 'E2E Assunto de contato',
        mensagem: 'Mensagem criada pelo seed E2E para validação administrativa.',
        lida: false,
      },
    ],
    'id',
  )

  console.log('Seed E2E concluído.')
  console.log(`Admin: ${adminEmail}`)
  console.log('Animal público: /animais/e2e-luna')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
