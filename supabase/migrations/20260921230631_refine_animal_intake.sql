-- ============================================================================
-- Migration: refine_animal_intake
-- Generated: 2026-09-21
--
-- CONTEXT
-- This migration was written against the REAL production `public.animals`
-- schema, verified manually via read-only PostgreSQL catalog queries
-- (information_schema / pg_constraint / pg_indexes / pg_trigger / pg_policies)
-- in a prior session. It has NOT been executed. Apply it deliberately via the
-- Supabase migration workflow, not by pasting into the SQL editor ad hoc.
--
-- SCOPE
-- Relaxes/widens constraints on `animals` to support: optional name, a third
-- species value ("outro") with a free-text detail, a third sex value
-- ("nao_identificado"), an "idade_estimada" flag, and tri-state
-- vacinado/castrado (true/false/NULL = não informado).
--
-- EXPLICITLY OUT OF SCOPE (do not add here)
-- - Does NOT drop `saudavel` or `obs_saude` — the application stops writing
--   to them, but the columns and any existing data remain physically intact
--   for a possible later, separately-approved migration.
-- - Does NOT touch `status`, RLS, policies, foreign keys, indexes, triggers,
--   or any existing row data.
-- - Does NOT touch `adoptions`, `adoption_interests`, or `animal_photos`.
-- ============================================================================

BEGIN;

-- ── 1 & 2. `nome` becomes optional ──────────────────────────────────────────
-- Drop the NOT NULL and replace the length CHECK so it still applies to any
-- non-null value (1–100 chars) but no longer requires a value at all.
ALTER TABLE public.animals
  ALTER COLUMN nome DROP NOT NULL;

ALTER TABLE public.animals
  DROP CONSTRAINT animals_nome_check;

ALTER TABLE public.animals
  ADD CONSTRAINT animals_nome_check
    CHECK (nome IS NULL OR char_length(nome) BETWEEN 1 AND 100);

-- ── 3 & 4. `especie` gains 'outro' + new `especie_detalhe` column ──────────
ALTER TABLE public.animals
  DROP CONSTRAINT animals_especie_check;

ALTER TABLE public.animals
  ADD CONSTRAINT animals_especie_check
    CHECK (especie IN ('gato', 'cao', 'outro'));

ALTER TABLE public.animals
  ADD COLUMN especie_detalhe TEXT;

ALTER TABLE public.animals
  ADD CONSTRAINT animals_especie_detalhe_check
    CHECK (especie_detalhe IS NULL OR char_length(especie_detalhe) <= 60);

-- ── 5. `sexo` gains 'nao_identificado' ──────────────────────────────────────
ALTER TABLE public.animals
  DROP CONSTRAINT animals_sexo_check;

ALTER TABLE public.animals
  ADD CONSTRAINT animals_sexo_check
    CHECK (sexo IN ('macho', 'femea', 'nao_identificado'));

-- ── 6. `idade_estimada` flag ─────────────────────────────────────────────────
ALTER TABLE public.animals
  ADD COLUMN idade_estimada BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 7 & 8. `vacinado` / `castrado` become tri-state (NULL = não informado) ──
-- Existing TRUE/FALSE values are untouched by dropping NOT NULL/DEFAULT —
-- only newly-omitted values will now land as NULL instead of implicitly FALSE.
ALTER TABLE public.animals
  ALTER COLUMN vacinado DROP NOT NULL,
  ALTER COLUMN vacinado DROP DEFAULT;

ALTER TABLE public.animals
  ALTER COLUMN castrado DROP NOT NULL,
  ALTER COLUMN castrado DROP DEFAULT;

-- ── 9 & 10. `saudavel` / `obs_saude`: intentionally untouched ───────────────
-- No ALTER/DROP here. The application stops reading/writing these columns;
-- they remain exactly as they are in production, including existing values.
-- A future, separately-approved migration may revisit dropping them once
-- it's confirmed nothing else depends on them.

COMMIT;

-- ============================================================================
-- NOT DONE BY THIS MIGRATION (by design):
--  - No changes to existing rows (`nome`, `vacinado`, `castrado` keep their
--    current values; only their constraints/nullability changed).
--  - No RLS/policy changes.
--  - No foreign key changes.
--  - No changes to `status` or its CHECK constraint.
--  - No changes to existing slugs (slug generation is application-controlled;
--    see app/admin/(protected)/animais/actions.ts).
--  - No DROP COLUMN of any kind.
-- ============================================================================
