# SCHEMA.md — Schema SQL do Supabase

## Instruções
Executar na ordem abaixo no SQL Editor do Supabase.
Habilitar extensão uuid antes de tudo.

---

## 0. Extensões
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 1. Tabela: animals
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
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_especie ON animals(especie);
CREATE INDEX idx_animals_destaque ON animals(destaque);
CREATE INDEX idx_animals_slug ON animals(slug);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER animals_updated_at
  BEFORE UPDATE ON animals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 2. Tabela: animal_photos
```sql
CREATE TABLE animal_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id   UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url         TEXT NOT NULL,
  is_cover    BOOLEAN NOT NULL DEFAULT FALSE,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_animal_photos_animal_id ON animal_photos(animal_id);
CREATE INDEX idx_animal_photos_cover ON animal_photos(animal_id, is_cover);
```

---

## 3. Tabela: adoption_interests
```sql
CREATE TABLE adoption_interests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id   UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email       TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  telefone    TEXT CHECK (char_length(telefone) <= 20),
  mensagem    TEXT CHECK (char_length(mensagem) <= 1000),
  lida        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adoption_interests_animal_id ON adoption_interests(animal_id);
CREATE INDEX idx_adoption_interests_lida ON adoption_interests(lida);
```

---

## 4. Tabela: contact_messages
```sql
CREATE TABLE contact_messages (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome      TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email     TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  assunto   TEXT NOT NULL CHECK (char_length(assunto) BETWEEN 2 AND 150),
  mensagem  TEXT NOT NULL CHECK (char_length(mensagem) BETWEEN 10 AND 2000),
  lida      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_lida ON contact_messages(lida);
```

---

## 5. Tabela: adoptions (portfólio)
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
```

---

## 6. Row Level Security (RLS)
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE animals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_photos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions         ENABLE ROW LEVEL SECURITY;

-- ANIMALS: leitura pública, escrita autenticada
CREATE POLICY "animals_public_read" ON animals
  FOR SELECT USING (true);

CREATE POLICY "animals_auth_insert" ON animals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "animals_auth_update" ON animals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "animals_auth_delete" ON animals
  FOR DELETE USING (auth.role() = 'authenticated');

-- ANIMAL_PHOTOS: leitura pública, escrita autenticada
CREATE POLICY "photos_public_read" ON animal_photos
  FOR SELECT USING (true);

CREATE POLICY "photos_auth_write" ON animal_photos
  FOR ALL USING (auth.role() = 'authenticated');

-- ADOPTION_INTERESTS: inserção pública, leitura/gestão autenticada
CREATE POLICY "interests_public_insert" ON adoption_interests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "interests_auth_read" ON adoption_interests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "interests_auth_update" ON adoption_interests
  FOR UPDATE USING (auth.role() = 'authenticated');

-- CONTACT_MESSAGES: inserção pública, leitura/gestão autenticada
CREATE POLICY "contact_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_auth_read" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "contact_auth_update" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ADOPTIONS: leitura pública, escrita autenticada
CREATE POLICY "adoptions_public_read" ON adoptions
  FOR SELECT USING (true);

CREATE POLICY "adoptions_auth_write" ON adoptions
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 7. Storage Buckets

Criar no painel Supabase > Storage > New Bucket:

**Bucket: `animal-photos`**
- Public: SIM (fotos precisam ser acessíveis publicamente)
- Allowed MIME types: image/jpeg, image/png, image/webp
- Max file size: 5242880 (5MB)

**Bucket: `adoption-photos`**
- Public: SIM
- Allowed MIME types: image/jpeg, image/png, image/webp
- Max file size: 5242880 (5MB)
