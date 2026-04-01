# DESIGN.md — Diretrizes Visuais (baseado em Refactoring UI)

## Princípio Central
Hierarquia visual é mais importante que estilo.
Antes de escolher cores ou fontes, definir o que é primário,
secundário e terciário em cada tela.

## Paleta de Cores

### Estrutura (HSL recomendado)
- Primary: tom âmbar/laranja quente — transmite acolhimento
  Exemplo: hsl(30, 80%, 50%) como base, com 8-9 shades definidos
- Neutral: cinza com leve toque quente (não cinza puro)
  Exemplos: dark hsl(220, 10%, 15%), medium hsl(220, 8%, 46%), light hsl(220, 14%, 96%)
- Accent: verde musgo suave para status positivos (adotado, vacinado)
  Exemplo: hsl(150, 40%, 40%)
- Danger: vermelho suave apenas para ações destrutivas confirmadas

### Regra de uso
- Máximo 3 tons de texto: escuro (principal), cinza médio (secundário),
  cinza claro (terciário/labels)
- Nunca usar cinza sobre fundo colorido — ajustar hue para manter legibilidade
- Definir todos os shades da paleta no tailwind.config.js antes de começar

## Tipografia

### Fonte
- Família: Inter ou Plus Jakarta Sans (Google Fonts)
- Filtrar por 10+ estilos disponíveis para ter todas as variações

### Escala de tamanho (type scale fixo — não inventar tamanhos)
- xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 20px,
  2xl: 24px, 3xl: 30px, 4xl: 36px, 5xl: 48px

### Pesos
- Usar apenas dois: 400 (normal) e 600-700 (ênfase)
- Nunca usar peso abaixo de 400 em textos de interface

### Linha e espaçamento
- Parágrafos: 45-75 caracteres por linha (usar max-w-prose ou max-w-xl)
- Line-height proporcional: maior para textos menores, menor para headings grandes
- Headings grandes: letter-spacing levemente negativo (-0.02em)
- Textos em maiúsculas: letter-spacing positivo (+0.05em a +0.1em)

## Espaçamento

### Sistema de base 4px (Tailwind já usa isso)
- Usar escala do Tailwind: 1=4px, 2=8px, 4=16px, 8=32px, 16=64px
- Começar com espaçamento generoso e reduzir — nunca adicionar mínimo

### Regra de agrupamento
- Espaço entre grupos sempre maior que espaço dentro do grupo
- Labels de formulário mais próximos do input abaixo do que do input acima

## Hierarquia de Ações

### Botões
- Primário: fundo sólido com cor de destaque, alto contraste
- Secundário: outline ou fundo com baixo contraste
- Terciário: estilo de link, sem fundo
- Destrutivo: tratamento secundário até a tela de confirmação,
  somente na confirmação usar vermelho/primário

## Cards de Animais

- Foto em destaque no topo (aspect-ratio fixo, object-cover)
- Nome em peso 600, tamanho lg
- Metadados (espécie, idade) em cinza médio, tamanho sm
- Status de adoção com badge colorido (accent para disponível)
- Box-shadow suave em vez de borda — shadow-sm ou shadow-md
- Hover com leve elevação (shadow-lg + translateY(-2px), transition suave)

## Imagens

### Fotos de animais
- Sempre object-cover com aspect-ratio definido (não deixar esticar)
- Em hero sections: adicionar overlay escuro semitransparente para
  garantir legibilidade do texto por cima
- Nunca usar placeholder genérico — sempre empty state desenhado

### Empty States
- Todo estado vazio deve ter: ícone/ilustração + título + chamada para ação
- Não mostrar filtros e abas quando não há conteúdo para exibir

## Profundidade e Camadas

- Preferir box-shadow a bordas para separar elementos
- Sombras em dois níveis: pequena (cards em repouso) e maior (hover/modal)
- Usar backgrounds ligeiramente diferentes para separar seções sem borda
- Sobreposição de elementos (overlap) em hero e seções destaque
  cria sensação de profundidade sem perder estilo flat

## Seções da Página

- Alternar background branco e cinza muito claro entre seções
- Usar accent border (4px de cor primária) no topo de cards ou seções especiais
- Não encher toda a largura — limitar conteúdo com max-w-7xl centralizado

## Animações

- Apenas animações funcionais e sutis: fade-in, slide suave em modais
- Duração máxima: 300ms
- Usar transition-all com ease-out

## Acessibilidade Visual

- Contraste mínimo WCAG AA em todos os textos
- Foco visível em todos os elementos interativos (outline customizado,
  não remover o padrão sem substituir)
- Alt descritivo em todas as imagens de animais
