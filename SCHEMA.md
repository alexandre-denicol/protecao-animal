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

## 7. Tabela: site_settings

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
  ('hero_imagem_url',      '')
ON CONFLICT (id) DO NOTHING;

-- Migração incremental segura para projetos que já tinham a chave vazia
INSERT INTO site_settings (id, value)
VALUES ('whatsapp_numero', '555499886688')
ON CONFLICT (id) DO UPDATE
SET value = EXCLUDED.value
WHERE NULLIF(BTRIM(site_settings.value), '') IS NULL;
```

---

## 8. Storage Buckets

Criar no painel Supabase > Storage > New Bucket:

**Bucket: `animal-photos`**
- Public: SIM
- Allowed MIME types: image/jpeg, image/png, image/webp
- Max file size: 5242880 (5MB)

**Bucket: `adoption-photos`**
- Public: SIM
- Allowed MIME types: image/jpeg, image/png, image/webp
- Max file size: 5242880 (5MB)
