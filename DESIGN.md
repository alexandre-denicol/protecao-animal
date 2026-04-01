# DESIGN.md — Diretrizes Visuais da Associação Amiga Miau

## Identidade Visual Oficial

### Logo
- Ilustração de gato e cachorro se abraçando em formato de coração
- Fundo circular lilás
- Arquivo: /public/logo.png (subir arquivo da logo real)
- Usar em: header (versão compacta), footer, página sobre

### Personalidade Visual
- Acolhedora, alegre e confiável
- Cartoon fofo sem ser infantil — profissional mas humano
- Inspira afeto e confiança, não frieza institucional

## Paleta de Cores Oficial

### Definir no tailwind.config.js:
```javascript
colors: {
  primary: {
    50:  '#F5F0FF',
    100: '#EDE0FF',
    200: '#DCC8FF',
    300: '#C8A8E8', // cor principal da logo
    400: '#B088D4',
    500: '#9868C0',
    600: '#7A4EA0',
    700: '#5C3880',
    800: '#3E2460',
    900: '#201040',
  },
  amber: {
    300: '#F5C878',
    400: '#F0A850',
    500: '#E8934A', // laranja do gato
    600: '#D07830',
    700: '#B05820',
  },
  salmon: {
    300: '#F8A898',
    400: '#F48878',
    500: '#F07850', // rosa salmão bochecha
    600: '#D05838',
  },
  // Neutrals com leve tom quente
  neutral: {
    50:  '#FAFAF8',
    100: '#F5F4F0',
    200: '#E8E6E0',
    300: '#D0CEC8',
    400: '#A8A49C',
    500: '#807C74',
    600: '#58544C',
    700: '#383430',
    800: '#201E1A',
    900: '#100E0C',
  }
}
```

### Uso das cores
- **primary-300** (#C8A8E8): cor de marca, botões primários, badges, destaques
- **amber-500** (#E8934A): CTAs secundários, ícones de ação, hover states
- **salmon-500** (#F07850): alertas positivos, tags especiais
- **neutral-50**: background padrão das páginas
- **neutral-100**: background de seções alternadas, cards
- **neutral-700/800**: texto principal
- **neutral-500**: texto secundário

## Tipografia

### Fonte Principal
- Família: **Plus Jakarta Sans** (Google Fonts)
- Import: weights 400, 500, 600, 700, 800

### Escala de tamanho (definir no tailwind.config.js)
- xs: 12px | sm: 14px | base: 16px | lg: 18px
- xl: 20px | 2xl: 24px | 3xl: 30px | 4xl: 36px | 5xl: 48px

### Regras
- Dois pesos apenas: 400 (normal) e 600-700 (ênfase)
- Headings grandes: letter-spacing levemente negativo (-0.02em)
- Parágrafos: max-w-prose (65ch) para boa leitura
- Line-height: 1.5 para body, 1.2 para headings grandes

## Espaçamento
- Sistema base 4px (Tailwind padrão)
- Começar generoso, reduzir se necessário
- Seções da página: padding vertical py-16 (desktop) py-10 (mobile)
- Espaço entre grupos sempre maior que espaço interno

## Header e Navegação

### Desktop
- Logo à esquerda + nome "Amiga Miau" em texto
- Links de navegação centralizados ou à direita
- Botão "Quero adotar" destacado com primary-300
- Fundo branco com sombra suave ao rolar (shadow-sm)
- Posição: sticky no topo

### Mobile (breakpoint < 768px)
- Logo + nome à esquerda
- Ícone hamburger (3 linhas) à direita
- Menu abre como drawer lateral ou dropdown suave
- Botão "Quero adotar" visível dentro do menu mobile

## Cards de Animais
- Foto em aspect-ratio 4/3, object-cover, rounded-xl
- Nome: font-semibold text-lg text-neutral-800
- Metadados (espécie, idade): text-sm text-neutral-500
- Badge de status: rounded-full, cores por status:
  - Disponível: bg-green-100 text-green-700
  - Em processo: bg-amber-100 text-amber-700
  - Adotado: bg-neutral-100 text-neutral-500
- Box-shadow suave (shadow-md), sem borda
- Hover: shadow-lg + translateY(-2px), transition 200ms ease-out

## Botões
- Primário: bg-primary-300 text-white font-semibold
  hover:bg-primary-400, rounded-xl, px-6 py-3
- Secundário: border-2 border-primary-300 text-primary-500
  hover:bg-primary-50, rounded-xl
- Terciário: text-primary-500 underline, sem fundo
- Destrutivo: só vermelho na tela de confirmação

## Seções da Home
- Alternar: fundo branco e fundo neutral-50
- Hero: imagem com overlay gradient sutil para legibilidade do texto
- Seção de destaque (animais em destaque): fundo neutral-100
- Seção PIX/doação: fundo primary-50 com accent border top primary-300

## Imagens
- Sempre object-cover com aspect-ratio definido
- Hero: overlay `bg-black/30` para texto legível
- Empty states: ilustração simples + título + CTA
  (nunca deixar estado vazio sem tratamento visual)

## Profundidade
- Preferir shadow a border para separar elementos
- Dois níveis: shadow-md (repouso) e shadow-lg (hover/foco)
- Seções separadas por background diferente, não por linha/borda

## Animações
- Somente fade-in e slide suave (translateY)
- Duração máxima 300ms, ease-out
- Não usar animações em ações destrutivas ou alertas de erro

## Acessibilidade
- Contraste WCAG AA obrigatório em todos os textos
- Focus ring visível em todos os elementos interativos
  (outline-2 outline-primary-300 outline-offset-2)
- Alt descritivo em todas as imagens de animais
- Links externos: sempre rel="noopener noreferrer"
