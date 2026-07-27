# CHANGELOG-UI.md

Registro do projeto **Clinical Emergency Suite — UI 2.0**, fase a fase.

---

## Fase 0 — Mapeamento e rede de segurança ✅

**Data:** 2026-07-27 · **Base:** `1fe4bc4` · **Escopo:** nenhuma mudança visual.

### O que mudou

| Arquivo | O que é |
|---|---|
| `MAPA-APP.md` | Levantamento completo: stack, rotas, 28 módulos, telas, onde vivem timers/estado/voz/persistência, riscos e escolha do piloto |
| `NOTAS-LOGICA.md` | Bugs de lógica encontrados e **não corrigidos**, conforme a regra do plano |
| `playwright.config.ts` | Configuração do E2E (viewport Pixel 7, worker único, servidor automático) |
| `e2e/helpers.ts` | Helpers para dirigir React Native Web |
| `e2e/acls-fluxo.spec.ts` | Sequência de etapas do ACLS + ramo não chocável |
| `e2e/painel-timers.spec.ts` | Painel de acompanhamento e cronômetros |
| `e2e/registro-clinico.spec.ts` | Log clínico registra início do caso e choque |
| `e2e/voz.spec.ts` | Painel de voz alcançável e persistente |
| `e2e/modulos.spec.ts` | Os 28 módulos abrem, renderizam e não lançam exceção nova |
| `scripts/test-voice-intents.cjs` | Contrato transcrição → intent (43 verificações) |
| `scripts/serve-dist.cjs` | Servidor estático do build, sem dependência nova |
| `lib/ui-v2-flag.ts` | Feature flag `UI_V2` por módulo |
| `package.json` | Scripts `build:web`, `test:e2e`, `test:voice`, `test:i18n`, `test:all` |
| `.gitignore` | Artefatos do Playwright |

### O que NÃO foi tocado

Nada de lógica clínica. Sem alteração em: fluxo, ordem de telas, máquina de
estados, timers, comandos de voz, regras ACLS, doses, hooks, handlers,
assinaturas, variáveis, stores, rotas, banco ou sincronização. Nenhum arquivo de
`*-engine.ts`, `acls/` (exceto leitura), `components/` ou `app/` foi modificado
nesta fase.

### Rede de segurança resultante

```bash
npm run build:web && npm run test:e2e   # 38 testes E2E
npm run test:voice                       # 43 verificações de voz
npm run test:all                         # tudo, incluindo os testes que já existiam
```

**Estado: 38/38 E2E verdes (16 s) · 43/43 voz · 18/18 fluxo ACLS.**

Cobertura, contra o que o plano exigia na Fase 0.2:

| Exigido | Onde | Status |
|---|---|---|
| Protocolo avança na ordem correta | `acls-fluxo.spec.ts` | ✅ 8 etapas, do reconhecimento ao 1º choque |
| Timers iniciam, contam, alertam | `painel-timers.spec.ts` | ✅ tempo do caso monotônico + ciclo regressivo de 2 min |
| Comandos de voz: gatilho → ação | `scripts/test-voice-intents.cjs` | ✅ 18 gatilhos reais + rejeição de ruído |
| Registro de eventos persistido | `registro-clinico.spec.ts` | ✅ início do caso e choque, com horário |
| Painel reflete estado real | `painel-timers.spec.ts` | ✅ CHOQUES 0 → 1, epinefrina permanece 0 no 1º ciclo |

Extra não pedido, mas barato e valioso: `modulos.spec.ts` verifica os 28 módulos
a cada execução — é a rede que pega uma tela migrada quebrando em runtime.

### Achados

**1. Bug pré-existente: hydration mismatch em todas as 28 rotas de módulo.**
Registrado como **L-001** em `NOTAS-LOGICA.md`. Não corrigido, conforme a regra.
O HTML pré-renderizado de `/modulos/[id]` contém a landing, não o módulo — toda
rota de módulo renderiza duas vezes e pisca a landing antes. O E2E tolera este
erro específico como linha de base e falha em qualquer erro novo. **Resolver
L-001 aperta a rede de segurança de todas as fases seguintes.**

**2. O plano especifica bibliotecas que não funcionam nesta stack.**
shadcn/ui, Radix e Vaul são DOM-only; este app é React Native. Detalhado em
`MAPA-APP.md`, seção 1, com a tabela de equivalentes. **Precisa da sua decisão
antes da Fase 2.**

**3. Rótulos em caixa alta vêm do CSS, não do conteúdo.**
O DOM guarda "Ferramentas" e a tela mostra "FERRAMENTAS". Custou três testes
falhando até achar. Está documentado em `e2e/helpers.ts` — e importa para a
migração: trocar `textTransform` muda o que se lê sem mudar o DOM.

**4. Módulo piloto recomendado: `ritmos-acls` (Ritmos de Parada).**
Zero timers, zero voz, zero máquina de estados, zero persistência, zero decisão
clínica — é material de consulta. Justificativa em `MAPA-APP.md`, seção 6.

**5. Não usar um módulo `*-flow-screen` como piloto.** Os 17 arquivos têm 15
linhas cada e delegam para `module-flow-shell.tsx`. Mexer no shell migra 17
módulos de uma vez — o oposto de um piloto isolado.

### Feature flag

```bash
EXPO_PUBLIC_UI_V2=off             # padrão
EXPO_PUBLIC_UI_V2=ritmos-acls     # só o piloto
EXPO_PUBLIC_UI_V2=all             # tudo
```

No navegador, sem rebuild: `localStorage.setItem("ui-v2", "ritmos-acls")`.

A flag decide apenas qual árvore visual renderizar; os dois caminhos consomem o
mesmo engine.

---

## Correção do L-001 + decisão de stack ✅

**Data:** 2026-07-27 · **Autorizado pelo usuário** (o plano manda anotar em vez
de corrigir; ele pediu a correção explicitamente).

### L-001 corrigido

`generateStaticParams()` em `app/modulos/[id].tsx` enumera os 28 ids no build.
Cada módulo passou a ter o seu próprio HTML pré-renderizado, em vez de um único
`[id].html` genérico que continha a landing.

Resultado: fim do hydration mismatch, do render duplo e do flash da landing ao
abrir cada módulo. **A tolerância que `e2e/modulos.spec.ts` mantinha foi
removida** — a rede voltou a ser rígida.

`dist/modulos/` saiu de 1 arquivo para 29. Não afeta iOS/Android:
`generateStaticParams` só é chamado pelo exportador web.

### Decisão de stack (item 2 do plano, seção 1 do MAPA-APP.md)

**Padrão iOS/Android mantido.** Sem shadcn/ui, Radix, Tailwind ou Vaul. Tokens
como módulo TypeScript, tema por `useColorScheme()`, componentes próprios sobre
primitivas RN, `@gorhom/bottom-sheet` quando precisar. O resto do plano vale
integralmente.

### Verificação

| | |
|---|---|
| E2E local | 38/38 |
| **E2E contra produção** | **38/38** |
| Fluxo ACLS | 18/18 |
| Voz | 43/43 |
| i18n | 0 pendências |
| Bundle ES | 27/27 |
| tsc | limpo |

---

## Fase 1 — Design Tokens e Tema ✅

**Data:** 2026-07-27 · **Escopo:** puramente aditivo — nenhum componente
consome os tokens ainda, nenhuma tela mudou de aparência.

### O que mudou

| Arquivo | O que é |
|---|---|
| `design-system/tokens.ts` | Cor (2 temas), tipografia, espaçamento, raio, sombra, alvo de toque |
| `design-system/theme.ts` | `useTheme()` e `useEstilosDoTema()` |
| `scripts/valida-contraste.cjs` | Validação WCAG AA programática, nos dois temas |
| `package.json` | `test:contraste`, incluído no `test:all` |

### Adaptações ao plano, e por quê

**1. Não são CSS variables.** Não existem em React Native. São objetos
TypeScript; o tema ativo vem de `useTheme()`.

**2. Tipografia em dp, não em rem.** O plano pede rem "por acessibilidade". Em
RN o `fontSize` é em dp e **já escala com o ajuste de tamanho de fonte do
sistema** (`allowFontScaling` vem ligado) — é o mecanismo nativo equivalente, e o
correto para a plataforma escolhida. Os números são os mesmos do plano,
convertidos na base 16 (1.125rem = 18). Limitação registrada em `tokens.ts`: na
web isso vira px, que respeita zoom mas não a preferência de fonte padrão do
navegador; o ponto de mudança, se virar requisito, é uma linha.

**3. Inter ainda não é carregada.** Carregar exige mexer em `app/_layout.tsx`, e
gatilhar o render na conclusão do carregamento **reintroduziria o L-001** (HTML
do build diferente do primeiro render). Entra na Fase 2, junto com os
componentes que a usam, sem bloquear render. Até lá, fonte do sistema.

**4. `useTheme()` fixa o escuro por enquanto.** Os dois temas estão definidos e
validados, como o plano pede. Mas o app hoje é escuro por inteiro, e nas Fases
3–8 telas antigas e novas convivem: seguir o sistema agora faria quem usa o
aparelho no modo claro ver card claro dentro de tela escura. A troca é a Fase 9,
onde o plano a coloca — muda uma função.

### Contraste — 26/26 em AA

```bash
npm run test:contraste
```

A paleta do plano passou inteira. **Um ajuste foi necessário e o plano não o
previa:** no tema escuro, `primary` (#4D9AFF) e `critical` (#F87171) são cores
claras. Texto branco em cima delas dá **2,84:1 e 2,77:1** — reprova em AA. Criei
os tokens `onPrimary` e `onCritical` por tema; no escuro eles são #0B1220, o que
leva a 6,58:1 e 6,77:1.

Dois pares passam raspando e merecem atenção se alguém mexer na paleta:
`textSecondary` sobre `surface` no tema claro (**4,55:1**, mínimo 4,5) e a borda
sobre o fundo (**1,23:1**). Qualquer escurecida no `surface` claro derruba o
primeiro.

### Verificação

38/38 E2E · 26/26 contraste · 18/18 ACLS · 43/43 voz · i18n 0 · tsc limpo.

---

## Fase 2 — Componentes base ✅

**Data:** 2026-07-27 · **Escopo:** aditivo — nenhuma tela clínica foi tocada.

### O que mudou

16 componentes em `components/ui-v2/`, todos consumindo os tokens da Fase 1 e
sem conhecer engine, rota ou estado clínico:

`Button` · `Card` · `Input` · `NumericStepper` · `Modal` · `BottomSheet` ·
`Badge` · `Tag` · `Chip` · `Toast` · `FloatingButton` · `Header` ·
`BottomNavigation` · `Timer` · `Progress` · `Switch`

Mais o showcase em **`/dev/ui-v2`** e `e2e/ui-v2-showcase.spec.ts` (5 testes).

### Decisões que fugiram do texto do plano

**BottomSheet sobre o `Modal` do React Native, não `@gorhom/bottom-sheet`.**
O gorhom exige envolver a árvore num `GestureHandlerRootView` no layout raiz —
e `app/_layout.tsx` é exatamente onde mora o risco de reintroduzir o L-001. O
painel precisa mostrar texto clínico que não coube na tela, não simular física
de arrasto. Zero dependência nova, mesmo comportamento nas três plataformas.

**Slider: `@react-native-community/slider`** (única dependência adicionada).
É o padrão da plataforma e funciona em iOS, Android e web — verificado no
navegador, não presumido.

**Inter continua fora.** Analisei e recomendo **não adotar**: com
`@expo-google-fonts`, cada peso é uma família separada, então `fontWeight`
deixa de funcionar e todo componente passaria a declarar `fontFamily` por peso.
As fontes de sistema (San Francisco e Roboto) são altamente legíveis e são
literalmente "padrão iOS/Android", que foi a sua decisão. Se você quiser Inter
mesmo assim, dá para fazer — é só pedir.

### Achados

**1. Alvo de toque: os 16 componentes passam nos 44 px.** Verificado por teste,
não por inspeção. Mas o **cabeçalho do expo-router** traz uma seta de voltar de
**30×30** — abaixo do mínimo. Não é componente nosso; registrado como **L-004**
e resolve sozinho quando o `Header` compacto substituir esse cabeçalho na Fase 4.

**2. Contraste no tema escuro obrigou `onPrimary`/`onCritical` escuros** (já
registrado na Fase 1) — o `Badge` sólido e o `FloatingButton` dependem disso.

**3. Dois defeitos na minha própria varredura de i18n**, corrigidos:
- Ela lia **comentários**: `* Aviso — "falha ao salvar"` virava pendência.
  Agora remove comentários antes de extrair.
- O showcase é rota interna de desenvolvimento e não entra na tradução.

Confirmei que o filtro não cegou a varredura injetando uma frase nova: ela foi
detectada, e sumiu ao remover.

### Verificação

43/43 E2E (era 38) · 26/26 contraste · 18/18 ACLS · 43/43 voz · i18n 0 · tsc limpo.

---

## ⏸ Aguardando sua validação visual

O plano manda parar aqui. **Abra `/dev/ui-v2`** e diga o que muda:

- clinical-emergency-app.vercel.app/dev/ui-v2

A página mostra os 16 componentes e as duas paletas. Nenhuma tela do app foi
alterada — se algo não agradar, mudar agora custa quase nada; depois da Fase 3
custa em todas as telas migradas.

Com o seu aval, a Fase 3 migra o módulo piloto (`ritmos-acls`).
