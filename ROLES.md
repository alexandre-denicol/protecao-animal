# ROLES.md — Controle de Acesso por Roles (RBAC)

## Princípios Gerais (OWASP Authorization)
- Toda verificação de autorização ocorre no SERVIDOR — nunca confiar no frontend
- Negar por padrão: se a role não está explicitamente autorizada, o acesso é negado
- Princípio do menor privilégio: cada role tem apenas o mínimo necessário
- Verificar autorização em CADA requisição — nunca assumir que verificou antes
- Nunca expor dados de outros usuários baseado apenas em parâmetros da URL

---

## Roles Definidas

### `admin`
- Acesso total a todas as funcionalidades
- Único que pode convidar, promover e revogar membros da equipe
- Vê e edita animais de TODOS os editores
- Vê TODAS as mensagens e interesses de adoção
- Pode deletar qualquer registro
- Acessa configurações do sistema

### `editor`
- Cadastra novos animais
- Edita e deleta APENAS animais que ele próprio cadastrou (`created_by = user.id`)
- Vê APENAS interesses de adoção dos seus animais
- NÃO pode gerenciar outros membros da equipe
- NÃO pode deletar mensagens de contato
- NÃO acessa configurações do sistema

### `viewer`
- Acesso somente leitura ao painel administrativo
- Vê todos os animais (de todos os editores)
- Vê todas as mensagens e interesses
- NÃO pode criar, editar ou deletar nada
- Útil para voluntários que precisam acompanhar sem modificar

---

## Matriz de Permissões

| Ação | admin | editor | viewer |
|---|---|---|---|
| Ver animais (todos) | ✅ | ✅ | ✅ |
| Cadastrar animal | ✅ | ✅ | ❌ |
| Editar animal próprio | ✅ | ✅ | ❌ |
| Editar animal de outro | ✅ | ❌ | ❌ |
| Deletar animal próprio | ✅ | ✅ | ❌ |
| Deletar animal de outro | ✅ | ❌ | ❌ |
| Ver mensagens de contato | ✅ | ❌ | ✅ |
| Ver interesses de adoção próprios | ✅ | ✅ | ✅ |
| Ver interesses de adoção de outros | ✅ | ❌ | ✅ |
| Marcar mensagem como lida | ✅ | ✅* | ✅ |
| Gerenciar portfólio de adoções | ✅ | ✅ | ❌ |
| Convidar membros | ✅ | ❌ | ❌ |
| Alterar roles de membros | ✅ | ❌ | ❌ |
| Revogar acesso de membros | ✅ | ❌ | ❌ |
| Ver painel de membros | ✅ | ❌ | ❌ |

*editor pode marcar como lida apenas mensagens dos seus animais

---

## Implementação no Banco (Supabase)

### Executar no SQL Editor — ADICIONAR ao schema existente:
```sql
-- Tabela de perfis de usuário com roles
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'viewer'
              CHECK (role IN ('admin', 'editor', 'viewer')),
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  convidado_por UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_ativo ON profiles(ativo);

-- Trigger updated_at para profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Adicionar campo created_by em animals
ALTER TABLE animals
  ADD COLUMN created_by UUID REFERENCES profiles(id);

CREATE INDEX idx_animals_created_by ON animals(created_by);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado vê o próprio perfil
CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin vê todos os perfis
CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Só admin gerencia perfis
CREATE POLICY "profiles_admin_write" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Atualizar policies de animals para incluir ownership
DROP POLICY IF EXISTS "animals_auth_update" ON animals;
DROP POLICY IF EXISTS "animals_auth_delete" ON animals;

-- Editor só edita o que é seu; admin edita tudo
CREATE POLICY "animals_auth_update" ON animals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND ativo = TRUE
      AND (
        role = 'admin'
        OR (role = 'editor' AND animals.created_by = auth.uid())
      )
    )
  );

-- Editor só deleta o que é seu; admin deleta tudo
CREATE POLICY "animals_auth_delete" ON animals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND ativo = TRUE
      AND (
        role = 'admin'
        OR (role = 'editor' AND animals.created_by = auth.uid())
      )
    )
  );

-- Atualizar policy de insert para gravar created_by
DROP POLICY IF EXISTS "animals_auth_insert" ON animals;

CREATE POLICY "animals_auth_insert" ON animals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND ativo = TRUE
      AND role IN ('admin', 'editor')
    )
  );

-- adoption_interests: editor vê só os seus
DROP POLICY IF EXISTS "interests_auth_read" ON adoption_interests;

CREATE POLICY "interests_auth_read" ON adoption_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.ativo = TRUE
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
```

---

## Implementação no Next.js

### Função helper de verificação de role (lib/auth/roles.ts):
```typescript
import { createServerClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'editor' | 'viewer'

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, ativo')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.ativo) return null
  return profile.role as UserRole
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<UserRole> {
  const role = await getUserRole()
  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Acesso negado')
  }
  return role
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}
```

### Middleware de proteção das rotas /admin (middleware.ts):
```typescript
// Verificar role em CADA requisição às rotas admin
// Nunca cachear resultado de autorização
// Redirecionar para /admin/login se não autenticado
// Redirecionar para /admin/sem-permissao se role insuficiente
```

### Regra crítica — verificação em 3 camadas:
1. **Middleware** — bloqueia acesso à rota antes de renderizar
2. **Server Action / API Route** — verifica role antes de qualquer operação
3. **RLS no Supabase** — última linha de defesa no banco

Nunca depender de apenas uma camada.

---

## Fluxo de Convite de Membros
```
1. Admin acessa /admin/membros
2. Admin informa email e role desejada
3. Sistema chama supabase.auth.admin.inviteUserByEmail()
4. Supabase envia email de convite ao novo membro
5. Membro clica no link, define senha
6. Trigger cria registro em profiles com a role definida pelo admin
7. Acesso liberado conforme role
```

### Trigger automático de criação de perfil:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo membro'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Checklist de Segurança (verificar a cada PR)
- [ ] Toda rota /admin verifica role no servidor
- [ ] Nenhuma verificação de autorização apenas no frontend
- [ ] Editor não consegue acessar dados de outros editores
- [ ] Usuário inativo não consegue autenticar
- [ ] Convites só podem ser enviados por admin
- [ ] Role nunca vem do frontend — sempre do banco