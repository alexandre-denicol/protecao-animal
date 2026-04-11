# SCHEMA.md — Schema SQL do Supabase

## Instruções
Executar na ordem abaixo no SQL Editor do Supabase.
O schema completo já foi executado no projeto amiga-miau.
Este arquivo serve como documentação e referência.

---

## 0. Extensões

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 1. Tabela: profiles (RBAC)

Extensão da tabela `auth.users` com dados de perfil e controle de acesso.
Criada automaticamente via trigger ao inserir em `auth.users`.

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin', 'editor', 'viewer')),
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  convidado_por UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_ativo ON profiles(ativo);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_trigger_insert" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "profiles_admin_write" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger: cria perfil automaticamente ao criar usuário no Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo membro'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;

ALTER FUNCTION handle_new_user() OWNER TO postgres;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 2. Tabela: animals

```sql
CREATE TABLE animals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  nome          TEXT NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 100),
  especie       TEXT NOT NULL CHECK (especie IN ('gato', 'cao')),
  raca          TEXT,
  idade_anos    INTEGER CHECK (idade_anos >= 0 AND idade_anos <= 30),
  idade_meses   INTEGER CHECK (idade_meses >= 0 AND idade_meses <= 11),
  sexo          TEXT NOT NULL CHECK (sexo IN ('macho', 'femea')),
  peso_kg       DECIMAL(4,2) CHECK (peso_kg > 0),
  vacinado      BOOLEAN NOT NULL DEFAULT FALSE,
  castrado      BOOLEAN NOT NULL DEFAULT FALSE,
  saudavel      BOOLEAN NOT NULL DEFAULT TRUE,
  obs_saude     TEXT CHECK (char_length(obs_saude) <= 500),
  temperamento  TEXT CHECK (char_length(temperamento) <= 200),
  descricao     TEXT CHECK (char_length(descricao) <= 2000),
  status        TEXT NOT NULL DEFAULT 'disponivel'
                CHECK (status IN ('disponivel', 'em_processo', 'adotado')),
  destaque      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_especie ON animals(especie);
CREATE INDEX idx_animals_destaque ON animals(destaque);
CREATE INDEX idx_animals_slug ON animals(slug);
CREATE INDEX idx_animals_created_by ON animals(created_by);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER animals_updated_at
  BEFORE UPDATE ON animals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "animals_public_read" ON animals
  FOR SELECT USING (true);

CREATE POLICY "animals_auth_insert" ON animals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "animals_auth_update" ON animals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND (
        role = 'admin'
        OR (role = 'editor' AND animals.created_by = auth.uid())
      )
    )
  );

CREATE POLICY "animals_auth_delete" ON animals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND (
        role = 'admin'
        OR (role = 'editor' AND animals.created_by = auth.uid())
      )
    )
  );
```

---

## 3. Tabela: animal_photos

```sql
CREATE TABLE animal_photos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id    UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  is_cover     BOOLEAN NOT NULL DEFAULT FALSE,
  ordem        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_animal_photos_animal_id ON animal_photos(animal_id);
CREATE INDEX idx_animal_photos_cover ON animal_photos(animal_id, is_cover);

ALTER TABLE animal_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_public_read" ON animal_photos
  FOR SELECT USING (true);

CREATE POLICY "photos_auth_write" ON animal_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'editor')
    )
  );
```

---

## 4. Tabela: adoption_interests

```sql
CREATE TABLE adoption_interests (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  nome      TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email     TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  telefone  TEXT CHECK (char_length(telefone) <= 20),
  mensagem  TEXT CHECK (char_length(mensagem) <= 1000),
  lida      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adoption_interests_animal_id ON adoption_interests(animal_id);
CREATE INDEX idx_adoption_interests_lida ON adoption_interests(lida);

ALTER TABLE adoption_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interests_public_insert" ON adoption_interests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "interests_auth_read" ON adoption_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.ativo = TRUE
      AND (
        p.role IN ('admin', 'viewer')
        OR (
          p.role = 'editor'
          AND EXISTS (
            SELECT 1 FROM animals a
            WHERE a.id = adoption_interests.animal_id
            AND a.created_by = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "interests_auth_update" ON adoption_interests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );
```

---

## 5. Tabela: contact_messages

```sql
CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email      TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  assunto    TEXT NOT NULL CHECK (char_length(assunto) BETWEEN 2 AND 150),
  mensagem   TEXT NOT NULL CHECK (char_length(mensagem) BETWEEN 10 AND 2000),
  lida       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_lida ON contact_messages(lida);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_auth_read" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );

CREATE POLICY "contact_auth_update" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );
```

---

## 6. Tabela: adoptions (portfólio)

```sql
CREATE TABLE adoptions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id     UUID REFERENCES animals(id) ON DELETE SET NULL,
  animal_nome   TEXT NOT NULL,
  foto_url      TEXT,
  storage_path  TEXT,
  depoimento    TEXT CHECK (char_length(depoimento) <= 500),
  adotante_nome TEXT CHECK (char_length(adotante_nome) <= 100),
  data_adocao   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adoptions_data ON adoptions(data_adocao DESC);

ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adoptions_public_read" ON adoptions
  FOR SELECT USING (true);

CREATE POLICY "adoptions_auth_write" ON adoptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'editor')
    )
  );
```

---

## 7. Tabela: membership_interests

Cadastros públicos de pessoas interessadas em se tornar sócias da associação.

```sql
CREATE TABLE membership_interests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email      TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  endereco   TEXT NOT NULL CHECK (char_length(endereco) BETWEEN 5 AND 200),
  cidade     TEXT NOT NULL CHECK (char_length(cidade) BETWEEN 2 AND 100),
  estado     TEXT NOT NULL CHECK (estado ~ '^[A-Z]{2}$'),
  cpf        TEXT NOT NULL CHECK (char_length(cpf) BETWEEN 11 AND 14),
  whatsapp   TEXT NOT NULL CHECK (char_length(whatsapp) BETWEEN 10 AND 20),
  mensagem   TEXT CHECK (char_length(mensagem) <= 1000),
  lida       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_membership_interests_lida ON membership_interests(lida);
CREATE INDEX idx_membership_interests_created_at ON membership_interests(created_at DESC);
CREATE INDEX idx_membership_interests_nome ON membership_interests(nome);

ALTER TABLE membership_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membership_public_insert" ON membership_interests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "membership_auth_read" ON membership_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );

CREATE POLICY "membership_auth_update" ON membership_interests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );
```

---

## 8. Tabela: members

Sócios convertidos a partir dos cadastros públicos.

```sql
CREATE TABLE members (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interest_id           UUID UNIQUE REFERENCES membership_interests(id) ON DELETE SET NULL,
  nome                  TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email                 TEXT CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  endereco              TEXT NOT NULL CHECK (char_length(endereco) BETWEEN 5 AND 200),
  cidade                TEXT NOT NULL CHECK (char_length(cidade) BETWEEN 2 AND 100),
  estado                TEXT NOT NULL CHECK (estado ~ '^[A-Z]{2}$'),
  cpf                   TEXT NOT NULL CHECK (char_length(cpf) BETWEEN 11 AND 14),
  whatsapp              TEXT NOT NULL CHECK (char_length(whatsapp) BETWEEN 10 AND 20),
  observacoes           TEXT CHECK (char_length(observacoes) <= 1000),
  status                TEXT NOT NULL DEFAULT 'pendente'
                        CHECK (status IN ('pendente', 'contatado', 'ativo', 'inadimplente', 'cancelado')),
  valor_mensal          DECIMAL(10,2),
  data_inicio           DATE NOT NULL DEFAULT CURRENT_DATE,
  ultimo_pagamento_em   DATE,
  proximo_vencimento_em DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_interest_id ON members(interest_id);
CREATE INDEX idx_members_created_at ON members(created_at DESC);

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_auth_read" ON members
## 6. Tabela: profiles (RBAC)
```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin', 'editor', 'viewer')),
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  convidado_por UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_ativo ON profiles(ativo);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 7. Row Level Security (RLS)
```sql
ALTER TABLE animals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;

-- ANIMALS
CREATE POLICY "animals_public_read" ON animals
  FOR SELECT USING (true);

CREATE POLICY "animals_auth_insert" ON animals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "animals_auth_update" ON animals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND (
        role = 'admin'
        OR (role = 'editor' AND animals.created_by = auth.uid())
      )
    )
  );

CREATE POLICY "animals_auth_delete" ON animals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND (
        role = 'admin'
        OR (role = 'editor' AND animals.created_by = auth.uid())
      )
    )
  );

-- ANIMAL_PHOTOS
CREATE POLICY "photos_public_read" ON animal_photos
  FOR SELECT USING (true);

CREATE POLICY "photos_auth_write" ON animal_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'editor')
    )
  );

-- ADOPTION_INTERESTS
CREATE POLICY "interests_public_insert" ON adoption_interests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "interests_auth_read" ON adoption_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.ativo = TRUE
      AND (
        p.role IN ('admin', 'viewer')
        OR (
          p.role = 'editor'
          AND EXISTS (
            SELECT 1 FROM animals a
            WHERE a.id = adoption_interests.animal_id
            AND a.created_by = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "interests_auth_update" ON adoption_interests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );

-- CONTACT_MESSAGES
CREATE POLICY "contact_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_auth_read" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );

CREATE POLICY "members_auth_write" ON members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );
```

Migração incremental segura para bases que já possuem `membership_interests`:

```sql
ALTER TABLE membership_interests
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Preencha cidade/estado nos registros antigos antes de aplicar NOT NULL.
-- Depois:
-- ALTER TABLE membership_interests ALTER COLUMN cidade SET NOT NULL;
-- ALTER TABLE membership_interests ALTER COLUMN estado SET NOT NULL;
```

---

## 9. Tabela: member_payments

Histórico real de pagamentos dos sócios.

```sql
CREATE TABLE member_payments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  valor        DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  metodo       TEXT NOT NULL CHECK (char_length(metodo) BETWEEN 2 AND 50),
  pago_em      DATE NOT NULL,
  competencia_mes TEXT NOT NULL CHECK (competencia_mes ~ '^[0-9]{4}-[0-9]{2}$'),
  observacoes  TEXT CHECK (char_length(observacoes) <= 1000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_payments_member_id ON member_payments(member_id);
CREATE INDEX idx_member_payments_pago_em ON member_payments(pago_em DESC);
CREATE INDEX idx_member_payments_competencia_mes ON member_payments(competencia_mes);

ALTER TABLE member_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_payments_auth_read" ON member_payments
  FOR SELECT USING (

CREATE POLICY "contact_auth_update" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );

CREATE POLICY "member_payments_auth_write" ON member_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
);
```

---

## 10. Tabela: member_contact_history

Histórico de contatos feitos pela equipe com interessados e sócios.

```sql
CREATE TABLE member_contact_history (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_interest_id UUID REFERENCES membership_interests(id) ON DELETE SET NULL,
  member_id              UUID REFERENCES members(id) ON DELETE SET NULL,
  canal                  TEXT NOT NULL CHECK (canal IN ('email', 'whatsapp')),
  tipo                   TEXT NOT NULL CHECK (tipo IN ('triagem', 'boas_vindas', 'cobranca', 'manual')),
  destinatario           TEXT NOT NULL CHECK (char_length(destinatario) BETWEEN 3 AND 200),
  assunto                TEXT CHECK (char_length(assunto) <= 200),
  mensagem               TEXT NOT NULL CHECK (char_length(mensagem) BETWEEN 1 AND 5000),
  enviado_por            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (membership_interest_id IS NOT NULL OR member_id IS NOT NULL)
);

CREATE INDEX idx_member_contact_history_interest_id ON member_contact_history(membership_interest_id);
CREATE INDEX idx_member_contact_history_member_id ON member_contact_history(member_id);
CREATE INDEX idx_member_contact_history_created_at ON member_contact_history(created_at DESC);

ALTER TABLE member_contact_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_contact_history_auth_read" ON member_contact_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );

CREATE POLICY "member_contact_history_auth_write" ON member_contact_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role IN ('admin', 'viewer')
    )
  );
```

Migração incremental segura para bases já existentes:

```sql
CREATE TABLE IF NOT EXISTS member_contact_history (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_interest_id UUID REFERENCES membership_interests(id) ON DELETE SET NULL,
  member_id              UUID REFERENCES members(id) ON DELETE SET NULL,
  canal                  TEXT NOT NULL CHECK (canal IN ('email', 'whatsapp')),
  tipo                   TEXT NOT NULL CHECK (tipo IN ('triagem', 'boas_vindas', 'cobranca', 'manual')),
  destinatario           TEXT NOT NULL CHECK (char_length(destinatario) BETWEEN 3 AND 200),
  assunto                TEXT CHECK (char_length(assunto) <= 200),
  mensagem               TEXT NOT NULL CHECK (char_length(mensagem) BETWEEN 1 AND 5000),
  enviado_por            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (membership_interest_id IS NOT NULL OR member_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_member_contact_history_interest_id ON member_contact_history(membership_interest_id);
CREATE INDEX IF NOT EXISTS idx_member_contact_history_member_id ON member_contact_history(member_id);
CREATE INDEX IF NOT EXISTS idx_member_contact_history_created_at ON member_contact_history(created_at DESC);
```

---

## 11. Tabela: site_settings

Configurações editáveis do site pelo admin.

```sql
CREATE TABLE site_settings (
  id         TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_write" ON site_settings
-- ADOPTIONS
CREATE POLICY "adoptions_public_read" ON adoptions
  FOR SELECT USING (true);

CREATE POLICY "adoptions_auth_write" ON adoptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND ativo = TRUE
      AND role = 'admin'
    )
  );

-- Valores padrão
INSERT INTO site_settings (id, value) VALUES
  ('hero_titulo',          'Encontre seu companheiro para a vida'),
  ('hero_subtitulo',       'Resgatamos, cuidamos e encontramos lares amorosos para animais de rua. Venha adotar um amigo!'),
  ('missao',               'Nossa missão é proteger e encontrar lares amorosos para animais de rua.'),
  ('animais_resgatados',   '0'),
  ('animais_adotados',     '0'),
  ('animais_em_espera',    '0'),
  ('pix_chave',            '49728609000170'),
  ('instagram_url',        ''),
  ('facebook_url',         ''),
  ('whatsapp_numero',      '555499886688'),
  ('hero_imagem_url',      ''),
  ('socios_titulo',        'Quero ser sócio'),
  ('socios_texto',         'Ao se tornar sócio, você ajuda a manter cuidados contínuos para os animais acolhidos pela associação.'),
  ('socios_valor_minimo',  ''),
  ('socios_cta_titulo',    'Faça parte dessa corrente de cuidado'),
  ('socios_cta_subtitulo', 'Preencha seus dados e nossa equipe entra em contato para combinar a melhor forma de contribuição.'),
  ('socios_mensagem_admin','Entre em contato pelo WhatsApp, apresente a proposta de associação e confirme valor, forma de pagamento e vencimento.'),
  ('socios_whatsapp_triagem_template','Olá, {nome}! Recebemos seu cadastro para ser sócio da Amiga Miau. Podemos conversar sobre a contribuição mensal?'),
  ('socios_whatsapp_boas_vindas_template','Olá, {nome}! Seu cadastro como sócio da Amiga Miau foi confirmado. Muito obrigado por fazer parte dessa rede de cuidado.'),
  ('socios_whatsapp_cobranca_template','Olá, {nome}! Passando para lembrar com carinho sobre a mensalidade de sócio da Amiga Miau.'),
  ('socios_email_triagem_assunto','Recebemos seu cadastro de sócio - Amiga Miau'),
  ('socios_email_triagem_corpo','Olá, {nome}! Recebemos seu cadastro para ser sócio da Amiga Miau. Nossa equipe vai conversar com você para combinar a contribuição mensal.'),
  ('socios_email_boas_vindas_assunto','Bem-vindo(a) à rede de sócios da Amiga Miau'),
  ('socios_email_boas_vindas_corpo','Olá, {nome}! Obrigado por se tornar sócio da Amiga Miau. Sua contribuição ajuda a manter cuidado contínuo aos animais acolhidos.'),
  ('socios_email_cobranca_assunto','Lembrete de mensalidade - Amiga Miau'),
  ('socios_email_cobranca_corpo','Olá, {nome}! Este é um lembrete amigável sobre a mensalidade de sócio da Amiga Miau.'),
  ('email_sender_name', 'Amiga Miau'),
  ('email_reply_to', '')
ON CONFLICT (id) DO NOTHING;

-- Migração incremental segura para projetos que já tinham a chave vazia
INSERT INTO site_settings (id, value)
VALUES ('whatsapp_numero', '555499886688')
ON CONFLICT (id) DO UPDATE
SET value = EXCLUDED.value
WHERE NULLIF(BTRIM(site_settings.value), '') IS NULL;

INSERT INTO site_settings (id, value) VALUES
  ('socios_email_triagem_assunto','Recebemos seu cadastro de sócio - Amiga Miau'),
  ('socios_email_triagem_corpo','Olá, {nome}! Recebemos seu cadastro para ser sócio da Amiga Miau. Nossa equipe vai conversar com você para combinar a contribuição mensal.'),
  ('email_sender_name', 'Amiga Miau'),
  ('email_reply_to', '')
ON CONFLICT (id) DO NOTHING;
```

---

## 12. Storage Buckets
      AND role IN ('admin', 'editor')
    )
  );

-- PROFILES
CREATE POLICY "profiles_trigger_insert" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "profiles_admin_write" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 8. Trigger de criação automática de perfil
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo membro'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;

ALTER FUNCTION handle_new_user() OWNER TO postgres;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 9. Storage Buckets

Criar no painel Supabase > Storage > New Bucket:

**Bucket: `animal-photos`**
- Public: SIM
- Allowed MIME types: image/jpeg, image/png, image/webp
- Max file size: 5242880 (5MB)

**Bucket: `adoption-photos`**
- Public: SIM
- Allowed MIME types: image/jpeg, image/png, image/webp
- Max file size: 5242880 (5MB)